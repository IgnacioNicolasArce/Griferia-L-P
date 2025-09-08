module.exports = {
  PORT: process.env.PORT || 3000,
  JWT_SECRET: process.env.JWT_SECRET || 'tu_clave_secreta_jwt_muy_segura',
  EMAIL_USER: process.env.EMAIL_USER || 'tu_email@gmail.com',
  EMAIL_PASS: process.env.EMAIL_PASS || 'tu_password_de_aplicacion',
  DB_PATH: process.env.DB_PATH || './database/griferia.db'
};
