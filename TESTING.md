# TESTING.md — Guía oficial de pruebas de BarberiaWeb

Este documento permite a cualquier desarrollador levantar el proyecto y probar todas las funcionalidades del Dashboard y del Backend **sin tener que leer el código**. Se mantiene actualizado junto con el desarrollo.

---

## 0. Levantar el entorno

```bash
# Base de datos (MySQL + phpMyAdmin)
cd Backend
docker compose up -d

# Backend (API en http://localhost:4000)
npm install
npm run dev

# Dashboard (en http://localhost:5173 o el siguiente puerto libre)
cd ../dashboard
npm install
npm run dev
```

phpMyAdmin queda disponible en `http://localhost:8080` (usuario `root`, contraseña `root` según `docker-compose.yml`) para inspeccionar la base de datos directamente si hace falta.

---

## 1. Usuarios de prueba

### 1.1 Usuarios que ya existen en la base de datos de desarrollo

Estos usuarios fueron creados manualmente durante un desarrollo anterior, sin un seed con contraseña documentada — la contraseña original nunca quedó registrada en texto plano (solo el hash de bcrypt, que no es reversible). Para poder usarlos como cuentas de prueba, **su contraseña fue reseteada a un valor conocido y común a los 5**: `Test1234!`. Si se vuelve a necesitar, se resetea igual que se hizo acá: generando un hash de bcrypt nuevo y actualizando `password_hash` directo en la base de datos.

| Nombre | Email | Contraseña | Rol | Descripción del rol | Qué probar con esta cuenta |
|---|---|---|---|---|---|
| Juan Perez | `juan@test.com` | `Test1234!` | `barber` | Barbero con perfil parcialmente cargado | Tiene bio cargada pero `service_price = 0` → debería aparecer la alerta "no configuraste el precio de tu servicio" en la Home |
| Pedro Lopez | `pedro@test.com` | `Test1234!` | `barber` | Barbero con perfil parcialmente cargado | `service_price = 5000` pero sin bio → debería aparecer la alerta "tu descripción está vacía" en la Home |
| Admin Root | `admin@test.com` | `Test1234!` | `admin` | Administrador sin turnos propios | `/admin/barbers`, `/admin/finance`; sirve para probar que un `admin` puro no puede operar `/photos` (403) |
| Admin Root | `admin@barberia.com` | `Test1234!` | `admin` | Administrador sin turnos propios | Igual que el anterior — cuenta admin alternativa |
| Admin Root | `nuevo@admin.com` | `Test1234!` | `admin` | Administrador sin turnos propios | Igual que el anterior — cuenta admin alternativa |

> No hay ningún usuario con rol `admin_barber` cargado por defecto — hay que crear uno manualmente (ver 1.3) para probar ese rol combinado.

### 1.2 Roles del sistema

| Rol | Descripción | Qué puede probar |
|---|---|---|
| `admin` | Administra el local: alta de barberos, ve finanzas de todos. **No tiene turnos propios** — el rol `admin` puro no gestiona agenda/perfil/fotos como un barbero (ver limitación en la sección 6). | `/admin/barbers`, `/admin/finance` |
| `barber` | Barbero que atiende turnos. Es el rol principal del Dashboard. | Agenda (Home), Mis horarios, Perfil, Fotos y bio |
| `admin_barber` | Combina ambos: atiende turnos propios **y** administra barberos/finanzas. | Todo lo anterior + `/admin/barbers` + `/admin/finance` |

### 1.3 Cómo crear un set completo de usuarios de prueba con contraseña conocida

**Paso 1 — Crear un admin con el script de seed** (única vía "oficial" de seed que trae el proyecto):

```bash
cd Backend
npx ts-node src/scripts/seed-admin.ts admin.qa@test.com Test1234! Admin QA
```

**Paso 2 — Loguearse como ese admin y guardar el token:**

```bash
curl -s -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin.qa@test.com","password":"Test1234!"}'
# copiar el valor de "token" de la respuesta
```

**Paso 3 — Crear un barbero y un admin_barber de prueba usando ese token** (mismo endpoint que usa `/admin/barbers` en el Dashboard):

