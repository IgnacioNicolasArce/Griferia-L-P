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
          image_url: 'data:image/jpeg;base64,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',
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
        console.log('DB GET query:', query, 'params:', params);
        const data = readDB();
        console.log('DB GET data:', data);
        
        // Parsear "SELECT * FROM table WHERE field = value"
        const parts = query.split(' ');
        const tableIndex = parts.indexOf('FROM');
        const table = tableIndex !== -1 ? parts[tableIndex + 1] : parts[2];
        
        console.log('DB GET table:', table);
        
        if (parts.includes('WHERE')) {
          const whereIndex = parts.indexOf('WHERE');
          if (whereIndex !== -1 && whereIndex + 2 < parts.length) {
            const field = parts[whereIndex + 1];
            const operator = parts[whereIndex + 2];
            const value = parts[whereIndex + 3] || params[0];
            
            console.log('DB GET WHERE:', { field, operator, value });
            
            if (operator === '=') {
              const items = data[table] || [];
              const result = items.find(item => item[field] == value);
              console.log('DB GET result:', result);
              resolve({
                value: () => result
              });
              return;
            }
          }
        }
        
        console.log('DB GET no WHERE clause, returning null');
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
        console.log('DB ALL query:', query);
        const data = readDB();
        console.log('DB ALL data:', data);
        
        // Parsear "SELECT * FROM table"
        const parts = query.split(' ');
        const tableIndex = parts.indexOf('FROM');
        const table = tableIndex !== -1 ? parts[tableIndex + 1] : parts[2];
        
        console.log('DB ALL table:', table);
        const result = data[table] || [];
        console.log(`DB ALL Retrieved ${result.length} items from ${table}:`, result);
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
