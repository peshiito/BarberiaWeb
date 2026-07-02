# ============================================

# 1. HEALTH CHECK

# ============================================

curl http://localhost:3000/health

# ============================================

# 2. AUTH - REGISTRO

# ============================================

# Registrar Admin (solo admin puede crear users)

curl -X POST http://localhost:3000/api/auth/register/user \
 -H "Content-Type: application/json" \
 -d '{
"email": "nuevoadmin@barberia.com",
"password": "Admin123!",
"fullName": "Nuevo Admin",
"role": "admin",
"phone": "123456789"
}'

# Registrar Barbero

curl -X POST http://localhost:3000/api/auth/register/user \
 -H "Content-Type: application/json" \
 -d '{
"email": "barbero2@barberia.com",
"password": "Barber123!",
"fullName": "Pedro Barber",
"role": "barber",
"phone": "987654321"
}'

# Registrar Cliente (público)

curl -X POST http://localhost:3000/api/auth/register/client \
 -H "Content-Type: application/json" \
 -d '{
"fullName": "Maria Cliente",
"phone": "1122334455",
"email": "maria@email.com",
"password": "Client123!"
}'

# ============================================

# 3. AUTH - LOGIN

# ============================================

# Login Admin (password: Admin123!)

curl -X POST http://localhost:3000/api/auth/login/user \
 -H "Content-Type: application/json" \
 -d '{
"email": "admin@barberia.com",
"password": "Admin123!"
}'

# Login Barbero (password: Barber123!)

curl -X POST http://localhost:3000/api/auth/login/user \
 -H "Content-Type: application/json" \
 -d '{
"email": "barber@barberia.com",
"password": "Barber123!"
}'

# Login Cliente (password: Client123!)

curl -X POST http://localhost:3000/api/auth/login/client \
 -H "Content-Type: application/json" \
 -d '{
"phone": "123456789",
"password": "Client123!"
}'

# ============================================

# 4. AUTH - GET ME (requiere token)

# ============================================

# Reemplazar TOKEN con el token obtenido del login

TOKEN="tu_token_aqui"

curl -X GET http://localhost:3000/api/auth/me \
 -H "Authorization: Bearer $TOKEN"

# ============================================

# 5. ADMIN - DASHBOARD (requiere token admin)

# ============================================

curl -X GET "http://localhost:3000/api/admin/dashboard?startDate=2024-01-01&endDate=2024-12-31" \
 -H "Authorization: Bearer $TOKEN_ADMIN"

# ============================================

# 6. ADMIN - BARBEROS (requiere token admin)

# ============================================

# Obtener todos los barberos

curl -X GET http://localhost:3000/api/admin/barbers \
 -H "Authorization: Bearer $TOKEN_ADMIN"

# Crear barbero (requiere admin)

curl -X POST http://localhost:3000/api/admin/barbers \
 -H "Content-Type: application/json" \
 -H "Authorization: Bearer $TOKEN_ADMIN" \
 -d '{
"email": "nuevobarbero@barberia.com",
"password": "Barber123!",
"fullName": "Nuevo Barbero",
"phone": "555555555",
"branchId": 1,
"specialty": "Corte y Barba",
"experienceYears": 3,
"bio": "Especialista en cortes modernos"
}'

# Desactivar barbero

curl -X PUT http://localhost:3000/api/admin/barbers/1/deactivate \
 -H "Authorization: Bearer $TOKEN_ADMIN"

# ============================================

# 7. ADMIN - SEDES (requiere token admin)

# ============================================

# Obtener todas las sedes

curl -X GET http://localhost:3000/api/admin/branches \
 -H "Authorization: Bearer $TOKEN_ADMIN"

# Crear sede

curl -X POST http://localhost:3000/api/admin/branches \
 -H "Content-Type: application/json" \
 -H "Authorization: Bearer $TOKEN_ADMIN" \
 -d '{
"name": "Sede Sur",
"address": "Av. Sur 789",
"phone": "111222333",
"email": "sur@barberia.com",
"scheduleInfo": "Lun-Sab 10:00-19:00"
}'

# ============================================

# 8. ADMIN - CLIENTES (requiere token admin)

# ============================================

curl -X GET http://localhost:3000/api/admin/clients \
 -H "Authorization: Bearer $TOKEN_ADMIN"

# ============================================

# 9. BARBER - PROFILE (requiere token barber)

# ============================================

TOKEN_BARBER="tu_token_barber_aqui"

curl -X GET http://localhost:3000/api/barber/profile \
 -H "Authorization: Bearer $TOKEN_BARBER"

# ============================================

# 10. BARBER - HORARIOS (requiere token barber)

# ============================================

# Obtener horario actual

curl -X GET http://localhost:3000/api/barber/schedule \
 -H "Authorization: Bearer $TOKEN_BARBER"

# Configurar semana completa

