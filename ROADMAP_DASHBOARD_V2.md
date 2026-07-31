# Roadmap Dashboard v2.0 — BarberiaWeb

Este documento consolida **todas** las mejoras detectadas que requieren cambios de backend/base de datos y que, por lo tanto, **no se implementaron** en el Dashboard v1.0. Se generó al cerrar el rediseño de la Home ("Centro de Operaciones"), a partir de dos fuentes:

- **Parte A** — gaps de datos encontrados al auditar, campo por campo, qué información necesitaba la nueva Home y cuál de esa información existe hoy en el backend.
- **Parte B** — funcionalidades detectadas en los mockups de referencia visual (Stitch) que no tienen ningún correlato en el backend actual y que representan evoluciones de producto, no ajustes de diseño.

Nada de lo que sigue está implementado. Cada ítem indica objetivo, beneficio, cambios de backend, cambios de base de datos, cambios de frontend, complejidad estimada y prioridad sugerida.

---

## Parte A — Gaps de datos (Home v1.0)

### A1. Resumen financiero mensual self-service para el rol `barber`

- **Objetivo de negocio:** que un barbero (no solo `admin`/`admin_barber`) pueda ver cuánto facturó en el mes en curso sin depender de un administrador.
- **Beneficio para el usuario:** responde "¿cómo viene mi mes?" directamente en su propio Dashboard, hoy imposible para el rol `barber` (los endpoints de finanzas están detrás de `authorize("admin","admin_barber")`).
- **Cambios en backend:** nuevo endpoint `GET /appointments/barber/summary?from=&to=`, scoped a `req.user.id` (no a todos los barberos como hoy `GET /admin/finance/summary`). Nueva función en `appointment.model.ts` que agregue `COUNT(*)` y `SUM(price)` filtrando por `barber_id`, `status='completed'` y rango de fechas.
- **Cambios en base de datos:** ninguno — se resuelve con una query nueva sobre la tabla `appointments` existente.
- **Cambios en frontend:** nueva llamada de servicio en `services/appointments.js`; agregar tarjeta "Ingresos del mes" a la Home una vez exista el endpoint.
- **Complejidad:** Baja.
- **Prioridad:** Alta — es la pregunta de negocio más pedida ("¿cuánto facturé?") que hoy no se puede responder para el rol más común (`barber`).

### A2. Conteo de turnos cancelados

- **Objetivo de negocio:** que el barbero pueda ver cuántos turnos le cancelaron en la semana/mes.
- **Beneficio para el usuario:** hoy la query de turnos de la semana (`findAppointmentsByBarberAndWeekPaginated`) excluye estructuralmente el estado `cancelled` (`WHERE status IN ('active','completed')`) — no hay forma de derivar este número ni siquiera client-side, los datos cancelados nunca llegan al frontend.
- **Cambios en backend:** nueva función de conteo (`COUNT(*) ... WHERE barber_id=? AND status='cancelled' AND date BETWEEN ? AND ?`), expuesta como parte del endpoint de A1 o como endpoint propio.
- **Cambios en base de datos:** ninguno.
- **Cambios en frontend:** agregar la métrica al resumen operativo de la Home cuando exista.
- **Complejidad:** Baja.
- **Prioridad:** Media.

### A3. Conteo de clientes distintos atendidos

- **Objetivo de negocio:** medir alcance real de clientela (no solo turnos), útil para evaluar retención/crecimiento.
- **Beneficio para el usuario:** responde "¿a cuántos clientes distintos atendí?" en un período.
- **Cambios en backend:** nueva función `COUNT(DISTINCT client_id) ... WHERE barber_id=? AND date BETWEEN ? AND ? AND status IN ('active','completed')` — no existe ninguna query similar hoy en `appointment.model.ts`.
- **Cambios en base de datos:** ninguno.
- **Cambios en frontend:** nueva tarjeta en la Home o en una futura sección de "clientes".
- **Complejidad:** Baja.
- **Prioridad:** Baja.

### A4. Horas trabajadas / duración real por turno

- **Objetivo de negocio:** que el barbero vea cuántas horas efectivas trabajó, no solo cuántos turnos tuvo.
- **Beneficio para el usuario:** responde "¿cuántas horas trabajé esta semana?" — hoy es estructuralmente imposible de calcular con precisión: la tabla `appointments` no tiene columna `duration_minutes`, la duración solo vive en `schedules.slot_duration_minutes`, y la query de turnos de la semana no hace `JOIN` con `schedules`.
- **Cambios en backend:** opción (a) agregar `JOIN schedules s ON s.id = a.schedule_id` a la query de turnos y devolver `slot_duration_minutes`, sumando client-side; opción (b, más robusta) desnormalizar `duration_minutes` directamente en `appointments` al crear el turno, para que sobreviva a cambios futuros de horario del barbero.
- **Cambios en base de datos:** si se elige la opción (b), `ALTER TABLE appointments ADD COLUMN duration_minutes INT`.
- **Cambios en frontend:** nueva tarjeta "Horas trabajadas" en la Home.
- **Complejidad:** Media (por el cambio de esquema si se opta por la opción robusta).
- **Prioridad:** Baja.

