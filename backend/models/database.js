const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');
const config = require('../config');

const dbPath = path.join(__dirname, '../../database/griferia.db');
const db = new sqlite3.Database(dbPath);

const initDatabase = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Tabla de usuarios
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          role TEXT DEFAULT 'client',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Tabla de productos
      db.run(`
        CREATE TABLE IF NOT EXISTS products (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          description TEXT,
          price REAL NOT NULL,
          stock INTEGER NOT NULL,
          image_url TEXT,
          category TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Tabla de órdenes
      db.run(`
        CREATE TABLE IF NOT EXISTS orders (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          total REAL NOT NULL,
          status TEXT DEFAULT 'pending',
          shipping_address TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id)
        )
      `);

      // Tabla de items de órdenes
      db.run(`
        CREATE TABLE IF NOT EXISTS order_items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          order_id INTEGER NOT NULL,
          product_id INTEGER NOT NULL,
          quantity INTEGER NOT NULL,
          price REAL NOT NULL,
          FOREIGN KEY (order_id) REFERENCES orders (id),
          FOREIGN KEY (product_id) REFERENCES products (id)
        )
      `);

      // Tabla de contactos
      db.run(`
        CREATE TABLE IF NOT EXISTS contacts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT NOT NULL,
          message TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Crear usuario admin por defecto
      const adminPassword = bcrypt.hashSync('admin123', 10);
      db.run(`
        INSERT OR IGNORE INTO users (name, email, password, role) 
        VALUES ('Admin', 'admin@griferia.com', ?, 'admin')
      `, [adminPassword]);

      // Insertar productos de ejemplo
      db.run(`
        INSERT OR IGNORE INTO products (name, description, price, stock, image_url, category) VALUES
        ('Grifo de Cocina Moderno', 'Grifo de cocina con tecnología de ahorro de agua y diseño moderno', 25000, 15, '/images/grifo-cocina.jpg', 'Cocina'),
        ('Ducha de Lluvia', 'Ducha de lluvia con múltiples chorros y regulador de temperatura', 45000, 8, '/images/ducha-lluvia.jpg', 'Baño'),
        ('Lavamanos de Pedestal', 'Lavamanos elegante de porcelana con grifo incluido', 35000, 12, '/images/lavamanos.jpg', 'Baño'),
        ('Grifo de Baño', 'Grifo de baño con acabado cromado y válvula de ahorro', 18000, 20, '/images/grifo-bano.jpg', 'Baño'),
        ('Accesorio de Ducha', 'Set completo de accesorios para ducha con porta jabón', 12000, 25, '/images/accesorios-ducha.jpg', 'Accesorios')
      `);

      resolve();
    });
  });
};

module.exports = { db, initDatabase };
