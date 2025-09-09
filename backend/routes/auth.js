const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { db } = require('../models/database-render');
const config = require('../config');

const router = express.Router();
const JWT_SECRET = config.JWT_SECRET;

// Middleware para verificar token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token de acceso requerido' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Token inválido' });
    }
    req.user = user;
    next();
  });
};

// Registro de usuario
router.post('/register', [
  body('name').notEmpty().withMessage('El nombre es requerido'),
  body('email').isEmail().withMessage('Email inválido'),
  body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, password } = req.body;

  // Verificar si el usuario ya existe
  db.get('SELECT * FROM users WHERE email = ?', [email]).then(result => {
    const user = result.value();

    if (user) {
      return res.status(400).json({ message: 'El usuario ya existe' });
    }

    // Hash de la contraseña
    const hashedPassword = bcrypt.hashSync(password, 10);

    // Crear usuario
    db.run('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', 
      [{ name, email, password: hashedPassword }]).then(result => {
      const token = jwt.sign({ id: result.lastID, email, role: 'client' }, JWT_SECRET);
      res.json({ 
        message: 'Usuario creado exitosamente',
        token,
        user: { id: result.lastID, name, email, role: 'client' }
      });
    }).catch(err => {
      console.error('Error creating user:', err);
      res.status(500).json({ message: 'Error al crear usuario' });
    });
  }).catch(err => {
    console.error('Error checking user:', err);
    res.status(500).json({ message: 'Error del servidor' });
  });
});

// Login de usuario
router.post('/login', [
  body('email').isEmail().withMessage('Email inválido'),
  body('password').notEmpty().withMessage('La contraseña es requerida')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    console.log('Login attempt for email:', email);
    
    // Leer la base de datos directamente
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
    
    console.log('Database data:', data);
    const users = data.users || [];
    console.log('Users:', users);
    
    const user = users.find(u => u.email === email);
    console.log('Found user:', user);

    if (!user || !bcrypt.compareSync(password, user.password)) {
      console.log('Invalid credentials');
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET);
    res.json({
      message: 'Login exitoso',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// Obtener perfil del usuario
router.get('/profile', authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
module.exports.authenticateToken = authenticateToken;