### A5b. Registro de gastos/inversión y balance real (P&L) en Finanzas

- **Objetivo de negocio:** que el panel de Finanzas pueda mostrar un balance contable real (ingresos menos costos operativos), no solo la división turno/barbero.
- **Beneficio para el usuario:** responde "¿estoy ganando o perdiendo plata en este período?" de forma real — hoy es estructuralmente imposible: no existe ningún concepto de gasto/inversión en el modelo de datos, por lo que la "ganancia del local" siempre es un número no-negativo (es simplemente ingresos × (1 − % de reparto)), nunca puede reflejar una pérdida real del negocio.
- **Cambios en backend:** nuevos endpoints CRUD de gastos (`GET/POST/DELETE /admin/expenses`), y sumar sus totales al cálculo de `getFinancialPeriod`.
- **Cambios en base de datos:** nueva tabla `expenses (id, description, amount, category, date, created_at)`.
- **Cambios en frontend:** en la auditoría de Admin Finance (Fase 3 del pedido original) se evaluaron tarjetas de "Inversión", "Ganancia Neta" y un "Balance" contable real — se dejaron afuera de v1.0 precisamente por este gap, y quedan listas para implementarse en cuanto exista este endpoint. El "Balance" que sí se implementó en v1.0 es una versión simplificada (solo indica si hubo turnos completados en el período), aclarado como tal en el propio componente.
- **Complejidad:** Media.
- **Prioridad:** Media — es lo único que le falta al panel de Finanzas para ser un balance contable real en vez de solo una vista de reparto de turnos.

### A5. Endpoint dedicado de "turnos de hoy" / "próximo turno"

- **Objetivo de negocio:** eficiencia — evitar que el frontend tenga que traer toda la semana (paginada) y filtrar client-side para obtener solo "hoy" o "el próximo turno".
- **Beneficio para el usuario:** ninguno directo (la Home v1.0 ya resuelve esto perfectamente bien derivándolo client-side de la semana completa) — es una optimización técnica, no una funcionalidad nueva.
- **Cambios en backend:** endpoints opcionales `GET /appointments/barber/today` y/o parámetro `?date=` en el endpoint existente.
- **Cambios en base de datos:** ninguno.
- **Cambios en frontend:** simplificaría `useHomeDashboard`, pero no es necesario para que funcione hoy.
- **Complejidad:** Baja.
- **Prioridad:** Baja — nice-to-have, no bloquea nada.

---

## Parte B — Funcionalidades detectadas en mockups de referencia (Stitch)

> Nota de contexto: estos mockups se usaron únicamente como referencia visual/de layout para el rediseño (Nivel 1, ya aplicado donde correspondía). Las funcionalidades que mostraban y que **no existen en el backend actual** se documentan acá como posibles evoluciones de producto (Nivel 2), no como parte de v1.0.

### B1. Catálogo de servicios

- **Objetivo de negocio:** permitir que un barbero ofrezca varios servicios con nombre, precio y duración propios (ej. "Corte clásico", "Afeitado", "Barba"), en vez de un único `service_price` fijo por barbero.
- **Beneficio para el usuario:** turnos más expresivos y facturación más precisa; el cliente elige qué servicio quiere al reservar.
- **Cambios en backend:** nuevos endpoints CRUD de servicios (`GET/POST/PATCH/DELETE /services`), y modificar la creación de turnos para asociar un `service_id` en vez de tomar `barber.service_price` directamente.
- **Cambios en base de datos:** nueva tabla `services (id, barber_id, name, price, duration_minutes)`; `appointments` necesitaría una columna `service_id` (nullable por compatibilidad con turnos históricos).
- **Cambios en frontend:** nueva pantalla de administración de servicios; el flujo de reserva de clientes debería elegir servicio; `AppointmentDetailModal`/`WeekGrid` mostrarían el nombre del servicio.
- **Complejidad:** Alta.
- **Prioridad:** Media — es la base de varias otras mejoras (ej. "mejor servicio" en reportes), pero es un cambio de modelo de datos significativo.

### B2. Punto de venta (ventas y productos)

