const express = require('express');
const { body, validationResult } = require('express-validator');
const { db } = require('../models/database-simple');
const { authenticateToken } = require('./auth');

const router = express.Router();

// Obtener todos los productos
router.get('/', (req, res) => {
  db.all('SELECT * FROM products ORDER BY created_at DESC', (err, products) => {
    if (err) {
      return res.status(500).json({ message: 'Error al obtener productos' });
    }
    res.json(products);
  });
});

// Obtener producto por ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  
  db.get('SELECT * FROM products WHERE id = ?', [id], (err, product) => {
    if (err) {
      return res.status(500).json({ message: 'Error al obtener producto' });
    }
    
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    
    res.json(product);
  });
});

// Crear producto (solo admin)
router.post('/', authenticateToken, [
  body('name').notEmpty().withMessage('El nombre es requerido'),
  body('price').isNumeric().withMessage('El precio debe ser un número'),
  body('stock').isInt({ min: 0 }).withMessage('El stock debe ser un número entero positivo')
], (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Acceso denegado' });
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, description, price, stock, image_url, category } = req.body;

  db.run('INSERT INTO products (name, description, price, stock, image_url, category) VALUES (?, ?, ?, ?, ?, ?)',
    [name, description, price, stock, image_url, category], function(err) {
    if (err) {
      return res.status(500).json({ message: 'Error al crear producto' });
    }

    res.status(201).json({ 
      message: 'Producto creado exitosamente',
      product: { id: this.lastID, name, description, price, stock, image_url, category }
    });
  });
});

// Actualizar producto (solo admin)
router.put('/:id', authenticateToken, [
  body('name').notEmpty().withMessage('El nombre es requerido'),
  body('price').isNumeric().withMessage('El precio debe ser un número'),
  body('stock').isInt({ min: 0 }).withMessage('El stock debe ser un número entero positivo')
], (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Acceso denegado' });
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;
  const { name, description, price, stock, image_url, category } = req.body;

  db.run('UPDATE products SET name = ?, description = ?, price = ?, stock = ?, image_url = ?, category = ? WHERE id = ?',
    [name, description, price, stock, image_url, category, id], function(err) {
    if (err) {
      return res.status(500).json({ message: 'Error al actualizar producto' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    res.json({ message: 'Producto actualizado exitosamente' });
  });
});

// Eliminar producto (solo admin)
router.delete('/:id', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Acceso denegado' });
  }

  const { id } = req.params;

  db.run('DELETE FROM products WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ message: 'Error al eliminar producto' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    res.json({ message: 'Producto eliminado exitosamente' });
  });
});

module.exports = router;
