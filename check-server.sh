#!/bin/bash

# Script para verificar el estado del servidor BackUPyUC
# Autor: Asistente IA

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuración
SERVER_URL="http://localhost:3000"
HEALTH_ENDPOINT="$SERVER_URL/health"

# Función para imprimir mensajes
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Función para verificar si curl está instalado
check_curl() {
    if ! command -v curl &> /dev/null; then
        print_error "curl no está instalado. Por favor instálalo primero."
        exit 1
    fi
}

# Función para verificar el puerto
check_port() {
    local port=$1
    print_status "Verificando si el puerto $port está en uso..."
    
    if lsof -i :$port > /dev/null 2>&1; then
        print_success "Puerto $port está en uso"
        lsof -i :$port
        return 0
    else
        print_warning "Puerto $port no está en uso"
        return 1
    fi
}

# Función para verificar el servidor
check_server() {
    print_status "Verificando servidor BackUPyUC en $SERVER_URL..."
    
    # Intentar hacer una petición al health endpoint
    response=$(curl -s -w "%{http_code}" "$HEALTH_ENDPOINT" 2>/dev/null)
    http_code="${response: -3}"
    response_body="${response%???}"
    
    if [ "$http_code" = "200" ]; then
        print_success "✅ Servidor BackUPyUC está funcionando correctamente"
        echo "   Status: $http_code"
        echo "   Response: $response_body"
        return 0
    else
        print_error "❌ Servidor BackUPyUC no está respondiendo correctamente"
        echo "   Status: $http_code"
        echo "   Response: $response_body"
        return 1
    fi
}

# Función para mostrar información del servidor
show_server_info() {
    echo ""
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                    🔍 SERVER STATUS                          ║"
    echo "╠══════════════════════════════════════════════════════════════╣"
    echo "║  🌐 Server URL: $SERVER_URL"
    echo "║  ❤️  Health Check: $HEALTH_ENDPOINT"
    echo "║  👥 Users API: $SERVER_URL/api/users"
    echo "║  🔐 Auth API: $SERVER_URL/api/auth"
    echo "║  🔐 Auth v1 API: $SERVER_URL/api/v1/auth"
    echo "║  🔐 NEW /me endpoint: $SERVER_URL/api/v1/auth/me"
    echo "║  📚 API Docs: $SERVER_URL/api-docs"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo ""
}

# Función para mostrar comandos útiles
show_helpful_commands() {
    echo "🔗 Comandos útiles:"
    echo "   curl $HEALTH_ENDPOINT                    # Health check"
    echo "   curl $SERVER_URL/api/v1/auth/me         # Test /me endpoint (requiere token)"
    echo "   lsof -i :3000                           # Ver procesos en puerto 3000"
    echo "   netstat -tulpn | grep :3000             # Ver conexiones al puerto"
    echo ""
    echo "📦 Scripts de package.json:"
    echo "   npm run dev                             # Iniciar servidor en desarrollo"
    echo "   npm run dev:debug                       # Iniciar con debug habilitado"
    echo "   npm run build                           # Compilar TypeScript"
    echo "   npm start                               # Iniciar en producción"
    echo "   npm run type-check                      # Verificar tipos TypeScript"
    echo "   npm run lint                            # Verificar código con ESLint"
    echo "   npm test                                # Ejecutar tests"
    echo "   PORT=4000 npm run dev                   # Iniciar en puerto diferente"
    echo ""
}

# Función principal
main() {
    echo "🔍 Verificando estado del servidor BackUPyUC..."
    echo "================================================"
    
    # Verificar dependencias
    check_curl
    
    # Mostrar información del servidor
    show_server_info
    
    # Verificar puerto
    if check_port 3000; then
        # Verificar servidor
        if check_server; then
            print_success "🎉 Todo está funcionando correctamente!"
            show_helpful_commands
        else
            print_error "💥 El servidor no está respondiendo correctamente"
            echo ""
            print_status "Posibles soluciones:"
            echo "   1. Verificar que el servidor esté corriendo: npm run dev"
            echo "   2. Verificar logs del servidor"
            echo "   3. Verificar configuración de base de datos"
            echo "   4. Verificar variables de entorno"
        fi
    else
        print_error "💥 El servidor no está corriendo en el puerto 3000"
        echo ""
        print_status "Para iniciar el servidor:"
        echo "   cd BackUPyUC"
        echo "   npm run dev"
    fi
    
    echo ""
    echo "================================================"
}

# Ejecutar función principal
main "$@" 