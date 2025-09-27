const express = require('express');
const router = express.Router();
const { mercadopago } = require('../config/mercadopago');
const { supabase } = require('../models/database-supabase');

// Endpoint para crear preferencia de pago
router.post('/create-preference', async (req, res) => {
    try {
        const { items, user_id, shipping_address } = req.body;

        // Validar datos
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Items del carrito son requeridos' 
            });
        }

        // Calcular total
        const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        // Crear items para Mercado Pago
        const preference = {
            items: items.map(item => ({
                title: item.name,
                unit_price: item.price,
                quantity: item.quantity,
                currency_id: 'ARS', // Peso argentino
                description: `Producto: ${item.name}`
            })),
            payer: {
                name: req.user?.name || 'Cliente',
                email: req.user?.email || 'cliente@ejemplo.com'
            },
            back_urls: {
                success: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/success`,
                failure: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/failure`,
                pending: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/pending`
            },
            auto_return: 'approved',
            external_reference: `order_${Date.now()}_${user_id || 'guest'}`,
            notification_url: `${process.env.BACKEND_URL || 'http://localhost:3000'}/api/payments/webhook`,
            metadata: {
                user_id: user_id || 'guest',
                shipping_address: shipping_address || '',
                total_amount: total
            }
        };

        // Crear preferencia en Mercado Pago
        const response = await mercadopago.preferences.create(preference);

        // Guardar orden en la base de datos (pendiente de pago)
        const orderData = {
            user_id: user_id || null,
            status: 'pending_payment',
            total: total,
            shipping_address: shipping_address || '',
            payment_method: 'mercadopago',
            payment_id: response.body.id,
            external_reference: preference.external_reference,
            items: JSON.stringify(items)
        };

        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert(orderData)
            .select()
            .single();

        if (orderError) {
            console.error('Error creando orden:', orderError);
            return res.status(500).json({ 
                success: false, 
                message: 'Error creando orden' 
            });
        }

        res.json({
            success: true,
            preference_id: response.body.id,
            init_point: response.body.init_point,
            sandbox_init_point: response.body.sandbox_init_point,
            order_id: order.id
        });

    } catch (error) {
        console.error('Error creando preferencia de pago:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error interno del servidor',
            error: error.message 
        });
    }
});

// Webhook para recibir notificaciones de Mercado Pago
router.post('/webhook', async (req, res) => {
    try {
        const { type, data } = req.body;

        if (type === 'payment') {
            const paymentId = data.id;
            
            // Obtener información del pago
            const payment = await mercadopago.payment.findById(paymentId);
            const paymentData = payment.body;

            // Buscar orden por external_reference
            const externalRef = paymentData.external_reference;
            const { data: order, error: orderError } = await supabase
                .from('orders')
                .select('*')
                .eq('external_reference', externalRef)
                .single();

            if (orderError || !order) {
                console.error('Orden no encontrada:', externalRef);
                return res.status(404).json({ message: 'Orden no encontrada' });
            }

            // Actualizar estado de la orden
            let orderStatus = 'pending';
            if (paymentData.status === 'approved') {
                orderStatus = 'paid';
            } else if (paymentData.status === 'rejected') {
                orderStatus = 'cancelled';
            } else if (paymentData.status === 'pending') {
                orderStatus = 'pending_payment';
            }

            const { error: updateError } = await supabase
                .from('orders')
                .update({
                    status: orderStatus,
                    payment_status: paymentData.status,
                    payment_id: paymentId,
                    updated_at: new Date().toISOString()
                })
                .eq('id', order.id);

            if (updateError) {
                console.error('Error actualizando orden:', updateError);
                return res.status(500).json({ message: 'Error actualizando orden' });
            }

            console.log(`Orden ${order.id} actualizada a estado: ${orderStatus}`);
        }

        res.status(200).json({ message: 'Webhook procesado correctamente' });

    } catch (error) {
        console.error('Error procesando webhook:', error);
        res.status(500).json({ message: 'Error procesando webhook' });
    }
});

// Endpoint para obtener estado de un pago
router.get('/payment-status/:paymentId', async (req, res) => {
    try {
        const { paymentId } = req.params;

        const { data: order, error } = await supabase
            .from('orders')
            .select('*')
            .eq('payment_id', paymentId)
            .single();

        if (error || !order) {
            return res.status(404).json({ 
                success: false, 
                message: 'Orden no encontrada' 
            });
        }

        res.json({
            success: true,
            order: {
                id: order.id,
                status: order.status,
                payment_status: order.payment_status,
                total: order.total,
                created_at: order.created_at
            }
        });

    } catch (error) {
        console.error('Error obteniendo estado de pago:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error interno del servidor' 
        });
    }
});

module.exports = router;
