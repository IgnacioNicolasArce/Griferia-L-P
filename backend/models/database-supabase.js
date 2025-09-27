const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

// Configuración de Supabase
const supabaseUrl = 'https://elfgaqydhlulttrbthys.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsZmdhcXlkaGx1bHR0cmJ0aHlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwMDgyODYsImV4cCI6MjA3NDU4NDI4Nn0.eDMW-E1nrCz5QE1KHCLGb40ZKM3ubMlm17F6kCruhqo';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables de entorno de Supabase no configuradas');
  console.error('Necesitas configurar:');
  console.error('- SUPABASE_KEY');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Función para inicializar la base de datos
const initDatabase = async () => {
  try {
    console.log('🚀 Inicializando base de datos Supabase...');
    
    // Verificar conexión
    const { data, error } = await supabase.from('users').select('count').limit(1);
    if (error) {
      console.error('❌ Error conectando a Supabase:', error.message);
      throw error;
    }
    
    console.log('✅ Conexión a Supabase establecida');
    
    // Verificar si ya existe el usuario admin
    const { data: adminUser } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'admin@griferia.com')
      .single();
    
    if (!adminUser) {
      console.log('👤 Usuario admin no encontrado');
      console.log('⚠️  El usuario admin debe crearse manualmente debido a las políticas RLS');
      console.log('📝 Puedes crear el usuario admin desde el dashboard de Supabase o usar la clave service_role');
      
      // Crear usuario admin temporal para testing
      console.log('🔧 Creando usuario admin temporal para testing...');
      try {
        const adminPassword = bcrypt.hashSync('admin123', 10);
        // Usar una query SQL directa para bypassar RLS
        const { error: insertError } = await supabase.rpc('create_admin_user', {
          admin_name: 'Admin',
          admin_email: 'admin@griferia.com',
          admin_password: adminPassword,
          admin_role: 'admin'
        });
        
        if (insertError) {
          console.log('⚠️  No se pudo crear el usuario admin automáticamente');
          console.log('📝 Usa el SQL Editor en Supabase para crear el usuario admin');
        } else {
          console.log('✅ Usuario admin creado exitosamente');
        }
      } catch (err) {
        console.log('⚠️  Error creando usuario admin:', err.message);
      }
    } else {
      console.log('✅ Usuario administrador ya existe');
    }
    
    // Verificar si ya existen productos
    const { data: products } = await supabase.from('products').select('*').limit(1);
    
    if (!products || products.length === 0) {
      console.log('📦 Insertando productos de ejemplo...');
      
      const sampleProducts = [
        {
          name: 'Grifo de Cocina Moderno',
          description: 'Grifo de cocina con tecnología de ahorro de agua y diseño moderno',
          price: 25000,
          stock: 15,
          image_url: 'data:image/jpeg;base64,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',
          category: 'Cocina'
        },
        {
          name: 'Ducha de Lluvia',
          description: 'Ducha de lluvia con múltiples chorros y regulador de temperatura',
          price: 45000,
          stock: 8,
          image_url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&h=300&fit=crop&crop=center',
          category: 'Baño'
        },
        {
          name: 'Lavamanos de Pedestal',
          description: 'Lavamanos elegante de porcelana con grifo incluido',
          price: 35000,
          stock: 12,
          image_url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop&crop=center',
          category: 'Baño'
        },
        {
          name: 'Grifo de Baño',
          description: 'Grifo de baño con acabado cromado y válvula de ahorro',
          price: 18000,
          stock: 20,
          image_url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&h=300&fit=crop&crop=center',
          category: 'Baño'
        },
        {
          name: 'Accesorio de Ducha',
          description: 'Set completo de accesorios para ducha con porta jabón',
          price: 12000,
          stock: 25,
          image_url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&h=300&fit=crop&crop=center',
          category: 'Accesorios'
        }
      ];
      
      const { error: insertError } = await supabase
        .from('products')
        .insert(sampleProducts);
      
      if (insertError) {
        console.error('❌ Error insertando productos:', insertError.message);
        throw insertError;
      }
      console.log('✅ Productos de ejemplo insertados');
    } else {
      console.log('✅ Productos ya existen en la base de datos');
    }
    
    console.log('✅ Base de datos Supabase inicializada correctamente');
    
  } catch (error) {
    console.error('❌ Error inicializando base de datos Supabase:', error);
    throw error;
  }
};

// Función para migrar datos desde el archivo JSON
const migrateFromJSON = async () => {
  try {
    console.log('🔄 Iniciando migración de datos desde JSON...');
    
    const fs = require('fs');
    const path = require('path');
    const dbPath = path.join(__dirname, '../../database/db.json');
    
    if (!fs.existsSync(dbPath)) {
      console.log('⚠️ No se encontró archivo db.json, saltando migración');
      return;
    }
    
    const jsonData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    
    // Migrar usuarios
    if (jsonData.users && jsonData.users.length > 0) {
      console.log(`👥 Migrando ${jsonData.users.length} usuarios...`);
      
      // Filtrar usuarios que no sean admin (ya existe)
      const usersToMigrate = jsonData.users.filter(user => 
        user.email !== 'admin@griferia.com'
      );
      
      if (usersToMigrate.length > 0) {
        const { error } = await supabase
          .from('users')
          .upsert(usersToMigrate, { onConflict: 'email' });
        
        if (error) {
          console.error('❌ Error migrando usuarios:', error.message);
        } else {
          console.log(`✅ ${usersToMigrate.length} usuarios migrados`);
        }
      }
    }
    
    // Migrar productos
    if (jsonData.products && jsonData.products.length > 0) {
      console.log(`📦 Migrando ${jsonData.products.length} productos...`);
      
      const { error } = await supabase
        .from('products')
        .upsert(jsonData.products, { onConflict: 'id' });
      
      if (error) {
        console.error('❌ Error migrando productos:', error.message);
      } else {
        console.log(`✅ ${jsonData.products.length} productos migrados`);
      }
    }
    
    // Migrar órdenes
    if (jsonData.orders && jsonData.orders.length > 0) {
      console.log(`🛒 Migrando ${jsonData.orders.length} órdenes...`);
      
      const { error } = await supabase
        .from('orders')
        .upsert(jsonData.orders, { onConflict: 'id' });
      
      if (error) {
        console.error('❌ Error migrando órdenes:', error.message);
      } else {
        console.log(`✅ ${jsonData.orders.length} órdenes migradas`);
      }
    }
    
    // Migrar items de órdenes
    if (jsonData.order_items && jsonData.order_items.length > 0) {
      console.log(`📋 Migrando ${jsonData.order_items.length} items de órdenes...`);
      
      const { error } = await supabase
        .from('order_items')
        .upsert(jsonData.order_items, { onConflict: 'id' });
      
      if (error) {
        console.error('❌ Error migrando items de órdenes:', error.message);
      } else {
        console.log(`✅ ${jsonData.order_items.length} items de órdenes migrados`);
      }
    }
    
    // Migrar contactos
    if (jsonData.contacts && jsonData.contacts.length > 0) {
      console.log(`📞 Migrando ${jsonData.contacts.length} contactos...`);
      
      const { error } = await supabase
        .from('contacts')
        .upsert(jsonData.contacts, { onConflict: 'id' });
      
      if (error) {
        console.error('❌ Error migrando contactos:', error.message);
      } else {
        console.log(`✅ ${jsonData.contacts.length} contactos migrados`);
      }
    }
    
    console.log('✅ Migración completada');
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    throw error;
  }
};

module.exports = { supabase, initDatabase, migrateFromJSON };
