const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

// En Render, usar /tmp para la base de datos
const dbPath = process.env.NODE_ENV === 'production' 
  ? '/tmp/db.json' 
  : path.join(__dirname, '../../database/db.json');

// Función para leer la base de datos
function readDB() {
  try {
    console.log('Reading database from:', dbPath);
    if (fs.existsSync(dbPath)) {
      const data = fs.readFileSync(dbPath, 'utf8');
      console.log('Raw data from file:', data);
      const parsed = JSON.parse(data);
      console.log('Parsed data:', parsed);
      return parsed;
    } else {
      console.log('Database file does not exist, using default data');
    }
  } catch (error) {
    console.error('Error reading database:', error);
    console.error('Error details:', error.message);
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
    console.log('Writing database to:', dbPath);
    console.log('Data to write:', JSON.stringify(data, null, 2));
    
    // Asegurar que el directorio existe
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      console.log('Creating directory:', dir);
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Escribir el archivo
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
    console.log('Database written successfully to:', dbPath);
    
    // Verificar que se escribió correctamente
    const writtenData = fs.readFileSync(dbPath, 'utf8');
    console.log('Verification - written data:', writtenData);
    
  } catch (error) {
    console.error('Error writing database:', error);
    console.error('Error details:', error.message);
    console.error('Stack trace:', error.stack);
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
      console.log('Initializing database...');
      let data = readDB();
      console.log('Current data:', data);
      
      // Siempre crear los datos iniciales (para debug)
      console.log('Creating initial data...');
      
      // Crear usuario admin por defecto
      const adminPassword = bcrypt.hashSync('admin123', 10);
      data.users = [{
        id: 1,
        name: 'Admin',
        email: 'admin@griferia.com',
        password: adminPassword,
        role: 'admin',
        created_at: new Date().toISOString()
      }];

      // Insertar productos de ejemplo
      data.products = [
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

      console.log('Data to write:', data);
      writeDB(data);
      console.log('Database initialized successfully with', data.products.length, 'products and', data.users.length, 'users');

      resolve();
    } catch (error) {
      console.error('Error initializing database:', error);
      reject(error);
    }
  });
};

// Simular la interfaz de SQLite de manera más simple
const db = {
  get: (query, params = []) => {
    return new Promise((resolve) => {
      try {
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
              resolve({
                value: () => result
              });
              return;
            }
          }
        }
        
        resolve({
          value: () => null
        });
      } catch (error) {
        console.error('Error in db.get:', error);
        resolve({
          value: () => null
        });
      }
    });
  },
  
  all: (query, params = []) => {
    return new Promise((resolve) => {
      try {
        const data = readDB();
        const [table] = query.split(' ');
        const result = data[table] || [];
        console.log(`Retrieved ${result.length} items from ${table}`);
        resolve(result);
      } catch (error) {
        console.error('Error in db.all:', error);
        resolve([]);
      }
    });
  },
  
  run: (query, params = []) => {
    return new Promise((resolve) => {
      try {
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
          
          resolve({ lastID: newId, changes: 1 });
        } else if (action === 'UPDATE') {
          // Implementar UPDATE si es necesario
          resolve({ changes: 1 });
        } else if (action === 'DELETE') {
          // Implementar DELETE si es necesario
          resolve({ changes: 1 });
        } else {
          resolve({ lastID: 0, changes: 0 });
        }
      } catch (error) {
        console.error('Error in db.run:', error);
        resolve({ lastID: 0, changes: 0 });
      }
    });
  }
};

module.exports = { db, initDatabase };