- **Objetivo de negocio:** registrar ventas de productos (ceras, shampoo, etc.) además de turnos de corte, para reflejar el ingreso real del local.
- **Beneficio para el usuario:** finanzas más completas; el barbero deja de subregistrar ingresos por productos vendidos fuera del sistema de turnos.
- **Cambios en backend:** nuevos endpoints de inventario y ventas (`/products`, `/sales`).
- **Cambios en base de datos:** nuevas tablas `products (id, barber_id, name, price, stock)` y `sales (id, barber_id, client_id nullable, total, created_at)` con una tabla de detalle `sale_items`.
- **Cambios en frontend:** nueva pantalla de "Ventas"/"Productos"; ampliar Finanzas para incluir ingresos por producto.
- **Complejidad:** Alta.
- **Prioridad:** Baja — cambia el alcance del producto de "libro de turnos" a "POS", conviene evaluarlo como decisión de producto aparte, no como iteración incremental.

### B3. Check-in / registro de walk-ins

- **Objetivo de negocio:** registrar clientes que llegan sin turno previo (mostrador), sin forzarlos a pasar por el flujo de reserva online.
- **Beneficio para el usuario:** el barbero puede anotar un cliente de mostrador directamente desde el Dashboard.
- **Cambios en backend:** endpoint para crear un turno "walk-in" directamente por el barbero (hoy la creación de turnos es exclusiva del flujo de cliente vía `POST /appointments`, autenticado como cliente, no como barbero).
- **Cambios en base de datos:** ninguno estructural — reutiliza `appointments`, pero podría necesitar un flag `source: 'online' | 'walk_in'`.
- **Cambios en frontend:** botón "Walk-in" en la Home o la Agenda que abra un formulario mínimo (nombre, teléfono, horario) sin pasar por el login de cliente.
- **Complejidad:** Media.
- **Prioridad:** Media — resuelve un caso de uso real de barbería física que hoy no está cubierto en absoluto.

### B4. Vista de estado del staff en vivo (multi-barbero)

- **Objetivo de negocio:** que un dueño/admin de un local con varios barberos vea de un vistazo quién está disponible/ocupado en tiempo real.
- **Beneficio para el usuario:** coordinación operativa en locales con más de un barbero atendiendo simultáneamente.
- **Cambios en backend:** requiere un concepto de "presencia"/sesión activa que hoy no existe (el sistema no trackea si un barbero está "en el local" más allá de si tiene turnos agendados).
- **Cambios en base de datos:** posible tabla de sesiones/presencia, o derivarlo de "¿tiene un turno activo ahora mismo?" (más simple, pero no es lo mismo que disponibilidad real).
- **Cambios en frontend:** widget de estado del equipo en la Home (solo para roles admin), similar a lo visto en los mockups.
- **Complejidad:** Alta (la versión "real-time" con presencia); Media (la versión aproximada basada en turnos activos).
- **Prioridad:** Baja — solo aplica a locales multi-barbero, y la versión simplificada ya se puede evaluar con datos existentes de `GET /admin/users` + turnos activos por barbero.

### B5. Sistema de notificaciones

- **Objetivo de negocio:** avisar al barbero de eventos relevantes (nuevo turno reservado, cancelación de cliente) sin que tenga que refrescar el Dashboard.
- **Beneficio para el usuario:** reduce la necesidad de estar constantemente revisando la Agenda.
- **Cambios en backend:** requiere un mecanismo de push (WebSockets/SSE) o, como mínimo, un endpoint de notificaciones persistidas (`GET /notifications`, marcar como leídas) — no existe nada de esto hoy.
- **Cambios en base de datos:** nueva tabla `notifications (id, user_id, message, read, created_at)`.
- **Cambios en frontend:** ícono de campana en el Sidebar/header (ya presente visualmente en los mockups, sin funcionalidad), panel desplegable de notificaciones.
- **Complejidad:** Alta (si se busca tiempo real); Media (si alcanza con polling + tabla persistida).
- **Prioridad:** Media.

### B6. Pantalla de configuración general

- **Objetivo de negocio:** centralizar ajustes que hoy no tienen un lugar propio (ej. preferencias de notificación, futura personalización de la landing pública del barbero).
- **Beneficio para el usuario:** un solo lugar para configurar el sistema en vez de que cada ajuste viva disperso.
- **Cambios en backend:** depende de qué ajustes se definan — hoy no hay ningún endpoint de "settings" general más allá de perfil/contraseña.
- **Cambios en base de datos:** posible tabla `user_settings` genérica tipo key-value, o columnas puntuales según lo que se decida configurar.
- **Cambios en frontend:** nueva pantalla `/settings`.
- **Complejidad:** Depende del alcance (Baja si es un placeholder mínimo, Alta si incluye personalización de landing).
- **Prioridad:** Baja — no hay un ajuste concreto pendiente hoy que la justifique; queda documentada por si surge una necesidad puntual futura.

---

## Cómo usar este documento

Cuando el equipo decida encarar la v2.0, cada ítem de este roadmap debería convertirse en su propio ciclo de: diseño de esquema → implementación de backend → briefing de diseño para la pantalla correspondiente → implementación de frontend. Ninguno de estos cambios debe mezclarse con el mantenimiento del Dashboard v1.0.
