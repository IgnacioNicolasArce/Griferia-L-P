const express = require('express');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./routes/auth');
const { authenticateToken } = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const contactRoutes = require('./routes/contact');
const paymentRoutes = require('./routes/payments');
const { configureMercadoPago } = require('./config/mercadopago');
const { initDatabase, migrateFromJSON } = require('./models/database-supabase');

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
    const { supabase } = require('./models/database-supabase');
    const { data: products } = await supabase.from('products').select('*');
    const { data: users } = await supabase.from('users').select('*');
    
    res.json({
      status: 'OK',
      products: products || [],
      users: users || [],
      productsCount: products?.length || 0,
      usersCount: users?.length || 0,
      database: 'Supabase'
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      error: error.message
    });
  }
});

// Ruta para forzar la inicialización de la base de datos
app.get('/init-db', async (req, res) => {
  try {
    console.log('Forcing database initialization...');
    await initDatabase();

    const { supabase } = require('./models/database-supabase');
    const { data: products } = await supabase.from('products').select('*');
    const { data: users } = await supabase.from('users').select('*');

    res.json({
      status: 'SUCCESS',
      message: 'Database initialized successfully',
      products: products || [],
      users: users || [],
      productsCount: products?.length || 0,
      usersCount: users?.length || 0,
      database: 'Supabase'
    });
  } catch (error) {
    console.error('Error initializing database:', error);
    res.status(500).json({
      status: 'ERROR',
      error: error.message
    });
  }
});

// Ruta para probar el login del admin
app.post('/test-login', async (req, res) => {
  try {
    const { supabase } = require('./models/database-supabase');
    const email = 'admin@griferia.com';
    
    console.log('Testing admin login...');
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    console.log('Test login result:', user);
    
    if (error) {
      console.error('Error testing login:', error);
      return res.status(500).json({
        status: 'ERROR',
        error: error.message
      });
    }
    
    res.json({
      status: 'SUCCESS',
      email: email,
      user: user,
      hasUser: !!user,
      userRole: user ? user.role : 'none'
    });
  } catch (error) {
    console.error('Error testing login:', error);
    res.status(500).json({
      status: 'ERROR',
      error: error.message
    });
  }
});

// Ruta para migrar datos desde JSON
app.post('/migrate-from-json', async (req, res) => {
  try {
    console.log('Starting migration from JSON...');
    await migrateFromJSON();
    
    res.json({
      status: 'SUCCESS',
      message: 'Migration completed successfully'
    });
  } catch (error) {
    console.error('Error during migration:', error);
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
app.use('/api/payments', paymentRoutes);

// Ruta para servir la aplicación frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Inicializar base de datos y servidor
initDatabase().then(() => {
  // Configurar Mercado Pago (opcional)
  try {
    configureMercadoPago();
    console.log(`💳 Mercado Pago: Configurado`);
  } catch (error) {
    console.log(`⚠️ Mercado Pago: No disponible (${error.message})`);
  }
  
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Grifería L&P - Servidor corriendo en puerto ${PORT}`);
    console.log(`📊 Base de datos: Supabase`);
    console.log(`🌐 Accesible desde la red local en: http://192.168.0.37:${PORT}`);
    console.log(`🔗 Accesible desde localhost en: http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('Error al inicializar la base de datos:', err);
});
