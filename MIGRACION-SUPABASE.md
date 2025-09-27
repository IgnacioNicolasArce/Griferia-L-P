# Migración a Supabase - Grifería L&P

## 📋 Resumen de la migración

Se ha configurado la aplicación para usar **Supabase** como base de datos en lugar del archivo JSON local. Esto proporciona:

- ✅ Base de datos PostgreSQL escalable
- ✅ API REST automática
- ✅ Autenticación integrada
- ✅ Políticas de seguridad RLS
- ✅ Escalabilidad automática
- ✅ Backup automático

## 🚀 Pasos para completar la migración

### 1. Configurar Supabase

1. **Crear cuenta en Supabase**: Ve a [supabase.com](https://supabase.com) y crea una cuenta
2. **Crear nuevo proyecto**: Crea un nuevo proyecto para tu aplicación
3. **Obtener credenciales**:
   - Ve a **Settings > API**
   - Copia la **URL del proyecto**
   - Copia la **service_role key** (clave secreta)

### 2. Configurar variables de entorno

1. **Crear archivo `.env`** en la raíz del proyecto:
```bash
cp supabase-config.example .env
```

2. **Editar `.env`** con tus credenciales:
```env
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_aqui
PORT=3000
NODE_ENV=development
```

### 3. Configurar la base de datos

1. **Ir al SQL Editor** en tu dashboard de Supabase
2. **Ejecutar el script** `supabase-schema.sql` que contiene:
   - Creación de todas las tablas
   - Índices para optimización
   - Políticas de seguridad RLS
   - Usuario admin por defecto
   - Productos de ejemplo

### 4. Instalar dependencias

```bash
cd backend
npm install
```

### 5. Migrar datos existentes (opcional)

Si tienes datos importantes en tu archivo JSON actual:

```bash
# Iniciar el servidor
npm start

# En otra terminal, ejecutar la migración
curl -X POST http://localhost:3000/migrate-from-json
```

### 6. Verificar la migración

```bash
# Verificar que la base de datos funciona
curl http://localhost:3000/debug

# Verificar el login del admin
curl -X POST http://localhost:3000/test-login
```

## 📁 Archivos modificados

### Nuevos archivos creados:
- `backend/models/database-supabase.js` - Cliente de Supabase
- `supabase-schema.sql` - Script de configuración de la base de datos
- `supabase-config.example` - Plantilla de configuración
- `MIGRACION-SUPABASE.md` - Esta guía

### Archivos modificados:
- `backend/package.json` - Agregada dependencia de Supabase
- `backend/server.js` - Actualizado para usar Supabase
- `backend/routes/auth.js` - Rutas de autenticación actualizadas
- `backend/routes/products.js` - Rutas de productos actualizadas

## 🗑️ Archivos que se pueden eliminar (después de verificar la migración)

Una vez que confirmes que todo funciona correctamente:

```bash
# Eliminar archivos de base de datos local
rm database/db.json
rm database/db.json.backup
rm database/griferia.db

# Eliminar modelos de base de datos antigua
rm backend/models/database.js
rm backend/models/database-render.js
rm backend/models/database-render-backup.js
rm backend/models/database-simple.js
rm backend/models/database-fixed.js
rm backend/models/database-lowdb.js
```

## 🔧 Configuración de producción

Para desplegar en producción (Railway, Vercel, etc.):

1. **Configurar variables de entorno** en tu plataforma:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `PORT`
   - `NODE_ENV=production`

2. **El archivo `.env` NO debe subirse** a git (ya está en `.gitignore`)

## 🛠️ Comandos útiles

```bash
# Instalar dependencias
npm install

# Iniciar en modo desarrollo
npm run dev

# Iniciar en modo producción
npm start

# Verificar estado de la base de datos
curl http://localhost:3000/health

# Ver datos de la base de datos
curl http://localhost:3000/debug

# Migrar datos desde JSON
curl -X POST http://localhost:3000/migrate-from-json
```

## 🔒 Seguridad

La configuración incluye:
- **Row Level Security (RLS)** habilitado en todas las tablas
- **Políticas de acceso** configuradas por rol
- **Autenticación JWT** mantenida
- **Validación de datos** en todas las rutas

## 📞 Soporte

Si encuentras problemas durante la migración:

1. Verifica que las variables de entorno estén configuradas correctamente
2. Confirma que el script SQL se ejecutó sin errores
3. Revisa los logs del servidor para errores específicos
4. Usa las rutas de debug para verificar el estado

## ✅ Lista de verificación final

- [ ] Proyecto de Supabase creado
- [ ] Variables de entorno configuradas
- [ ] Script SQL ejecutado
- [ ] Dependencias instaladas
- [ ] Servidor iniciado correctamente
- [ ] Ruta `/debug` funciona
- [ ] Login de admin funciona
- [ ] Datos migrados (si aplica)
- [ ] Archivos antiguos eliminados (opcional)

¡Tu aplicación ahora está usando Supabase! 🎉
