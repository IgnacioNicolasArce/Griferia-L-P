const express = require('express');
const { body, validationResult } = require('express-validator');
const { supabase } = require('../models/database-supabase');
const { authenticateToken } = require('./auth');

const router = express.Router();

// Obtener todos los productos
router.get('/', async (req, res) => {
  try {
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error al obtener productos:', error);
      return res.status(500).json({ message: 'Error al obtener productos' });
    }
    
    res.json(products || []);
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
    
    const { data: product, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error al obtener producto:', error);
      return res.status(500).json({ message: 'Error al obtener producto' });
    }
    
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

    const { data: newProduct, error } = await supabase
      .from('products')
      .insert({
        name,
        description,
        price: parseFloat(price),
        stock: parseInt(stock),
        image_url,
        category
      })
      .select()
      .single();

    if (error) {
      console.error('Error al crear producto:', error);
      return res.status(500).json({ message: 'Error al crear producto' });
    }
    
    console.log('Product created successfully:', newProduct);
    
    res.status(201).json({ 
      message: 'Producto creado exitosamente',
      product: newProduct
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

    const { data: updatedProduct, error } = await supabase
      .from('products')
      .update({
        name,
        description,
        price: parseFloat(price),
        stock: parseInt(stock),
        image_url,
        category,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error al actualizar producto:', error);
      return res.status(500).json({ message: 'Error al actualizar producto' });
    }
    
    if (!updatedProduct) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    
    console.log('Product updated successfully');

    res.json({ 
      message: 'Producto actualizado exitosamente',
      product: updatedProduct
    });
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

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error al eliminar producto:', error);
      return res.status(500).json({ message: 'Error al eliminar producto' });
    }
    
    console.log('Product deleted successfully');

    res.json({ message: 'Producto eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    res.status(500).json({ message: 'Error al eliminar producto' });
  }
});

module.exports = router;
