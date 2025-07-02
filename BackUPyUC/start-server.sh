#!/bin/bash

# Script para iniciar BackUPyUC de forma persistente
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

# Función para manejar la señal de interrupción
cleanup() {
    echo ""
    echo "🛑 Deteniendo servidor..."
    kill $PID 2>/dev/null
    exit 0
}

# Configurar trap para manejar Ctrl+C
trap cleanup SIGINT SIGTERM

# Iniciar el servidor
echo "🌐 Iniciando servidor en http://localhost:3001"
echo "📚 API Docs disponibles en http://localhost:3001/api-docs"
echo "❤️ Health check en http://localhost:3001/health"
echo ""
echo "Presiona Ctrl+C para detener el servidor"
echo ""

# Iniciar el servidor y guardar el PID
npm run dev &
PID=$!

# Esperar a que el proceso termine
wait $PID 