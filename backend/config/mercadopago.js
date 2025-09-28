// Configurar Mercado Pago
const configureMercadoPago = () => {
    try {
        // Verificar si Mercado Pago está disponible
        const mercadopago = require('mercadopago');
        
        if (typeof mercadopago.configure === 'function') {
            // Versión antigua del SDK
            mercadopago.configure({
                access_token: process.env.MERCADOPAGO_ACCESS_TOKEN || 'APP_USR-5519083201747623-092719-a92af987bd597ecb1586f95a53c4c8ae-2718367304'
            });
            console.log('✅ Mercado Pago configurado (versión antigua)');
            return mercadopago;
        } else {
            console.log('⚠️ Mercado Pago SDK no disponible');
            return null;
        }
    } catch (error) {
        console.error('❌ Error configurando Mercado Pago:', error.message);
        console.log('⚠️ Continuando sin Mercado Pago...');
        return null;
    }
};

module.exports = {
    configureMercadoPago
};
