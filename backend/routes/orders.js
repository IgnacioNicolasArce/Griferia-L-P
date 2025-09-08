const express = require('express');
const { body, validationResult } = require('express-validator');
const { db } = require('../models/database-simple');
const { authenticateToken } = require('./auth');
const nodemailer = require('nodemailer');
const config = require('../config');

const router = express.Router();

// Configuración de nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: config.EMAIL_USER,
    pass: config.EMAIL_PASS
  }
});

// Crear orden
router.post('/', authenticateToken, [
  body('items').isArray({ min: 1 }).withMessage('Debe incluir al menos un producto'),
  body('shipping_address').notEmpty().withMessage('La dirección de envío es requerida')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { items, shipping_address } = req.body;
  const userId = req.user.id;

  // Calcular total
  let total = 0;
  for (const item of items) {
    total += item.price * item.quantity;
  }

  // Crear orden
  db.run('INSERT INTO orders (user_id, total, shipping_address) VALUES (?, ?, ?)',
    [userId, total, shipping_address], function(err) {
    if (err) {
      return res.status(500).json({ message: 'Error al crear orden' });
    }

    const orderId = this.lastID;

    // Crear items de la orden y actualizar stock
    let completed = 0;
    let hasError = false;

    for (const item of items) {
      // Verificar stock disponible
      db.get('SELECT stock FROM products WHERE id = ?', [item.product_id], (err, product) => {
        if (err || !product) {
          hasError = true;
          return res.status(400).json({ message: 'Producto no encontrado' });
        }

        if (product.stock < item.quantity) {
          hasError = true;
          return res.status(400).json({ message: 'Stock insuficiente' });
        }

        // Crear item de orden
        db.run('INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
          [orderId, item.product_id, item.quantity, item.price], (err) => {
          if (err) {
            hasError = true;
            return res.status(500).json({ message: 'Error al crear item de orden' });
          }

          // Actualizar stock
          db.run('UPDATE products SET stock = stock - ? WHERE id = ?',
            [item.quantity, item.product_id], (err) => {
            if (err) {
              hasError = true;
              return res.status(500).json({ message: 'Error al actualizar stock' });
            }

            completed++;
            if (completed === items.length && !hasError) {
              // Enviar emails de confirmación
              sendConfirmationEmails(orderId, userId, items, total, shipping_address);
              res.json({ message: 'Orden creada exitosamente', orderId });
            }
          });
        });
      });
    }
  });
});

// Obtener órdenes del usuario
router.get('/my-orders', authenticateToken, (req, res) => {
  const userId = req.user.id;

  db.all(`
    SELECT o.*, oi.quantity, oi.price, p.name as product_name, p.image_url
    FROM orders o
    JOIN order_items oi ON o.id = oi.order_id
    JOIN products p ON oi.product_id = p.id
    WHERE o.user_id = ?
    ORDER BY o.created_at DESC
  `, [userId], (err, orders) => {
    if (err) {
      return res.status(500).json({ message: 'Error al obtener órdenes' });
    }

    // Agrupar items por orden
    const groupedOrders = {};
    orders.forEach(order => {
      if (!groupedOrders[order.id]) {
        groupedOrders[order.id] = {
          id: order.id,
          total: order.total,
          status: order.status,
          shipping_address: order.shipping_address,
          created_at: order.created_at,
          items: []
        };
      }
      groupedOrders[order.id].items.push({
        product_name: order.product_name,
        quantity: order.quantity,
        price: order.price,
        image_url: order.image_url
      });
    });

    res.json(Object.values(groupedOrders));
  });
});

// Obtener todas las órdenes (solo admin)
router.get('/all', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Acceso denegado' });
  }

  db.all(`
    SELECT o.*, u.name as user_name, u.email as user_email
    FROM orders o
    JOIN users u ON o.user_id = u.id
    ORDER BY o.created_at DESC
  `, (err, orders) => {
    if (err) {
      return res.status(500).json({ message: 'Error al obtener órdenes' });
    }

    res.json(orders);
  });
});

// Función para enviar emails de confirmación
function sendConfirmationEmails(orderId, userId, items, total, shippingAddress) {
  // Obtener datos del usuario
  db.get('SELECT * FROM users WHERE id = ?', [userId], (err, user) => {
    if (err) return;

    // Email al cliente
    const clientMailOptions = {
      from: config.EMAIL_USER,
      to: user.email,
      subject: 'Confirmación de Compra - Grifería L&P',
      html: `
        <h2>¡Gracias por tu compra!</h2>
        <p>Hola ${user.name},</p>
        <p>Tu orden #${orderId} ha sido procesada exitosamente.</p>
        <h3>Detalles de la compra:</h3>
        <ul>
          ${items.map(item => `<li>${item.name} - Cantidad: ${item.quantity} - Precio: $${item.price}</li>`).join('')}
        </ul>
        <p><strong>Total: $${total}</strong></p>
        <p><strong>Dirección de envío:</strong> ${shippingAddress}</p>
        <p>Te contactaremos pronto para coordinar la entrega.</p>
      `
    };

    // Email al admin
    const adminMailOptions = {
      from: config.EMAIL_USER,
      to: 'admin@griferia.com',
      subject: 'Nueva Orden - Grifería L&P',
      html: `
        <h2>Nueva Orden Recibida</h2>
        <p>Cliente: ${user.name} (${user.email})</p>
        <p>Orden #${orderId}</p>
        <h3>Productos:</h3>
        <ul>
          ${items.map(item => `<li>${item.name} - Cantidad: ${item.quantity} - Precio: $${item.price}</li>`).join('')}
        </ul>
        <p><strong>Total: $${total}</strong></p>
        <p><strong>Dirección de envío:</strong> ${shippingAddress}</p>
      `
    };

    transporter.sendMail(clientMailOptions);
    transporter.sendMail(adminMailOptions);
  });
}

module.exports = router;
