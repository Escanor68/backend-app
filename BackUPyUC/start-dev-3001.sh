#!/bin/bash

# Script para iniciar BackUPyUC en puerto 3001
echo "🚀 Iniciando BackUPyUC en puerto 3001..."

# Configurar el puerto
export PORT=3001

# Verificar que las dependencias estén instaladas
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependencias..."
    npm install
fi

# Construir el proyecto si es necesario
if [ ! -d "dist" ]; then
    echo "🔨 Construyendo proyecto..."
    npm run build
fi

# Iniciar el servidor en modo desarrollo
echo "🌐 Iniciando servidor en http://localhost:3001"
echo "📚 API Docs disponibles en http://localhost:3001/api-docs"
echo "❤️ Health check en http://localhost:3001/health"
echo ""
echo "Presiona Ctrl+C para detener el servidor"
echo ""

npm run dev 