```bash
TOKEN="<pegar token del paso 2>"

curl -s -X POST http://localhost:4000/api/admin/barbers \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"first_name":"Barbero","last_name":"QA","email":"barber.qa@test.com","password":"Test1234!","role":"barber","service_price":4500}'

curl -s -X POST http://localhost:4000/api/admin/barbers \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"first_name":"AdminBarber","last_name":"QA","email":"adminbarber.qa@test.com","password":"Test1234!","role":"admin_barber","service_price":6000}'
```

Con esto quedan 3 cuentas con contraseña conocida (`Test1234!`) cubriendo los 3 roles. Los barberos creados así arrancan **sin agenda, sin fotos y sin bio** — a propósito, para poder probar las alertas de perfil incompleto de la Home (ver sección 5).

---

## 2. Datos de prueba

Para probar el sistema de punta a punta hace falta cargar manualmente lo siguiente (ninguno viene precargado):

| Dato | Cómo se carga | Notas |
|---|---|---|
| **Agenda (schedule)** | Desde el Dashboard, pantalla "Mis horarios" (`/schedule`), o vía `POST /schedules` | ⚠️ El campo `work_days` es `VARCHAR(50)` en la base de datos. Si se seleccionan los 7 días con sus nombres completos en español separados por coma, el string supera los 50 caracteres y la creación falla con error 500. Usar como máximo 5-6 días o nombres cortos al probar por API directamente; desde el Dashboard el `DayPicker` no tiene este problema porque no llegan a superarse los 50 caracteres con el set de días que ofrece. |
| **Turnos (appointments)** | Se crean únicamente desde el lado del **cliente** (`POST /appointments`, requiere login de cliente vía `POST /clients/register`), no hay forma de que un barbero cree un turno manualmente para un cliente todavía | Necesita que exista una agenda abierta para esa semana y que el horario elegido esté dentro de los slots generados |
| **Clientes** | `POST /clients/register` (nombre, apellido, teléfono) — si el teléfono ya existe, devuelve el cliente existente en vez de duplicar | No requiere contraseña, el login de cliente es solo por teléfono |
| **Fotos** | Pantalla "Fotos y bio" (`/photos`), sube hasta 4 imágenes por barbero | Solo `.jpg`, `.jpeg`, `.png`, `.webp`, máximo 5MB por archivo |
| **Perfil** | Pantalla "Mi perfil" (`/profile`): nombre, apellido, precio de servicio, contraseña. La bio se edita desde "Fotos y bio", no desde "Mi perfil" | — |
| **Finanzas** | Se calculan solo sobre turnos con `status = 'completed'` — hay que completar turnos (botón "Marcar completado" en el detalle del turno) para que aparezcan en `/admin/finance` | Los turnos "activos" o "cancelados" no suman a la facturación. **Ya hay datos reales cargados para probar esto sin configurar nada**: Pedro Lopez (`pedro@test.com`) tiene agenda abierta y turnos completados tanto en la semana del 13/07/2026 como en la del 20/07/2026 — alcanza con entrar a `/admin/finance` como cualquier cuenta admin y poner ese rango de fechas para ver el panel de Métricas Financieras con tendencias reales (▲/▼) comparando ambas semanas. |

---

## 3. Rutas del Dashboard

| Ruta | Quién puede acceder | Descripción |
|---|---|---|
| `/login` | Público | Inicio de sesión de barberos/admins |
| `/` | Cualquier usuario autenticado | Home / Agenda — Centro de operaciones: alertas, resumen del día/semana, grilla semanal de turnos |
| `/schedule` | Cualquier usuario autenticado | "Mis horarios" — abrir agenda semanal (días, horario, duración de turno) |
| `/profile` | Cualquier usuario autenticado | "Mi perfil" — nombre, apellido, precio de servicio, cambio de contraseña |
| `/photos` | Cualquier usuario autenticado a nivel de ruta, **pero el backend rechaza con 403 a un `admin` puro** (los endpoints de fotos requieren rol `barber` o `admin_barber`) | "Fotos y bio" — descripción pública y hasta 4 fotos |
| `/admin/barbers` | Solo `admin` / `admin_barber` (redirige a `/` si no) | Alta de nuevos barberos y listado de usuarios registrados |
| `/admin/finance` | Solo `admin` / `admin_barber` (redirige a `/` si no) | Resumen financiero por barbero en un rango de fechas |

---

## 4. Endpoints principales

Base URL: `http://localhost:4000/api`

### Auth
| Método | Endpoint | Descripción |
|---|---|---|
| POST | `/auth/login` | Login de barbero/admin, devuelve JWT. Rate limit: 10 intentos / 15 min |

