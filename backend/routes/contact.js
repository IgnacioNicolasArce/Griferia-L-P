const express = require('express');
const { body, validationResult } = require('express-validator');
const { db } = require('../models/database-simple');

const router = express.Router();

// Enviar mensaje de contacto
router.post('/', [
  body('name').notEmpty().withMessage('El nombre es requerido'),
  body('email').isEmail().withMessage('Email inválido'),
  body('message').notEmpty().withMessage('El mensaje es requerido')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, message } = req.body;

  db.run('INSERT INTO contacts (name, email, message) VALUES (?, ?, ?)',
    [name, email, message], function(err) {
    if (err) {
      return res.status(500).json({ message: 'Error al enviar mensaje' });
    }

    res.json({ message: 'Mensaje enviado exitosamente' });
  });
});

module.exports = router;
