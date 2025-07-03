#!/bin/bash

# Script para probar el login con diferentes roles
BASE_URL="http://localhost:3001/api/auth"

echo "🔐 Probando login con diferentes roles..."
echo "=============================================="

# Función para mostrar el resultado
show_result() {
    if [ $1 -eq 200 ] || [ $1 -eq 201 ]; then
        echo "✅ Éxito (HTTP $1)"
    else
        echo "❌ Error (HTTP $1)"
    fi
    echo "Respuesta: $2"
    echo "---"
}

# Función para extraer token de la respuesta
extract_token() {
    echo "$1" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4
}

# 1. Login usuario básico
echo "1. Login usuario básico..."
RESPONSE=$(curl -s -w "%{http_code}" -X POST "$BASE_URL/login" \
    -H "Content-Type: application/json" \
    -d '{
        "email": "usuario@test.com",
        "password": "123456"
    }')
HTTP_CODE="${RESPONSE: -3}"
BODY="${RESPONSE%???}"
show_result $HTTP_CODE "$BODY"
TOKEN1=$(extract_token "$BODY")

# 2. Login jugador
echo "2. Login jugador..."
RESPONSE=$(curl -s -w "%{http_code}" -X POST "$BASE_URL/login" \
    -H "Content-Type: application/json" \
    -d '{
        "email": "jugador@test.com",
        "password": "123456"
    }')
HTTP_CODE="${RESPONSE: -3}"
BODY="${RESPONSE%???}"
show_result $HTTP_CODE "$BODY"
TOKEN2=$(extract_token "$BODY")

# 3. Login capitán
echo "3. Login capitán..."
RESPONSE=$(curl -s -w "%{http_code}" -X POST "$BASE_URL/login" \
    -H "Content-Type: application/json" \
    -d '{
        "email": "capitan@test.com",
        "password": "123456"
    }')
HTTP_CODE="${RESPONSE: -3}"
BODY="${RESPONSE%???}"
show_result $HTTP_CODE "$BODY"
TOKEN3=$(extract_token "$BODY")

# 4. Login entrenador
echo "4. Login entrenador..."
RESPONSE=$(curl -s -w "%{http_code}" -X POST "$BASE_URL/login" \
    -H "Content-Type: application/json" \
    -d '{
        "email": "entrenador@test.com",
        "password": "123456"
    }')
HTTP_CODE="${RESPONSE: -3}"
BODY="${RESPONSE%???}"
show_result $HTTP_CODE "$BODY"
TOKEN4=$(extract_token "$BODY")

# 5. Login árbitro
echo "5. Login árbitro..."
RESPONSE=$(curl -s -w "%{http_code}" -X POST "$BASE_URL/login" \
    -H "Content-Type: application/json" \
    -d '{
        "email": "arbitro@test.com",
        "password": "123456"
    }')
HTTP_CODE="${RESPONSE: -3}"
BODY="${RESPONSE%???}"
show_result $HTTP_CODE "$BODY"
TOKEN5=$(extract_token "$BODY")

# 6. Login dueño de cancha
echo "6. Login dueño de cancha..."
RESPONSE=$(curl -s -w "%{http_code}" -X POST "$BASE_URL/login" \
    -H "Content-Type: application/json" \
    -d '{
        "email": "dueno@test.com",
        "password": "123456"
    }')
HTTP_CODE="${RESPONSE: -3}"
BODY="${RESPONSE%???}"
show_result $HTTP_CODE "$BODY"
TOKEN6=$(extract_token "$BODY")

# 7. Login gerente de cancha
echo "7. Login gerente de cancha..."
RESPONSE=$(curl -s -w "%{http_code}" -X POST "$BASE_URL/login" \
    -H "Content-Type: application/json" \
    -d '{
        "email": "gerente@test.com",
        "password": "123456"
    }')
