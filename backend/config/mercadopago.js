const mercadopago = require('mercadopago');

// Configurar Mercado Pago
const configureMercadoPago = () => {
    // Configurar con el access token
    mercadopago.configure({
        access_token: process.env.MERCADOPAGO_ACCESS_TOKEN || 'APP_USR-5519083201747623-092719-a92af987bd597ecb1586f95a53c4c8ae-2718367304'
    });
    
    console.log('✅ Mercado Pago configurado correctamente');
};

module.exports = {
    configureMercadoPago,
    mercadopago
};
