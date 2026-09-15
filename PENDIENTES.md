# Pendientes — integración Stitch (pausado el 2026-09-12)

Nada de esto está commiteado todavía.

## Ya hecho
- Base visual de Stitch en CSS puro: tokens, tipografías, Material Symbols y componentes base (Button, FormField, Modal, Select, Switch, SegmentedControl, BrandMark, Icon…).
- Estructura del panel: header con acciones, barra lateral con navegación y estado del día, barra inferior en mobile. Nada repetido entre header y barra lateral.
- Login (pantalla 02) y detalle de turno (03).
- Agenda semanal (04) y diaria/mobile (06) con datos reales: tablero semanal, línea de "ahora", huecos libres para reservar, próximo turno destacado, resumen de la semana.
- Borrados los componentes viejos WeekGrid, WeekNavigator y AlertBanner.

## Falta

### 1. Revisión general (2026-09-12)
- [x] Ajustes de la agenda verificados con Playwright.
- [x] Historial de cliente: las fechas salían en crudo ("2026-09-10T03:00:00.000Z"). Corregido.
- [ ] Historial de cliente en mobile: la tabla se corta (hay scroll horizontal); conviene pasarla a tarjetas.
- [ ] `ClientHistoryModal`, `DeleteBarberModal`, `AdminFinance` y `Login` usan todavía tokens viejos (`--brass`, `--text-*`, `--space-3`…). Funcionan por los alias, pero hay que migrarlos para poder borrar los alias.
- [ ] Dashboard: `eslint.config.js` existe pero ESLint no está en `devDependencies` ni hay script `lint`, así que el lint no corre. La Landing sí pasa el lint.
- [ ] `npm audit`: backend con 1 alta (multer, DoS) y 3 moderadas (express/body-parser/qs); dashboard con 2 moderadas (react-router: open redirect). Todas tienen arreglo con `npm audit fix`.
- [ ] No hay tests automáticos ni README en ninguno de los tres proyectos.
- [ ] Todo sigue sin commitear (158 archivos cambiados, 48 nuevos).
- Scripts de prueba en `/tmp/pw-test/pw_*_check.js` (simulan datos, no tocan la base). `/tmp` se borra al reiniciar.

### 2. Pantallas del dashboard que faltan
- [x] Modal "Nuevo turno" (13), más guardar la `note` desde el backend en `by-admin` / `by-barber`. La búsqueda de clientes ahora devuelve visitas completadas y última visita.
- [x] Mis horarios (05). Sin pausa de almuerzo ni buffer: el backend no los guarda.
- [x] Crear/editar barbero (07). Formulario de página completa para alta y edición; se borró `EditBarberModal`.
- [x] Nuevo servicio (08). Catálogo más formulario de página completa con vista previa; se borró `ServiceEditModal`.
- [x] Modal "Nuevo cliente" (09). Sin el aviso de bienvenida por WhatsApp: no existe en el backend.
- [x] Rediseñar Clientes: directorio con visitas, última visita, último servicio y total gastado (un barbero ve solo sus propios turnos).
- [x] Rediseñar Perfil y Fotos. Perfil ahora valida la contraseña con las mismas reglas que el backend (antes pedía 6 caracteres y el backend la rechazaba).
- [x] Rediseñar Finanzas y pasar sus íconos a Material Symbols. Se hizo junto con las funciones nuevas (ver sección "Finanzas nuevas").

### Finanzas nuevas (2026-09-13)
Decisiones:
- Liquidación con adelantos que se descuentan solos.
- Productos con stock y comisión para el barbero que vende.
- Caja separada en efectivo y transferencia.
- Inversiones: se registran compras ya hechas, sin planificación.

- [x] **Backend.** Migración en `Backend/db/migrations-finanzas.sql`, ya agregada a `init.sql` y aplicada en la base de desarrollo.
  - Tablas nuevas: `barber_payouts`, `barber_advances`, `products`, `product_sales` y `cash_movements`.
  - Turnos: guardan medio de pago y el % del barbero congelado al completar.
  - API en `/api/finance`: liquidaciones (pendiente, detalle, pagar, historial, anular), adelantos, productos, ventas y caja (saldo, resumen del período y libro).
  - `PATCH /appointments/:id/complete` acepta `payment_method` (opcional).
  - Verificado con un recorrido completo contra una base de prueba aparte: 40 de 40 chequeos.
