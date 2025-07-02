#!/bin/bash

# Script para probar la API de la aplicación de fútbol
# Autor: Asistente IA
# Fecha: $(date)

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuración
BASE_URL_USERS="http://localhost:3000"
BASE_URL_PAYMENTS="http://localhost:3001"
HEADERS="Content-Type: application/json"

# Variables globales
TOKEN=""
ADMIN_TOKEN=""

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

# Función para hacer requests y mostrar resultados
make_request() {
    local method=$1
    local url=$2
    local data=$3
    local description=$4
    
    print_status "Probando: $description"
    
    if [ -n "$data" ]; then
        response=$(curl -s -w "\n%{http_code}" -X $method "$url" -H "$HEADERS" -d "$data")
    else
        response=$(curl -s -w "\n%{http_code}" -X $method "$url" -H "$HEADERS")
    fi
    
    # Separar respuesta y código de estado
    http_code=$(echo "$response" | tail -n1)
    response_body=$(echo "$response" | head -n -1)
    
    if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
        print_success "HTTP $http_code - $description"
        echo "$response_body" | jq '.' 2>/dev/null || echo "$response_body"
    else
        print_error "HTTP $http_code - $description"
        echo "$response_body" | jq '.' 2>/dev/null || echo "$response_body"
    fi
    
    echo "----------------------------------------"
}

# Función para hacer requests autenticados
make_auth_request() {
    local method=$1
    local url=$2
    local data=$3
    local description=$4
    local token=${5:-$TOKEN}
    
    if [ -z "$token" ]; then
        print_warning "No hay token disponible para: $description"
        return
    fi
    
    print_status "Probando (autenticado): $description"
    
    if [ -n "$data" ]; then
        response=$(curl -s -w "\n%{http_code}" -X $method "$url" -H "$HEADERS" -H "Authorization: Bearer $token" -d "$data")
    else
        response=$(curl -s -w "\n%{http_code}" -X $method "$url" -H "$HEADERS" -H "Authorization: Bearer $token")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    response_body=$(echo "$response" | head -n -1)
    
    if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
        print_success "HTTP $http_code - $description"
        echo "$response_body" | jq '.' 2>/dev/null || echo "$response_body"
    else
        print_error "HTTP $http_code - $description"
        echo "$response_body" | jq '.' 2>/dev/null || echo "$response_body"
    fi
    
    echo "----------------------------------------"
}

# Función para extraer token de respuesta
extract_token() {
    local response=$1
    echo "$response" | jq -r '.token // .accessToken // empty' 2>/dev/null
}

# Función para verificar si jq está instalado
check_dependencies() {
    if ! command -v jq &> /dev/null; then
        print_warning "jq no está instalado. Instalando..."
        sudo apt-get update && sudo apt-get install -y jq
    fi
    
    if ! command -v curl &> /dev/null; then
        print_error "curl no está instalado. Por favor instálalo manualmente."
        exit 1
    fi
}

# Función para verificar conectividad
check_connectivity() {
    print_status "Verificando conectividad con los servidores..."
    
    if curl -s "$BASE_URL_USERS/health" > /dev/null; then
        print_success "BackUPyUC (usuarios) está disponible"
    else
        print_error "BackUPyUC (usuarios) no está disponible en $BASE_URL_USERS"
    fi
    
    if curl -s "$BASE_URL_PAYMENTS/metrics" > /dev/null; then
        print_success "BackMP (pagos) está disponible"
    else
        print_error "BackMP (pagos) no está disponible en $BASE_URL_PAYMENTS"
    fi
}

# Función para probar autenticación
test_authentication() {
    print_status "=== PRUEBAS DE AUTENTICACIÓN ==="
    
    # 1. Registro de usuario
    register_data='{
        "name": "Usuario Test",
        "email": "test@ejemplo.com",
        "password": "Password123!",
        "phone": "+34612345678"
    }'
    
    response=$(curl -s -X POST "$BASE_URL_USERS/api/users/register" -H "$HEADERS" -d "$register_data")
    print_status "Respuesta de registro:"
    echo "$response" | jq '.' 2>/dev/null || echo "$response"
    
    # 2. Login
    login_data='{
        "email": "test@ejemplo.com",
        "password": "Password123!"
    }'
    
    response=$(curl -s -X POST "$BASE_URL_USERS/api/users/login" -H "$HEADERS" -d "$login_data")
    print_status "Respuesta de login:"
    echo "$response" | jq '.' 2>/dev/null || echo "$response"
    
    # Extraer token
    TOKEN=$(extract_token "$response")
    if [ -n "$TOKEN" ]; then
        print_success "Token obtenido: ${TOKEN:0:20}..."
    else
        print_error "No se pudo obtener el token"
    fi
    
    # 3. Obtener perfil
    if [ -n "$TOKEN" ]; then
        make_auth_request "GET" "$BASE_URL_USERS/api/users/profile" "" "Obtener perfil de usuario"
        make_auth_request "GET" "$BASE_URL_USERS/api/v1/auth/me" "" "Obtener perfil de usuario (nuevo endpoint)"
    fi
}