### Profile (requiere JWT de barbero/admin)
| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/profile/me` | Perfil propio (sin `password_hash`) |
| PATCH | `/profile/me` | Actualiza solo la `bio` |
| PATCH | `/profile/me/details` | Actualiza nombre, apellido y precio de servicio |
| PATCH | `/profile/me/password` | Cambia contraseña (valida la actual antes de aceptar) |

### Schedules (agenda)
| Método | Endpoint | Auth | Descripción |
|---|---|---|---|
| GET | `/schedules/mine` | JWT barbero | Lista todas las agendas abiertas del barbero |
| GET | `/schedules/:barberId/:weekStart/slots` | Público | Slots disponibles de un barbero para una semana (404 si no abrió agenda esa semana) |
| POST | `/schedules` | JWT barbero | Crea una agenda semanal (días, horario, duración de turno) |

### Appointments (turnos) — rate limit 5 req/min en todo el módulo
| Método | Endpoint | Auth | Descripción |
|---|---|---|---|
| POST | `/appointments` | JWT cliente | Reserva un turno |
| PATCH | `/appointments/:id/cancel` | JWT cliente | El cliente cancela su propio turno |
| GET | `/appointments/mine` | JWT cliente | Turnos del cliente logueado |
| GET | `/appointments/barber/week/:weekStart` | JWT barbero | Turnos del barbero para una semana (paginado, máx. 50 por página) |
| PATCH | `/appointments/:id/complete` | JWT barbero | Marca un turno como completado |
| PATCH | `/appointments/:id/cancel-by-barber` | JWT barbero | El barbero cancela un turno |

### Photos
| Método | Endpoint | Auth | Descripción |
|---|---|---|---|
| POST | `/photos` | JWT barbero/admin_barber | Sube una foto (multipart, campo `photo`, máx. 4 fotos, 5MB c/u) |
| GET | `/photos/mine` | JWT barbero/admin_barber | Lista las fotos propias |
| DELETE | `/photos/:id` | JWT barbero/admin_barber | Elimina una foto propia |

### Admin
| Método | Endpoint | Auth | Descripción |
|---|---|---|---|
| POST | `/admin/barbers` | JWT admin/admin_barber | Crea un nuevo barbero/admin/admin_barber |
| GET | `/admin/users` | JWT admin/admin_barber | Lista usuarios paginada |
| GET | `/admin/finance/summary` | JWT admin/admin_barber | Ingresos y reparto por barbero en un rango de fechas |
| GET | `/admin/finance/period` | JWT admin/admin_barber | ⚠️ Devuelve 500 siempre — la query SQL referencia columnas que su propia subconsulta nunca calcula. El Dashboard no lo usa (calcula los totales del período sumando `/admin/finance/summary` client-side) hasta que se corrija. Ver sección 6. |

### Clients — rate limit 10 req/15min
| Método | Endpoint | Descripción |
|---|---|---|
| POST | `/clients/register` | Registra o loguea un cliente por teléfono, devuelve JWT de cliente |

### Public
| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/public/barbers` | Listado público de barberos (pensado para la futura Landing Page) |

---

## 5. Casos de prueba recomendados

- [ ] Login correcto
- [ ] Login incorrecto (contraseña equivocada)
- [ ] Login con más de 10 intentos en 15 min → bloqueo temporal (429)
- [ ] Home: alertas aparecen si falta agenda / precio / bio / fotos
- [ ] Home: alertas desaparecen a medida que se completa cada dato
- [ ] Home: los 6 stat cards muestran números reales (no vacíos ni "NaN")
- [ ] Abrir agenda semanal (días + horario + duración)
- [ ] Intentar abrir una agenda ya existente para la misma semana (debe rechazar con 409)
- [ ] Editar perfil (nombre, apellido, precio)
- [ ] Cambiar contraseña (caso correcto)
- [ ] Cambiar contraseña con la actual incorrecta (debe rechazar)
- [ ] Editar descripción (bio)
- [ ] Subir foto
- [ ] Subir una 5ª foto (debe rechazar, máximo 4)
- [ ] Eliminar foto
- [ ] Reservar turno como cliente
- [ ] Reservar dos turnos el mismo día como cliente (debe rechazar)
- [ ] Cancelar turno desde el cliente
- [ ] Cancelar turno desde el barbero (modal de detalle, con confirmación de dos pasos)
- [ ] Completar turno → aparece toast de confirmación y el turno pasa a "Completado"
- [ ] Ver finanzas con un rango de fechas que incluya turnos completados
- [ ] Panel "Métricas Financieras" muestra tendencias (▲/▼) comparando contra el período anterior de igual duración
- [ ] Tabla de barberos: el de mayor ingreso del período tiene el badge "Top"
- [ ] Alta de barbero desde `/admin/barbers`
- [ ] Alta de barbero con un email ya registrado (debe rechazar con 409)
- [ ] Verificar permisos por rol: barbero normal no ve "Administración" en el Sidebar
- [ ] Intentar acceder a `/admin/barbers` o `/admin/finance` por URL directa siendo `barber` → debe redirigir a `/`
- [ ] Logout (limpia sesión y vuelve a `/login`)