- [x] **Stitch.** Se generaron las pantallas con los 9 prompts de `STITCH_PROMPTS_FINANZAS.md` y se revisaron.
- [x] **Integrado en el dashboard (2026-09-13):**
  - `/admin/finance` con pestañas Caja, Liquidaciones y Productos (`?tab=`). Panel lateral para pagar liquidaciones y para crear o editar productos, más el comprobante de pago.
  - Modales de adelanto, venta y movimiento de caja.
  - Paso "¿Cómo pagó el cliente?" al completar un turno (`AppointmentPaymentStep`).
  - Se sacó lo que Stitch inventó: sillones, terminal, bancos, categorías de producto (queda la descripción), búsqueda y CSV del libro.
  - Se borraron los gráficos viejos: `useFinanceDashboard`, `ChartCanvas`, `chartTheme`, `utils/finance` y `ui/icons.jsx`.
  - Verificado con Playwright y API simulada en 1440 px y 390 px: sin errores ni scroll horizontal.
- [ ] Probar Finanzas con datos reales, cargando el saldo inicial, un producto y una venta.
- [ ] `chart.js` ya no se usa en el dashboard: se puede sacar de `package.json`.
- [ ] Opcional: que cada barbero vea lo que tiene pendiente de cobrar desde su panel. El backend todavía no lo expone.
- [x] Que el botón "Nuevo turno" de Clientes use el modal global.
- [x] Pasar a Material Symbols los íconos viejos de `ui/icons.jsx` y borrarlo.

### 3. Landing
- [x] **Stitch (2026-09-13).** 12 prompts de `STITCH_PROMPTS_LANDING.md` → 14 pantallas en el proyecto "OFICIO Barbería Landing Page". Revisadas e integradas.
- [x] **Integrada (2026-09-13)**, corrigiendo lo que Stitch inventó (sillones, sucursal por barbero, direcciones/teléfonos/años falsos, servicios y precios inventados, ícono de cuenta, barra inferior tipo app, tarjeta de barbero falsa):
  - Tokens de Stitch en la landing (mismo sistema que el dashboard) y Material Symbols.
  - Header único con menú móvil a pantalla completa; barra fija "Reservar + WhatsApp" en mobile.
  - Inicio: hero con servicios elegibles, lista de precios como tablero, el oficio, equipo, trabajos, sucursales y cierre.
  - Barberos, perfil de barbero (con y sin fotos, monograma) y sucursales con mapa oscuro.
  - Reserva en una sola página con resumen fijo (hoja inferior en mobile), estados de error y horario ocupado (409).
  - Turno confirmado como ticket: código `#OFC-{id}`, copiar código, Google Calendar, `.ics`, cómo llegar y cancelar por WhatsApp.
  - Backend: `GET /schedules/:barberId/:weekStart/slots` ahora devuelve `taken` (horarios ocupados por día) para mostrar disponibilidad real.
  - Textos legales corregidos: ya no hablan de "Mi cuenta" ni contraseñas.
  - Verificado con Playwright y API simulada en 1440 px y 390 px: sin errores ni scroll horizontal.
- [ ] Decidir si cada barbero tiene sucursal fija (hoy la confirmación manda a "Ver sucursales").
- [ ] Renombrar "Admin Barbería" desde el dashboard o sacarlo de la landing pública.
- [ ] Probar la reserva real contra el backend (con agenda cargada) y revisar cómo llega el turno al dashboard.

### 4. Animaciones
- [ ] Pasada con los skills ui-animation, emil-design-eng, apple-design, find/improve/review-animations.

### 5. Detalles rotos y auditoría
- [ ] Código de confirmación encima del círculo, títulos cortados en mobile, fechas de ejemplo, apellido obligatorio u opcional.
- [ ] Auditoría con web-interface-guidelines y prueba final con Playwright en desktop y mobile.

## Decisiones para revisar
- Se sacaron cosas de Stitch que no tienen datos ni lógica: vista "Mes", "Bloquear horario", sillones, "Terminal", "Rendimiento óptimo".
- Se sacó "Asignar turno manual" del pie de la agenda porque repetía "Nuevo turno" del header. Los huecos libres ya abren la reserva con día y hora cargados.
- Las métricas del inicio del barbero pasaron al pie de la agenda y a la barra lateral. Los ingresos del mes quedaron en el pie ("Cobrado semana · mes $X").

## Seguridad
- [ ] Regenerar la API key de Stitch: quedó pegada en el chat.
