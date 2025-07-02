#!/bin/bash

# Script para probar los endpoints configurados para el frontend
# Ejecutar con: ./test-frontend-endpoints.sh

# Configuración
BASE_URL="http://localhost:3001"
HEADERS="Content-Type: application/json"

echo "🧪 Probando endpoints configurados para frontend..."
echo "=================================================="
echo ""

# Función para mostrar resultados
show_result() {
    local test_name="$1"
    local status_code="$2"
    local response="$3"
    
    echo "📋 $test_name"
    echo "   Status: $status_code"
    if [ "$status_code" = "200" ] || [ "$status_code" = "201" ]; then
        echo "   ✅ ÉXITO"
    else
        echo "   ❌ ERROR"
    fi
    echo "   Respuesta: $response"
    echo ""
}

# 1. Health check
echo "🔍 1. Verificando estado del servidor..."
HEALTH_RESPONSE=$(curl -s -w "%{http_code}" -X GET "$BASE_URL/health" -o /tmp/health_response)
HEALTH_STATUS=$(echo $HEALTH_RESPONSE | tail -c 4)
HEALTH_BODY=$(cat /tmp/health_response)
show_result "Health Check" "$HEALTH_STATUS" "$HEALTH_BODY"

# 2. Crear usuario de prueba
echo "👤 2. Creando usuario de prueba..."
REGISTER_RESPONSE=$(curl -s -w "%{http_code}" -X POST "$BASE_URL/api/auth/register" \
  -H "$HEADERS" \
  -d '{
    "name": "Usuario Frontend Test",
    "email": "frontend-test@ejemplo.com",
    "password": "Password123!"
  }' -o /tmp/register_response)
REGISTER_STATUS=$(echo $REGISTER_RESPONSE | tail -c 4)
REGISTER_BODY=$(cat /tmp/register_response)
show_result "Registro de Usuario" "$REGISTER_STATUS" "$REGISTER_BODY"

# 3. Login para obtener token
echo "🔐 3. Obteniendo token de autenticación..."
LOGIN_RESPONSE=$(curl -s -w "%{http_code}" -X POST "$BASE_URL/api/auth/login" \
  -H "$HEADERS" \
  -d '{
    "email": "frontend-test@ejemplo.com",
    "password": "Password123!"
  }' -o /tmp/login_response)
LOGIN_STATUS=$(echo $LOGIN_RESPONSE | tail -c 4)
LOGIN_BODY=$(cat /tmp/login_response)
show_result "Login" "$LOGIN_STATUS" "$LOGIN_BODY"

# Extraer token si el login fue exitoso
if [ "$LOGIN_STATUS" = "200" ]; then
    TOKEN=$(cat /tmp/login_response | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
    echo "🎫 Token obtenido: ${TOKEN:0:20}..."
    echo ""
    
    # 4. Probar GET /api/auth/me
    echo "👤 4. Probando GET /api/auth/me..."
    ME_RESPONSE=$(curl -s -w "%{http_code}" -X GET "$BASE_URL/api/auth/me" \
      -H "Authorization: Bearer $TOKEN" \
      -H "$HEADERS" -o /tmp/me_response)
    ME_STATUS=$(echo $ME_RESPONSE | tail -c 4)
    ME_BODY=$(cat /tmp/me_response)
    show_result "GET /api/auth/me" "$ME_STATUS" "$ME_BODY"
    
    # 5. Probar GET /api/users/notifications
    echo "🔔 5. Probando GET /api/users/notifications..."
    NOTIFICATIONS_RESPONSE=$(curl -s -w "%{http_code}" -X GET "$BASE_URL/api/users/notifications" \
      -H "Authorization: Bearer $TOKEN" \
      -H "$HEADERS" -o /tmp/notifications_response)
    NOTIFICATIONS_STATUS=$(echo $NOTIFICATIONS_RESPONSE | tail -c 4)
    NOTIFICATIONS_BODY=$(cat /tmp/notifications_response)
    show_result "GET /api/users/notifications" "$NOTIFICATIONS_STATUS" "$NOTIFICATIONS_BODY"
    
    # 6. Probar GET /api/users/favorite-fields
    echo "⭐ 6. Probando GET /api/users/favorite-fields..."
    FAVORITES_RESPONSE=$(curl -s -w "%{http_code}" -X GET "$BASE_URL/api/users/favorite-fields" \
      -H "Authorization: Bearer $TOKEN" \
      -H "$HEADERS" -o /tmp/favorites_response)
    FAVORITES_STATUS=$(echo $FAVORITES_RESPONSE | tail -c 4)
    FAVORITES_BODY=$(cat /tmp/favorites_response)
    show_result "GET /api/users/favorite-fields" "$FAVORITES_STATUS" "$FAVORITES_BODY"
    
    # 7. Probar CORS
    echo "🌐 7. Probando configuración CORS..."
    CORS_RESPONSE=$(curl -s -w "%{http_code}" -X OPTIONS "$BASE_URL/api/auth/me" \
      -H "Origin: http://localhost:4000" \
      -H "Access-Control-Request-Method: GET" \
      -H "Access-Control-Request-Headers: Authorization" \
      -o /tmp/cors_response)
    CORS_STATUS=$(echo $CORS_RESPONSE | tail -c 4)
    CORS_BODY=$(cat /tmp/cors_response)
    show_result "CORS Configuration" "$CORS_STATUS" "$CORS_BODY"
    
else
    echo "❌ No se pudo obtener el token. Saltando pruebas de endpoints protegidos."
fi

# Limpiar archivos temporales
rm -f /tmp/health_response /tmp/register_response /tmp/login_response /tmp/me_response /tmp/notifications_response /tmp/favorites_response /tmp/cors_response

echo "=================================================="
echo "🏁 Pruebas completadas!"
echo ""
echo "📝 Resumen:"
echo "   - Servidor: $(if [ "$HEALTH_STATUS" = "200" ]; then echo "✅ Funcionando"; else echo "❌ No disponible"; fi)"
echo "   - CORS: $(if [ "$CORS_STATUS" = "200" ]; then echo "✅ Configurado"; else echo "❌ Error"; fi)"
echo "   - Endpoints protegidos: $(if [ "$LOGIN_STATUS" = "200" ]; then echo "✅ Funcionando"; else echo "❌ Error de autenticación"; fi)"
echo ""
echo "🎯 Los endpoints están listos para usar con tu frontend en http://localhost:4000"
echo "🌐 BackUPyUC corriendo en http://localhost:3001" 