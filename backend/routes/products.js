const express = require('express');
const { body, validationResult } = require('express-validator');
const { db, writeDB } = require('../models/database-render');
const { authenticateToken } = require('./auth');

const router = express.Router();

// Obtener todos los productos
router.get('/', async (req, res) => {
  try {
    const products = await db.all('SELECT * FROM products ORDER BY created_at DESC');
    res.json(products);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ message: 'Error al obtener productos' });
  }
});

// Obtener producto por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Getting product by ID:', id);
    
    const result = await db.get('SELECT * FROM products WHERE id = ?', [id]);
    const product = result.value();
    console.log('Product found:', product);
    
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    
    res.json(product);
  } catch (error) {
    console.error('Error al obtener producto:', error);
    res.status(500).json({ message: 'Error al obtener producto' });
  }
});

// Crear producto (solo admin)
router.post('/', authenticateToken, [
  body('name').notEmpty().withMessage('El nombre es requerido'),
  body('price').isNumeric().withMessage('El precio debe ser un número'),
  body('stock').isInt({ min: 0 }).withMessage('El stock debe ser un número entero positivo')
], async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Acceso denegado' });
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, description, price, stock, image_url, category } = req.body;
    console.log('Creating product:', { name, description, price, stock, image_url, category });

    // Usar la función db.run para crear el producto
    const result = await db.run(
      'INSERT INTO products (name, description, price, stock, image_url, category, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, description, parseFloat(price), parseInt(stock), image_url, category, new Date().toISOString()]
    );
    
    console.log('Product created successfully with ID:', result.lastID);

    // Obtener el producto creado
    const newProduct = await db.get('SELECT * FROM products WHERE id = ?', [result.lastID]);
    
    res.status(201).json({ 
      message: 'Producto creado exitosamente',
      product: newProduct.value()
    });
  } catch (error) {
    console.error('Error al crear producto:', error);
    res.status(500).json({ message: 'Error al crear producto' });
  }
});

// Actualizar producto (solo admin)
router.put('/:id', authenticateToken, [
  body('name').notEmpty().withMessage('El nombre es requerido'),
  body('price').isNumeric().withMessage('El precio debe ser un número'),
  body('stock').isInt({ min: 0 }).withMessage('El stock debe ser un número entero positivo')
], async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Acceso denegado' });
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { id } = req.params;
    const { name, description, price, stock, image_url, category } = req.body;
    
    console.log('Updating product ID:', id);
    console.log('Update data:', { name, description, price, stock, image_url, category });

    // Usar la función db.run para actualizar el producto
    const result = await db.run(
      'UPDATE products SET name = ?, description = ?, price = ?, stock = ?, image_url = ?, category = ?, updated_at = ? WHERE id = ?',
      [name, description, parseFloat(price), parseInt(stock), image_url, category, new Date().toISOString(), id]
    );
    
    if (result.changes === 0) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    
    console.log('Product updated successfully');

    res.json({ message: 'Producto actualizado exitosamente' });
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    res.status(500).json({ message: 'Error al actualizar producto' });
  }
});

// Eliminar producto (solo admin)
router.delete('/:id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Acceso denegado' });
  }

  try {
    const { id } = req.params;
    console.log('Deleting product ID:', id);

    // Usar la función db.run para eliminar el producto
    const result = await db.run('DELETE FROM products WHERE id = ?', [id]);
    
    if (result.changes === 0) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    
    console.log('Product deleted successfully');

    res.json({ message: 'Producto eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    res.status(500).json({ message: 'Error al eliminar producto' });
  }
});

module.exports = router;