HTTP_CODE="${RESPONSE: -3}"
BODY="${RESPONSE%???}"
show_result $HTTP_CODE "$BODY"
TOKEN7=$(extract_token "$BODY")

# 8. Login moderador
echo "8. Login moderador..."
RESPONSE=$(curl -s -w "%{http_code}" -X POST "$BASE_URL/login" \
    -H "Content-Type: application/json" \
    -d '{
        "email": "moderador@test.com",
        "password": "123456"
    }')
HTTP_CODE="${RESPONSE: -3}"
BODY="${RESPONSE%???}"
show_result $HTTP_CODE "$BODY"
TOKEN8=$(extract_token "$BODY")

# 9. Login admin
echo "9. Login admin..."
RESPONSE=$(curl -s -w "%{http_code}" -X POST "$BASE_URL/login" \
    -H "Content-Type: application/json" \
    -d '{
        "email": "admin@test.com",
        "password": "123456"
    }')
HTTP_CODE="${RESPONSE: -3}"
BODY="${RESPONSE%???}"
show_result $HTTP_CODE "$BODY"
TOKEN9=$(extract_token "$BODY")

# 10. Login super admin
echo "10. Login super admin..."
RESPONSE=$(curl -s -w "%{http_code}" -X POST "$BASE_URL/login" \
    -H "Content-Type: application/json" \
    -d '{
        "email": "superadmin@test.com",
        "password": "123456"
    }')
HTTP_CODE="${RESPONSE: -3}"
BODY="${RESPONSE%???}"
show_result $HTTP_CODE "$BODY"
TOKEN10=$(extract_token "$BODY")

# 11. Login usuario múltiple
echo "11. Login usuario múltiple..."
RESPONSE=$(curl -s -w "%{http_code}" -X POST "$BASE_URL/login" \
    -H "Content-Type: application/json" \
    -d '{
        "email": "multiple@test.com",
        "password": "123456"
    }')
HTTP_CODE="${RESPONSE: -3}"
BODY="${RESPONSE%???}"
show_result $HTTP_CODE "$BODY"
TOKEN11=$(extract_token "$BODY")

echo "🔐 Pruebas de login completadas!"
echo "=============================================="

# Probar acceso a rutas protegidas con diferentes roles
echo ""
echo "🔒 Probando acceso a rutas protegidas..."
echo "=============================================="

# Probar perfil con token de jugador
if [ ! -z "$TOKEN2" ]; then
    echo "Probando acceso al perfil con rol de jugador..."
    RESPONSE=$(curl -s -w "%{http_code}" -X GET "$BASE_URL/profile" \
        -H "Authorization: Bearer $TOKEN2")
    HTTP_CODE="${RESPONSE: -3}"
    BODY="${RESPONSE%???}"
    show_result $HTTP_CODE "$BODY"
fi

# Probar acceso a rutas de admin con token de admin
if [ ! -z "$TOKEN9" ]; then
    echo "Probando acceso a rutas de admin con rol de admin..."
    RESPONSE=$(curl -s -w "%{http_code}" -X GET "$BASE_URL/admin/users" \
        -H "Authorization: Bearer $TOKEN9")
    HTTP_CODE="${RESPONSE: -3}"
    BODY="${RESPONSE%???}"
    show_result $HTTP_CODE "$BODY"
fi

# Probar acceso a rutas de admin con token de usuario básico (debería fallar)
if [ ! -z "$TOKEN1" ]; then
    echo "Probando acceso a rutas de admin con rol de usuario básico (debería fallar)..."
    RESPONSE=$(curl -s -w "%{http_code}" -X GET "$BASE_URL/admin/users" \
        -H "Authorization: Bearer $TOKEN1")
    HTTP_CODE="${RESPONSE: -3}"
    BODY="${RESPONSE%???}"
    show_result $HTTP_CODE "$BODY"
fi

echo "🔒 Pruebas de acceso completadas!"
echo "==============================================" 