---

## 6. Problemas conocidos

- **`work_days` puede desbordar `VARCHAR(50)`** si se cargan los 7 días por API con nombres completos separados por coma (ver sección 2). No ocurre usando el Dashboard normalmente.
- **Turnos cancelados no llegan al frontend**: la consulta de turnos por semana los excluye a nivel de base de datos (`status IN ('active','completed')`), así que hoy no hay forma de contar cancelaciones ni mostrarlas en la Agenda.
- **No existe reporte mensual/de ingresos self-service para el rol `barber`** — la información financiera solo está disponible para `admin`/`admin_barber`, y no filtrada por barbero individual.
- **El rol `admin` puro comparte pantallas pensadas para barberos** (Home, Agenda, Mis horarios, Perfil) sin que tengan sentido para una cuenta que no atiende turnos; y `/photos` rechaza con 403 a nivel de backend para ese rol aunque la ruta del Dashboard es visitable. No hay una experiencia separada para "admin sin turnos propios".
- **Rate limiting agresivo en desarrollo**: 5 solicitudes/minuto en todo `/api/appointments` — pruebas manuales rápidas y repetidas pueden disparar un 429 real. No es un bug, es el límite configurado.
- **No hay endpoint para que un barbero cree turnos manualmente** (walk-ins) — todo turno se origina desde el flujo de cliente.
- **`GET /admin/finance/period` está roto (500 siempre)**: la query SQL del backend referencia `be.barber_earnings` y `be.shop_earnings`, columnas que la subconsulta (CTE) nunca calcula. Nadie lo había detectado porque el endpoint nunca se llamaba desde el Dashboard. El panel de Métricas Financieras de `/admin/finance` evita este endpoint a propósito y calcula los mismos totales sumando `/admin/finance/summary` (que sí funciona) del lado del frontend. Se puede seguir arreglando el endpoint en el backend sin que el Dashboard dependa de eso.
- **Responsive**: solo la Home y Finanzas fueron rediseñadas y verificadas en este pase; el resto de las pantallas (Login, Schedule, Photos, Profile, AdminBarbers) todavía no tuvo una pasada de consistencia visual ni una revisión de responsive dedicada.
- Para el detalle completo de funcionalidades que requieren backend nuevo (catálogo de servicios, POS, walk-ins, notificaciones, etc.), ver **`ROADMAP_DASHBOARD_V2.md`** en la raíz del repo — no se documentan de nuevo acá para no duplicar.

---

## 7. Estado actual

**Backend:** Funcionalmente completo para el alcance de v1.0 (auth, perfil, agendas, turnos, fotos, administración de barberos, finanzas básicas). Sin tests automatizados. Rate limiting y validación con Zod en su lugar.

**Dashboard:** Home ("Centro de Operaciones") y Finanzas (panel "Métricas Financieras" + tabla profesional) rediseñadas y verificadas end-to-end, con role-gating corregido. El resto de las pantallas (Login, Mis horarios, Perfil, Fotos, AdminBarbers) están funcionales pero todavía no recibieron la misma pasada de diseño/consistencia visual.

**Landing Page:** No iniciada — fuera de alcance de este sprint por decisión explícita del proyecto.

**Roadmap:** Ver `ROADMAP_DASHBOARD_V2.md` — mejoras de datos (resumen mensual self-service, conteo de cancelados, clientes distintos, horas trabajadas) y funcionalidades de producto de mayor alcance (catálogo de servicios, POS, walk-ins, staff en vivo, notificaciones, configuración), ninguna implementada aún.