# Función para probar funcionalidades de usuario
test_user_features() {
    if [ -z "$TOKEN" ]; then
        print_warning "Saltando pruebas de usuario - no hay token"
        return
    fi
    
    print_status "=== PRUEBAS DE FUNCIONALIDADES DE USUARIO ==="
    
    # Campos favoritos
    make_auth_request "GET" "$BASE_URL_USERS/api/users/favorite-fields" "" "Obtener campos favoritos"
    
    add_favorite_data='{
        "fieldId": 123,
        "fieldName": "Campo Central"
    }'
    make_auth_request "POST" "$BASE_URL_USERS/api/users/favorite-fields" "$add_favorite_data" "Agregar campo favorito"
    
    # Notificaciones
    make_auth_request "GET" "$BASE_URL_USERS/api/users/notifications" "" "Obtener notificaciones"
}

# Función para probar pagos
test_payments() {
    if [ -z "$TOKEN" ]; then
        print_warning "Saltando pruebas de pagos - no hay token"
        return
    fi
    
    print_status "=== PRUEBAS DE PAGOS ==="
    
    # Crear preferencia de pago
    payment_data='{
        "bookingId": 123,
        "amount": 5000,
        "currency": "ARS",
        "description": "Reserva de cancha de fútbol",
        "payerEmail": "test@ejemplo.com",
        "expirationDate": "2024-12-31T23:59:59Z"
    }'
    
    response=$(curl -s -X POST "$BASE_URL_PAYMENTS/api/payments/preference" -H "$HEADERS" -H "Authorization: Bearer $TOKEN" -d "$payment_data")
    print_status "Respuesta de preferencia de pago:"
    echo "$response" | jq '.' 2>/dev/null || echo "$response"
    
    # Extraer payment ID si está disponible
    PAYMENT_ID=$(echo "$response" | jq -r '.id // .paymentId // empty' 2>/dev/null)
    
    if [ -n "$PAYMENT_ID" ]; then
        print_success "Payment ID obtenido: $PAYMENT_ID"
        
        # Obtener estado de pago
        make_auth_request "GET" "$BASE_URL_PAYMENTS/api/payments/$PAYMENT_ID/status" "" "Obtener estado de pago" "$TOKEN"
        
        # Obtener factura
        make_auth_request "GET" "$BASE_URL_PAYMENTS/api/payments/$PAYMENT_ID/invoice" "" "Obtener factura" "$TOKEN"
    fi
    
    # Historial de pagos
    make_auth_request "GET" "$BASE_URL_PAYMENTS/api/payments/history" "" "Obtener historial de pagos" "$TOKEN"
}

# Función para probar webhooks
test_webhooks() {
    print_status "=== PRUEBAS DE WEBHOOKS ==="
    
    webhook_data='{
        "type": "payment",
        "data": {
            "id": "TEST_PAYMENT_ID"
        }
    }'
    
    make_request "POST" "$BASE_URL_PAYMENTS/api/payments/webhook" "$webhook_data" "Webhook de MercadoPago"
}

# Función para probar métricas
test_metrics() {
    print_status "=== PRUEBAS DE MÉTRICAS ==="
    
    make_request "GET" "$BASE_URL_USERS/health" "" "Health Check"
    make_request "GET" "$BASE_URL_PAYMENTS/metrics" "" "Métricas del sistema"
}

# Función principal
main() {
    echo "🧪 INICIANDO PRUEBAS DE API"
    echo "================================"
    
    # Verificar dependencias
    check_dependencies
    
    # Verificar conectividad
    check_connectivity
    
    # Ejecutar pruebas
    test_authentication
    test_user_features
    test_payments
    test_webhooks
    test_metrics
    
    echo ""
    print_success "Pruebas completadas!"
    echo ""
    print_status "Para más comandos detallados, revisa el archivo curl-commands.md"
}

# Ejecutar función principal
main "$@" 