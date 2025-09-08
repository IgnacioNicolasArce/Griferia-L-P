# 🚀 Guía de Despliegue - Grifería L&P

## Opción 1: Railway (Recomendada)

### Pasos para desplegar en Railway:

1. **Crear cuenta en Railway:**
   - Ve a [railway.app](https://railway.app)
   - Haz clic en "Login" y conecta con GitHub

2. **Subir el código:**
   - Crea un repositorio en GitHub con este código
   - En Railway, haz clic en "New Project"
   - Selecciona "Deploy from GitHub repo"
   - Elige tu repositorio

3. **Configurar variables de entorno:**
   - En el dashboard de Railway, ve a "Variables"
   - Agrega estas variables:
     ```
     PORT=3000
     JWT_SECRET=tu_clave_secreta_muy_segura
     EMAIL_USER=tu_email@gmail.com
     EMAIL_PASS=tu_password_de_aplicacion
     ```

4. **Desplegar:**
   - Railway detectará automáticamente que es un proyecto Node.js
   - El despliegue comenzará automáticamente
   - Obtendrás una URL como: `https://tu-proyecto.railway.app`

## Opción 2: Render

### Pasos para desplegar en Render:

1. **Crear cuenta en Render:**
   - Ve a [render.com](https://render.com)
   - Conecta con GitHub

2. **Crear Web Service:**
   - Haz clic en "New +" → "Web Service"
   - Conecta tu repositorio de GitHub
   - Configura:
     - **Build Command:** `cd backend && npm install`
     - **Start Command:** `cd backend && node server.js`
     - **Environment:** Node

3. **Configurar variables de entorno:**
   - En el dashboard, ve a "Environment"
   - Agrega las mismas variables que en Railway

## Opción 3: Despliegue local con ngrok (Para mostrar rápido)

### Para mostrar inmediatamente al dueño:

1. **Instalar ngrok:**
   ```bash
   # En macOS
   brew install ngrok
   
   # O descargar desde https://ngrok.com/download
   ```

2. **Ejecutar el servidor:**
   ```bash
   cd griferia-web/backend
   node server.js
   ```

3. **En otra terminal, exponer el puerto:**
   ```bash
   ngrok http 3000
   ```

4. **Compartir la URL:**
   - ngrok te dará una URL como: `https://abc123.ngrok.io`
   - Comparte esta URL con el dueño
   - La URL será válida mientras ngrok esté corriendo

## Opción 4: Vercel (Solo frontend) + Railway (Backend)

### Si quieres usar Vercel para el frontend:

1. **Desplegar backend en Railway** (siguiendo Opción 1)

2. **Desplegar frontend en Vercel:**
   - Ve a [vercel.com](https://vercel.com)
   - Conecta con GitHub
   - Selecciona el repositorio
   - Configura:
     - **Build Command:** `echo 'No build required'`
     - **Output Directory:** `frontend`
     - **Install Command:** `echo 'No install required'`

3. **Actualizar URLs en el frontend:**
   - Cambia todas las URLs de `/api/` por la URL de tu backend de Railway
   - Ejemplo: `https://tu-backend.railway.app/api/products`

## 🔧 Configuración de Email

Para que funcionen los emails de confirmación:

1. **Gmail (Recomendado):**
   - Habilita la verificación en 2 pasos
   - Genera una contraseña de aplicación
   - Usa esa contraseña en `EMAIL_PASS`

2. **Otras opciones:**
   - SendGrid
   - Mailgun
   - AWS SES

## 📱 URLs de prueba

Una vez desplegado, puedes probar:

- **Página principal:** `https://tu-url.com`
- **API de productos:** `https://tu-url.com/api/products`
- **Admin:** Usa `admin@griferia.com` / `admin123`

## 🚨 Notas importantes

- **Base de datos:** SQLite se crea automáticamente
- **Archivos estáticos:** Se sirven desde el directorio `frontend`
- **HTTPS:** Todas las plataformas incluyen HTTPS automático
- **Dominio personalizado:** Puedes agregar tu propio dominio

## 🆘 Solución de problemas

### Error de puerto:
- Asegúrate de usar `process.env.PORT || 3000`

### Error de base de datos:
- La base de datos se crea automáticamente en Railway/Render

### Error de email:
- Verifica las credenciales de email
- Asegúrate de usar contraseña de aplicación, no la contraseña normal

### Error de CORS:
- El servidor ya está configurado para permitir CORS

## 🎯 Recomendación final

**Para mostrar rápido al dueño:** Usa ngrok (Opción 3)
**Para producción:** Usa Railway (Opción 1)

¡Tu aplicación estará online en menos de 10 minutos! 🚀
