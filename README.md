# Grifería L&P - Tienda Online

Una aplicación web completa para Grifería L&P con funcionalidades de e-commerce, panel de administración y sistema de autenticación.

## Características

### Frontend
- Diseño moderno y responsive
- Catálogo de productos interactivo
- Sistema de carrito de compras
- Autenticación de usuarios
- Panel de administración
- Formulario de contacto

### Backend
- API REST con Node.js y Express
- Base de datos SQLite
- Autenticación JWT
- Envío de emails con Nodemailer
- Validación de formularios

### Funcionalidades Principales
- **Clientes**: Registro, login, compra de productos, confirmación por email
- **Administradores**: Gestión de productos, visualización de órdenes
- **Sistema de compras**: Carrito funcional, actualización de stock automática
- **Notificaciones**: Emails de confirmación para compras

## Instalación

### Prerrequisitos
- Node.js (versión 14 o superior)
- npm o yarn

### Pasos de instalación

1. **Clonar o descargar el proyecto**
   ```bash
   cd griferia-web
   ```

2. **Instalar dependencias del backend**
   ```bash
   cd backend
   npm install
   ```

3. **Configurar variables de entorno**
   
   Edita el archivo `backend/routes/orders.js` y actualiza la configuración de email:
   ```javascript
   const transporter = nodemailer.createTransporter({
     service: 'gmail',
     auth: {
       user: 'tu_email@gmail.com', // Cambiar por tu email
       pass: 'tu_password_app' // Cambiar por tu contraseña de aplicación
     }
   });
   ```

4. **Inicializar la base de datos**
   ```bash
   npm start
   ```
   
   La base de datos se creará automáticamente con:
   - Usuario admin: `admin@griferia.com` / `admin123`
   - Productos de ejemplo

5. **Acceder a la aplicación**
   
   Abre tu navegador en: `http://localhost:3000`

## Uso

### Para Clientes

1. **Registrarse**: Haz clic en "Registrarse" y completa el formulario
2. **Iniciar sesión**: Usa tus credenciales para acceder
3. **Explorar productos**: Navega por el catálogo de productos
4. **Agregar al carrito**: Haz clic en "Agregar al Carrito" en cualquier producto
5. **Finalizar compra**: Ve al carrito y completa la compra con tu dirección
6. **Recibir confirmación**: Revisa tu email para la confirmación de compra

### Para Administradores

1. **Iniciar sesión**: Usa las credenciales de admin
2. **Acceder al panel**: Haz clic en "Admin" en el menú
3. **Gestionar productos**:
   - Ver lista de productos
   - Agregar nuevos productos
   - Editar productos existentes
   - Eliminar productos
4. **Ver órdenes**: Revisar todas las órdenes de clientes

## Estructura del Proyecto

```
griferia-web/
├── backend/
│   ├── routes/
│   │   ├── auth.js          # Rutas de autenticación
│   │   ├── products.js      # Rutas de productos
│   │   ├── orders.js        # Rutas de órdenes
│   │   └── contact.js       # Rutas de contacto
│   ├── models/
│   │   └── database.js      # Configuración de base de datos
│   ├── package.json
│   └── server.js           # Servidor principal
├── frontend/
│   ├── index.html          # Página principal
│   ├── styles.css          # Estilos CSS
│   └── script.js           # JavaScript del frontend
├── database/
│   └── griferia.db        # Base de datos SQLite (se crea automáticamente)
└── README.md
```

## API Endpoints

### Autenticación
- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Login de usuario
- `GET /api/auth/profile` - Obtener perfil del usuario

### Productos
- `GET /api/products` - Obtener todos los productos
- `GET /api/products/:id` - Obtener producto por ID
- `POST /api/products` - Crear producto (admin)
- `PUT /api/products/:id` - Actualizar producto (admin)
- `DELETE /api/products/:id` - Eliminar producto (admin)

### Órdenes
- `POST /api/orders` - Crear orden
- `GET /api/orders/my-orders` - Obtener órdenes del usuario
- `GET /api/orders/all` - Obtener todas las órdenes (admin)

### Contacto
- `POST /api/contact` - Enviar mensaje de contacto

## Configuración de Email

Para que funcione el envío de emails, necesitas configurar una cuenta de Gmail:

1. Habilita la verificación en 2 pasos en tu cuenta de Google
2. Genera una contraseña de aplicación específica
3. Actualiza las credenciales en `backend/routes/orders.js`

## Tecnologías Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Node.js, Express.js
- **Base de datos**: SQLite3
- **Autenticación**: JWT (JSON Web Tokens)
- **Email**: Nodemailer
- **Validación**: Express-validator
- **Estilos**: CSS Grid, Flexbox, Animaciones CSS

## Características de Diseño

- **Responsive**: Adaptable a dispositivos móviles y tablets
- **Moderno**: Diseño limpio con gradientes y sombras
- **Accesible**: Navegación intuitiva y formularios claros
- **Interactivo**: Animaciones suaves y feedback visual

## Desarrollo

Para ejecutar en modo desarrollo:

```bash
cd backend
npm run dev
```

Esto iniciará el servidor con nodemon para recarga automática.

## Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.