curl -X POST http://localhost:3000/api/schedule/week \
 -H "Content-Type: application/json" \
 -H "Authorization: Bearer $TOKEN_BARBER" \
 -d '{
"branchId": 1,
"weekStartDate": "2026-07-06",
"weekEndDate": "2026-07-12",
"startTime": "09:00",
"endTime": "19:00",
"slotInterval": 30,
"breakStart": "13:00",
"breakEnd": "14:00",
"days": [
{ "dayOfWeek": 1, "isWorking": true },
{ "dayOfWeek": 2, "isWorking": true },
{ "dayOfWeek": 3, "isWorking": true },
{ "dayOfWeek": 4, "isWorking": true },
{ "dayOfWeek": 5, "isWorking": true },
{ "dayOfWeek": 6, "isWorking": true },
{ "dayOfWeek": 7, "isWorking": false }
]
}'

# Obtener todos los horarios configurados

curl -X GET http://localhost:3000/api/schedule \
 -H "Authorization: Bearer $TOKEN_BARBER"

# ============================================

# 11. BARBER - SERVICIOS (requiere token barber)

# ============================================

# Crear servicio

curl -X POST http://localhost:3000/api/services \
 -H "Content-Type: application/json" \
 -H "Authorization: Bearer $TOKEN_BARBER" \
 -d '{
"name": "Corte con Tijera",
"description": "Corte detallado con tijera",
"duration": 45,
"price": 2000
}'

# Obtener servicios

curl -X GET http://localhost:3000/api/services \
 -H "Authorization: Bearer $TOKEN_BARBER"

# Actualizar servicio

curl -X PUT http://localhost:3000/api/services/1 \
 -H "Content-Type: application/json" \
 -H "Authorization: Bearer $TOKEN_BARBER" \
 -d '{
"name": "Corte Premium",
"duration": 60,
"price": 2500
}'

# Eliminar servicio

curl -X DELETE http://localhost:3000/api/services/1 \
 -H "Authorization: Bearer $TOKEN_BARBER"

# ============================================

# 12. BARBER - TURNOS (requiere token barber)

# ============================================

# Obtener turnos del día

curl -X GET "http://localhost:3000/api/barber/appointments?date=2026-07-06" \
 -H "Authorization: Bearer $TOKEN_BARBER"

# Completar turno

curl -X PUT http://localhost:3000/api/barber/appointments/1/complete \
 -H "Authorization: Bearer $TOKEN_BARBER"

# Marcar como no asistió

curl -X PUT http://localhost:3000/api/barber/appointments/1/no-show \
 -H "Authorization: Bearer $TOKEN_BARBER"

# ============================================

# 13. BARBER - FOTOS (requiere token barber)

# ============================================

# Subir foto (con archivo)

curl -X POST http://localhost:3000/api/photos/upload \
 -H "Authorization: Bearer $TOKEN_BARBER" \
 -F "photo=@/ruta/a/tu/imagen.jpg" \
 -F "title=Mi trabajo" \
 -F "description=Corte moderno" \
 -F "isProfile=true"

# Obtener fotos

curl -X GET http://localhost:3000/api/photos \
 -H "Authorization: Bearer $TOKEN_BARBER"

# Eliminar foto

curl -X DELETE http://localhost:3000/api/photos/1 \
 -H "Authorization: Bearer $TOKEN_BARBER"

# Establecer foto de perfil

curl -X PUT http://localhost:3000/api/photos/1/profile \
 -H "Authorization: Bearer $TOKEN_BARBER"

# ============================================

# 14. CLIENTE - TURNOS (requiere token client)

# ============================================

TOKEN_CLIENT="tu_token_client_aqui"

# Obtener horarios disponibles

curl -X GET "http://localhost:3000/api/appointments/available-slots?barberId=1&date=2026-07-06" \
 -H "Authorization: Bearer $TOKEN_CLIENT"

# Crear turno (con idempotency-key)

curl -X POST http://localhost:3000/api/appointments \
 -H "Content-Type: application/json" \
 -H "Authorization: Bearer $TOKEN_CLIENT" \
 -H "Idempotency-Key: $(uuidgen || echo "test-key-123")" \
 -d '{
"barberId": 1,
"branchId": 1,
"serviceId": 1,
"date": "2026-07-06",
"time": "10:00",
"notes": "Primer turno"
}'

# Obtener mis turnos

curl -X GET "http://localhost:3000/api/appointments/my?startDate=2026-07-01&endDate=2026-07-31" \
 -H "Authorization: Bearer $TOKEN_CLIENT"

# Cancelar turno

curl -X PUT http://localhost:3000/api/appointments/1/cancel \
 -H "Content-Type: application/json" \
 -H "Authorization: Bearer $TOKEN_CLIENT" \
 -d '{
"reason": "No puedo asistir"
}'
