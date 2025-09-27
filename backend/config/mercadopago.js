const mercadopago = require('mercadopago');

// Configurar Mercado Pago
const configureMercadoPago = () => {
    // Configurar con el access token
    mercadopago.configure({
        access_token: process.env.MERCADOPAGO_ACCESS_TOKEN || 'TEST-123456789-abcdefghijklmnopqrstuvwxyz-12345678'
    });
    
    console.log('✅ Mercado Pago configurado correctamente');
};

module.exports = {
    configureMercadoPago,
    mercadopago
};
