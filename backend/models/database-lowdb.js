const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, '../../database/db.json');
const adapter = new FileSync(dbPath);
const db = low(adapter);

// Configurar la base de datos por defecto
db.defaults({
  users: [],
  products: [],
  orders: [],
  order_items: [],
  contacts: []
}).write();

const initDatabase = () => {
  return new Promise((resolve, reject) => {
    try {
      // Verificar si ya hay datos
      const users = db.get('users').value();
      
      if (users.length === 0) {
        // Crear usuario admin por defecto
        const adminPassword = bcrypt.hashSync('admin123', 10);
        db.get('users').push({
          id: 1,
          name: 'Admin',
          email: 'admin@griferia.com',
          password: adminPassword,
          role: 'admin',
          created_at: new Date().toISOString()
        }).write();

        // Insertar productos de ejemplo
        const products = [
          {
            id: 1,
            name: 'Grifo de Cocina Moderno',
            description: 'Grifo de cocina con tecnología de ahorro de agua y diseño moderno',
            price: 25000,
            stock: 15,
            image_url: '/images/grifo-cocina.jpg',
            category: 'Cocina',
            created_at: new Date().toISOString()
          },
          {
            id: 2,
            name: 'Ducha de Lluvia',
            description: 'Ducha de lluvia con múltiples chorros y regulador de temperatura',
            price: 45000,
            stock: 8,
            image_url: '/images/ducha-lluvia.jpg',
            category: 'Baño',
            created_at: new Date().toISOString()
          },
          {
            id: 3,
            name: 'Lavamanos de Pedestal',
            description: 'Lavamanos elegante de porcelana con grifo incluido',
            price: 35000,
            stock: 12,
            image_url: '/images/lavamanos.jpg',
            category: 'Baño',
            created_at: new Date().toISOString()
          },
          {
            id: 4,
            name: 'Grifo de Baño',
            description: 'Grifo de baño con acabado cromado y válvula de ahorro',
            price: 18000,
            stock: 20,
            image_url: '/images/grifo-bano.jpg',
            category: 'Baño',
            created_at: new Date().toISOString()
          },
          {
            id: 5,
            name: 'Accesorio de Ducha',
            description: 'Set completo de accesorios para ducha con porta jabón',
            price: 12000,
            stock: 25,
            image_url: '/images/accesorios-ducha.jpg',
            category: 'Accesorios',
            created_at: new Date().toISOString()
          }
        ];

        db.get('products').push(...products).write();
      }

      resolve();
    } catch (error) {
      reject(error);
    }
  });
};

// Funciones de base de datos compatibles con SQLite
const dbHelper = {
  get: (query) => {
    const [table, ...conditions] = query.split(' ');
    let result = db.get(table);
    
    if (conditions.includes('WHERE')) {
      const whereIndex = conditions.indexOf('WHERE');
      if (whereIndex !== -1 && whereIndex + 2 < conditions.length) {
        const field = conditions[whereIndex + 1];
        const operator = conditions[whereIndex + 2];
        const value = conditions[whereIndex + 3];
        
        if (operator === '=') {
          result = result.find({ [field]: value });
        }
      }
    }
    
    return result;
  },
  
  all: (query) => {
    const [table] = query.split(' ');
    return db.get(table).value();
  },
  
  run: (query, params = []) => {
    // Implementar según sea necesario
    return { lastID: Date.now(), changes: 1 };
  }
};

module.exports = { db: dbHelper, initDatabase };
