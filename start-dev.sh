#!/bin/bash

# Script para iniciar el servidor BackUPyUC en desarrollo
# Autor: Asistente IA

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuración
PROJECT_DIR="BackUPyUC"
DEFAULT_PORT=3000

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

# Función para verificar si estamos en el directorio correcto
check_directory() {
    if [ ! -d "$PROJECT_DIR" ]; then
        print_error "Directorio $PROJECT_DIR no encontrado"
        print_status "Asegúrate de estar en el directorio raíz del proyecto"
        exit 1
    fi
}

# Función para verificar dependencias
check_dependencies() {
    print_status "Verificando dependencias..."
    
    if [ ! -d "$PROJECT_DIR/node_modules" ]; then
        print_warning "node_modules no encontrado. Instalando dependencias..."
        cd "$PROJECT_DIR"
        npm install
        cd ..
    else
        print_success "Dependencias encontradas"
    fi
}

# Función para verificar archivo .env
check_env() {
    if [ ! -f "$PROJECT_DIR/.env" ]; then
        print_warning "Archivo .env no encontrado"
        print_status "Creando archivo .env con configuración básica..."
        
        cat > "$PROJECT_DIR/.env" << EOF
# Configuración del servidor
PORT=$DEFAULT_PORT
NODE_ENV=development

# Configuración de base de datos
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=
DB_NAME=turnosya_db

# Configuración JWT
JWT_SECRET=your-secret-key-here
JWT_REFRESH_SECRET=your-refresh-secret-key-here
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# Configuración CORS
CORS_ORIGIN=http://localhost:3001

# Configuración de email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-email-password
EMAIL_FROM=noreply@backupyuc.com

# Configuración de rate limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Configuración de MercadoPago
MP_ACCESS_TOKEN=your-mp-access-token
MP_PUBLIC_KEY=your-mp-public-key
MP_WEBHOOK_SECRET=your-mp-webhook-secret

# URL del frontend
FRONTEND_URL=http://localhost:3000
EOF
        
        print_warning "Archivo .env creado. Por favor, edítalo con tus configuraciones reales."
    else
        print_success "Archivo .env encontrado"
    fi
}

# Función para verificar puerto
check_port() {
    local port=$1
    if lsof -i :$port > /dev/null 2>&1; then
        print_warning "Puerto $port ya está en uso"
        lsof -i :$port
        echo ""
        read -p "¿Deseas continuar de todas formas? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_status "Iniciando en puerto alternativo..."
            export PORT=$((port + 1))
            print_status "Puerto cambiado a: $PORT"
        fi
    fi
}

# Función para mostrar información de inicio
show_startup_info() {
    echo ""
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                    🚀 INICIANDO DESARROLLO                   ║"
    echo "╠══════════════════════════════════════════════════════════════╣"
    echo "║  📁 Proyecto: $PROJECT_DIR"
    echo "║  🔧 Modo: Development"
    echo "║  🌐 Puerto: ${PORT:-$DEFAULT_PORT}"
    echo "║  🔄 Hot Reload: Habilitado"
    echo "║  🐛 Debug: Disponible con 'npm run dev:debug'"
    echo "╠══════════════════════════════════════════════════════════════╣"
    echo "║                        📋 COMANDOS                           ║"
    echo "╠══════════════════════════════════════════════════════════════╣"
    echo "║  Ctrl+C                    # Detener servidor"
    echo "║  npm run dev:debug         # Iniciar con debug"
    echo "║  npm run build             # Compilar para producción"
    echo "║  npm test                  # Ejecutar tests"
    echo "║  npm run lint              # Verificar código"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo ""
}

# Función para iniciar el servidor
start_server() {
    print_status "Iniciando servidor BackUPyUC en modo desarrollo..."
    
    cd "$PROJECT_DIR"
    
    # Mostrar información de inicio
    show_startup_info
    
    # Iniciar servidor
    print_success "🚀 Servidor iniciado! Presiona Ctrl+C para detener."
    echo ""
    
    npm run dev
}

# Función principal
main() {
    echo "🚀 Iniciando servidor BackUPyUC en modo desarrollo..."
    echo "================================================"
    
    # Verificaciones previas
    check_directory
    check_dependencies
    check_env
    check_port ${PORT:-$DEFAULT_PORT}
    
    # Iniciar servidor
    start_server
}

# Manejar argumentos
case "${1:-}" in
    --help|-h)
        echo "Uso: $0 [opciones]"
        echo ""
        echo "Opciones:"
        echo "  --help, -h     Mostrar esta ayuda"
        echo "  --debug        Iniciar en modo debug"
        echo "  --port PORT    Especificar puerto"
        echo ""
        echo "Ejemplos:"
        echo "  $0                    # Iniciar en puerto 3000"
        echo "  $0 --port 4000        # Iniciar en puerto 4000"
        echo "  $0 --debug            # Iniciar con debug habilitado"
        exit 0
        ;;
    --debug)
        cd "$PROJECT_DIR"
        npm run dev:debug
        ;;
    --port)
        if [ -n "$2" ]; then
            export PORT=$2
            main
        else
            print_error "Puerto no especificado"
            exit 1
        fi
        ;;
    *)
        main
        ;;
esac 