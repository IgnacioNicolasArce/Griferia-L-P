const express = require('express');
const { body, validationResult } = require('express-validator');
const { db } = require('../models/database-render');
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

    const result = await db.run('INSERT INTO products (name, description, price, stock, image_url, category) VALUES (?, ?, ?, ?, ?, ?)',
      [{ name, description, price, stock, image_url, category }]);
    
    console.log('Product created with result:', result);

    res.status(201).json({ 
      message: 'Producto creado exitosamente',
      product: { id: result.lastID, name, description, price, stock, image_url, category }
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

    // Leer la base de datos directamente para actualizar
    const fs = require('fs');
    const path = require('path');
    const dbPath = process.env.NODE_ENV === 'production' ? '/tmp/db.json' : path.join(__dirname, '../../database/db.json');
    
    let data;
    try {
      data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    } catch (err) {
      console.error('Error reading database:', err);
      return res.status(500).json({ message: 'Error del servidor' });
    }
    
    // Buscar y actualizar el producto
    const productIndex = data.products.findIndex(p => p.id == id);
    if (productIndex === -1) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    
    // Actualizar el producto
    data.products[productIndex] = {
      ...data.products[productIndex],
      name,
      description,
      price: parseFloat(price),
      stock: parseInt(stock),
      image_url,
      category,
      updated_at: new Date().toISOString()
    };
    
    // Guardar la base de datos
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
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

    // Leer la base de datos directamente para eliminar
    const fs = require('fs');
    const path = require('path');
    const dbPath = process.env.NODE_ENV === 'production' ? '/tmp/db.json' : path.join(__dirname, '../../database/db.json');
    
    let data;
    try {
      data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    } catch (err) {
      console.error('Error reading database:', err);
      return res.status(500).json({ message: 'Error del servidor' });
    }
    
    // Buscar y eliminar el producto
    const productIndex = data.products.findIndex(p => p.id == id);
    if (productIndex === -1) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    
    // Eliminar el producto
    data.products.splice(productIndex, 1);
    
    // Guardar la base de datos
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
    console.log('Product deleted successfully');

    res.json({ message: 'Producto eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    res.status(500).json({ message: 'Error al eliminar producto' });
  }
});

module.exports = router;
