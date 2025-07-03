#!/bin/bash

# Script para probar el registro con diferentes roles
BASE_URL="http://localhost:3001/api/auth"

echo "🧪 Probando registro con diferentes roles..."
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

# 1. Registrar usuario básico (USER)
echo "1. Registrando usuario básico (USER)..."
RESPONSE=$(curl -s -w "%{http_code}" -X POST "$BASE_URL/register" \
    -H "Content-Type: application/json" \
    -d '{
        "name": "Usuario Básico",
        "email": "usuario@test.com",
        "password": "123456",
        "phone": "1234567890"
    }')
HTTP_CODE="${RESPONSE: -3}"
BODY="${RESPONSE%???}"
show_result $HTTP_CODE "$BODY"

# 2. Registrar jugador (PLAYER)
echo "2. Registrando jugador (PLAYER)..."
RESPONSE=$(curl -s -w "%{http_code}" -X POST "$BASE_URL/register" \
    -H "Content-Type: application/json" \
    -d '{
        "name": "Jugador Test",
        "email": "jugador@test.com",
        "password": "123456",
        "phone": "1234567891",
        "roles": ["player"]
    }')
HTTP_CODE="${RESPONSE: -3}"
BODY="${RESPONSE%???}"
show_result $HTTP_CODE "$BODY"

# 3. Registrar capitán de equipo (TEAM_CAPTAIN)
echo "3. Registrando capitán de equipo (TEAM_CAPTAIN)..."
RESPONSE=$(curl -s -w "%{http_code}" -X POST "$BASE_URL/register" \
    -H "Content-Type: application/json" \
    -d '{
        "name": "Capitán Test",
        "email": "capitan@test.com",
        "password": "123456",
        "phone": "1234567892",
        "roles": ["team_captain"]
    }')
HTTP_CODE="${RESPONSE: -3}"
BODY="${RESPONSE%???}"
show_result $HTTP_CODE "$BODY"

# 4. Registrar entrenador (COACH)
echo "4. Registrando entrenador (COACH)..."
RESPONSE=$(curl -s -w "%{http_code}" -X POST "$BASE_URL/register" \
    -H "Content-Type: application/json" \
    -d '{
        "name": "Entrenador Test",
        "email": "entrenador@test.com",
        "password": "123456",
        "phone": "1234567893",
        "roles": ["coach"]
    }')
HTTP_CODE="${RESPONSE: -3}"
BODY="${RESPONSE%???}"
show_result $HTTP_CODE "$BODY"

# 5. Registrar árbitro (REFEREE)
echo "5. Registrando árbitro (REFEREE)..."
RESPONSE=$(curl -s -w "%{http_code}" -X POST "$BASE_URL/register" \
    -H "Content-Type: application/json" \
    -d '{
        "name": "Árbitro Test",
        "email": "arbitro@test.com",
        "password": "123456",
        "phone": "1234567894",
        "roles": ["referee"]
    }')
HTTP_CODE="${RESPONSE: -3}"
BODY="${RESPONSE%???}"
show_result $HTTP_CODE "$BODY"

# 6. Registrar dueño de cancha (FIELD_OWNER)
echo "6. Registrando dueño de cancha (FIELD_OWNER)..."
RESPONSE=$(curl -s -w "%{http_code}" -X POST "$BASE_URL/register" \
    -H "Content-Type: application/json" \
    -d '{
        "name": "Dueño Cancha Test",
        "email": "dueno@test.com",
        "password": "123456",
        "phone": "1234567895",
        "roles": ["field_owner"]
    }')
HTTP_CODE="${RESPONSE: -3}"
BODY="${RESPONSE%???}"
show_result $HTTP_CODE "$BODY"

# 7. Registrar gerente de cancha (FIELD_MANAGER)
echo "7. Registrando gerente de cancha (FIELD_MANAGER)..."
RESPONSE=$(curl -s -w "%{http_code}" -X POST "$BASE_URL/register" \
    -H "Content-Type: application/json" \
    -d '{
        "name": "Gerente Cancha Test",
        "email": "gerente@test.com",
        "password": "123456",
        "phone": "1234567896",
        "roles": ["field_manager"]
    }')
HTTP_CODE="${RESPONSE: -3}"
BODY="${RESPONSE%???}"
show_result $HTTP_CODE "$BODY"

# 8. Registrar moderador (MODERATOR)
echo "8. Registrando moderador (MODERATOR)..."
RESPONSE=$(curl -s -w "%{http_code}" -X POST "$BASE_URL/register" \
    -H "Content-Type: application/json" \
    -d '{
        "name": "Moderador Test",
        "email": "moderador@test.com",
        "password": "123456",
        "phone": "1234567897",
        "roles": ["moderator"]
    }')
HTTP_CODE="${RESPONSE: -3}"
BODY="${RESPONSE%???}"
show_result $HTTP_CODE "$BODY"

# 9. Registrar administrador (ADMIN)
echo "9. Registrando administrador (ADMIN)..."
RESPONSE=$(curl -s -w "%{http_code}" -X POST "$BASE_URL/register" \
    -H "Content-Type: application/json" \
    -d '{
        "name": "Admin Test",
        "email": "admin@test.com",
        "password": "123456",
        "phone": "1234567898",
        "roles": ["admin"]
    }')
HTTP_CODE="${RESPONSE: -3}"
BODY="${RESPONSE%???}"
show_result $HTTP_CODE "$BODY"

# 10. Registrar super administrador (SUPER_ADMIN)
echo "10. Registrando super administrador (SUPER_ADMIN)..."
RESPONSE=$(curl -s -w "%{http_code}" -X POST "$BASE_URL/register" \
    -H "Content-Type: application/json" \
    -d '{
        "name": "Super Admin Test",
        "email": "superadmin@test.com",
        "password": "123456",
        "phone": "1234567899",
        "roles": ["super_admin"]
    }')
HTTP_CODE="${RESPONSE: -3}"
BODY="${RESPONSE%???}"
show_result $HTTP_CODE "$BODY"

# 11. Registrar usuario con múltiples roles
echo "11. Registrando usuario con múltiples roles..."
RESPONSE=$(curl -s -w "%{http_code}" -X POST "$BASE_URL/register" \
    -H "Content-Type: application/json" \
    -d '{
        "name": "Usuario Múltiple Test",
        "email": "multiple@test.com",
        "password": "123456",
        "phone": "1234567800",
        "roles": ["player", "team_captain", "coach"]
    }')
HTTP_CODE="${RESPONSE: -3}"
BODY="${RESPONSE%???}"
show_result $HTTP_CODE "$BODY"

echo "🧪 Pruebas completadas!"
echo "==============================================" 