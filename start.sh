#!/bin/bash

echo "🚀 Iniciando Grifería L&P..."
echo ""

# Verificar si Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado. Por favor instala Node.js primero."
    exit 1
fi

# Verificar si npm está instalado
if ! command -v npm &> /dev/null; then
    echo "❌ npm no está instalado. Por favor instala npm primero."
    exit 1
fi

echo "✅ Node.js y npm están instalados"
echo ""

# Instalar dependencias si no están instaladas
if [ ! -d "backend/node_modules" ]; then
    echo "📦 Instalando dependencias del backend..."
    cd backend
    npm install
    cd ..
    echo "✅ Dependencias instaladas"
    echo ""
fi

# Crear directorio de base de datos si no existe
mkdir -p database

echo "🔧 Configuración:"
echo "   - Puerto: 3000"
echo "   - Base de datos: SQLite (se creará automáticamente)"
echo "   - Usuario admin: admin@griferia.com / admin123"
echo ""

echo "⚠️  IMPORTANTE: Para que funcione el envío de emails, edita el archivo backend/config.js"
echo "   y actualiza las credenciales de email (EMAIL_USER y EMAIL_PASS)"
echo ""

echo "🌐 Iniciando servidor..."
echo "   Abre tu navegador en: http://localhost:3000"
echo ""

# Iniciar el servidor
cd backend
npm start
