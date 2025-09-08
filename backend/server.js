const express = require('express');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./routes/auth');
const { authenticateToken } = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const contactRoutes = require('./routes/contact');
const { initDatabase } = require('./models/database-render');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Ruta de healthcheck para Railway
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Grifería L&P API is running',
    timestamp: new Date().toISOString()
  });
});

// Ruta de debug para verificar la base de datos
app.get('/debug', async (req, res) => {
  try {
    const { db } = require('./models/database-render');
    const products = await db.all('SELECT * FROM products');
    const users = await db.all('SELECT * FROM users');
    
    res.json({
      status: 'OK',
      products: products,
      users: users,
      productsCount: products.length,
      usersCount: users.length,
      dbPath: process.env.NODE_ENV === 'production' ? '/tmp/db.json' : path.join(__dirname, '../../database/db.json')
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      error: error.message
    });
  }
});

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/contact', contactRoutes);

// Ruta para servir la aplicación frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Inicializar base de datos y servidor
initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Grifería L&P - Servidor corriendo en puerto ${PORT}`);
  });
}).catch(err => {
  console.error('Error al inicializar la base de datos:', err);
});
