const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, '../../database/db.json');

// Función para leer la base de datos
function readDB() {
  try {
    if (fs.existsSync(dbPath)) {
      const data = fs.readFileSync(dbPath, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading database:', error);
  }
  
  // Base de datos por defecto
  return {
    users: [],
    products: [],
    orders: [],
    order_items: [],
    contacts: []
  };
}

// Función para escribir la base de datos
function writeDB(data) {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing database:', error);
  }
}

// Función para obtener el siguiente ID
function getNextId(table, data) {
  const items = data[table] || [];
  if (items.length === 0) return 1;
  return Math.max(...items.map(item => item.id)) + 1;
}

const initDatabase = () => {
  return new Promise((resolve, reject) => {
    try {
      let data = readDB();
      
      // Verificar si ya hay datos
      if (data.users.length === 0) {
        // Crear usuario admin por defecto
        const adminPassword = bcrypt.hashSync('admin123', 10);
        data.users.push({
          id: 1,
          name: 'Admin',
          email: 'admin@griferia.com',
          password: adminPassword,
          role: 'admin',
          created_at: new Date().toISOString()
        });

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

        data.products = products;
        writeDB(data);
      }

      resolve();
    } catch (error) {
      reject(error);
    }
  });
};

// Simular la interfaz de SQLite
const db = {
  get: (query, params = []) => {
    const data = readDB();
    const [table, ...conditions] = query.split(' ');
    
    if (conditions.includes('WHERE')) {
      const whereIndex = conditions.indexOf('WHERE');
      if (whereIndex !== -1 && whereIndex + 2 < conditions.length) {
        const field = conditions[whereIndex + 1];
        const operator = conditions[whereIndex + 2];
        const value = conditions[whereIndex + 3];
        
        if (operator === '=') {
          const items = data[table] || [];
          const result = items.find(item => item[field] == value);
          return {
            value: () => result
          };
        }
      }
    }
    
    return {
      value: () => null
    };
  },
  
  all: (query, params = []) => {
    const data = readDB();
    const [table] = query.split(' ');
    return data[table] || [];
  },
  
  run: (query, params = []) => {
    const data = readDB();
    const [action, table] = query.split(' ');
    
    if (action === 'INSERT') {
      const newId = getNextId(table, data);
      const newItem = {
        id: newId,
        ...params[0]
      };
      
      if (!data[table]) data[table] = [];
      data[table].push(newItem);
      writeDB(data);
      
      return { lastID: newId, changes: 1 };
    }
    
    if (action === 'UPDATE') {
      // Implementar UPDATE si es necesario
      return { changes: 1 };
    }
    
    if (action === 'DELETE') {
      // Implementar DELETE si es necesario
      return { changes: 1 };
    }
    
    return { lastID: 0, changes: 0 };
  }
};

module.exports = { db, initDatabase };
