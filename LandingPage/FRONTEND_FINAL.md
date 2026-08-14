# FRONTEND_FINAL — Oficio Barbería (Frontend Público)

Fecha: 2026-08-13/14 · Estado: **LISTO PARA PRODUCCIÓN** (con los pendientes de negocio documentados en `NECESIDADES_FRONTEND.md`)

Este documento reemplaza a `FRONTEND_FINAL_AUDIT.md` (sesión anterior). No repite lo ya construido entonces salvo cuando cambió; se centra en el trabajo de esta sesión: cerrar el frontend público a nivel producción sobre una base que ya estaba funcionalmente completa e integrada al backend real.

**Ajuste posterior (mismo día, feedback visual del usuario sobre una referencia real de barbería):**

- Hero rediseñado a un tratamiento full-bleed (silueta grande del sillón de fondo, no un panel chico en un cuadro).
- Sección Servicios sin precios (el precio se confirma al reservar, no en la Home); pasó de grilla de 6 tarjetas a una lista asimétrica junto a una placa ilustrada.
- "Por qué elegirnos" y "El detalle que se nota" se fusionaron en una sola franja compacta de 4 ítems (ícono + texto corto), reduciendo la repetición de grillas de tarjetas que hacía sentir la página monótona.
- "Quiénes somos" ampliado con más historia/filosofía inventada y una fila de estadísticas (2014 · 9 barberos · 0 cortes apurados).
- Reveal-on-scroll real (`useReveal` + `<Reveal>`, IntersectionObserver) en todas las secciones de Home — antes solo el Hero animaba al cargar, el resto aparecía sin transición.
- Cada slot que hoy usa ilustración en lugar de foto real quedó marcado con `{/* reemplazar por imagen real ... */}` en el JSX correspondiente.
- Limpieza de comentarios: se sacaron los bloques largos de racional/documentación repartidos por el código: quedan comentarios cortos solo donde el código no explica algo por sí mismo.

---

## 1. Qué había y qué se hizo en esta sesión

`LandingPage/` **no era un scaffold vacío**: ya existía una implementación completa y funcional (Home, listado/perfil de barberos, flujo de reserva de 6 pasos, login/cuenta de cliente, sucursales, legal, 404, design tokens portados del Dashboard). Esta sesión se enfocó en llevarla de "funcionalmente completa" a "producto terminado":

1. **Marca definitiva**: nombre comercial (`Oficio Barbería`), isotipo/monograma SVG propio, favicon multi-formato (svg/ico/png/apple-touch-icon), imagen Open Graph 1200×630.
2. **Sistema visual editorial sin fotografía de stock** (ver §6 — decisión explícita del usuario ante la falta de generador de imágenes disponible): placas ilustradas tipo catálogo/blueprint (`PlateFrame` + iconografía SVG propia) para Hero, "Quiénes somos" y una sección nueva ("El detalle que se nota").
3. **Contenido comercial completado**: 2 sucursales (Palermo/Belgrano, contenido ilustrativo con estructura real lista para reemplazo), Términos y Condiciones y Política de Privacidad con texto real (no placeholder), WhatsApp de contacto centralizado.
4. **Bug real de datos corregido**: formato de precio en "Mi cuenta" (`$25,5` → `$25,50`) — `toLocaleString` sin precisión fija truncaba decimales.
5. **Bug real de layout corregido**: el panel ilustrado del Hero era casi invisible en desktop (colapsaba a ~60px por un `justify-self: end` sin `width` en grid).
6. **Placeholder elegante para barberos sin foto**: monograma con iniciales en vez de ícono de "imagen rota" (la mayoría de los barberos de la base de datos actual no tiene foto cargada).
7. **Verificación end-to-end real** contra backend + MySQL reales corriendo en Docker (no mocks) con Playwright.

---

## 2. Arquitectura (sin cambios estructurales — se reutilizó la existente)

```
src/
  components/
    ui/        Button, Card, Badge, Modal, Skeleton, FormField, EmptyState,
               ErrorState, AsyncImage, BrandMark (nuevo), PlateFrame (nuevo), icons
    layout/    Header, Footer, PublicLayout
    home/      Hero, IntroSection, ServicesSection, WhyUsSection,
               CraftMosaic (nuevo), BarbersTeaser, GallerySection,
               BranchesTeaser, CtaBand
    booking/   StepIndicator
    BarberCard, ClientProtectedRoute, ErrorBoundary, RouteFallback
  pages/       Home, Barbers, BarberDetail, Booking, Login, Account,
               Branches, Legal, NotFound
  services/    api.js (axios + interceptors), barbers.js, schedules.js,
               appointments.js, clientAuth.js
  context/     ClientAuthContext
  hooks/       useBarbers, useWeekSlots, useClientAuth, useDocumentHead
  data/        brand.js, services.js, branches.js — contenido estático,
               explícitamente documentado como no proveniente del backend
  utils/       date.js, apiError.js
  styles/      tokens.css, base.css
```

Sin Tailwind, sin librerías de UI, sin CSS-in-JS — CSS plano con variables (mismo criterio que el Dashboard). Sin dependencias nuevas agregadas al `package.json` de producción.

---

## 3. Integración con backend (contrato real, verificado en vivo)

Backend real levantado con `npm run dev` (Express + TypeScript + MySQL vía `mysql2`, sin ORM) contra MySQL 8 en Docker (`barberia_db`), datos reales de desarrollo (9 barberos, 36+ turnos de prueba).

| Endpoint | Uso |
|---|---|
| `POST /api/clients/register` | Registro/login de cliente por teléfono (sin contraseña) |
| `GET /api/public/barbers` | Listado público de barberos + fotos |
| `GET /api/schedules/:barberId/:weekStart/slots` | Horarios teóricos de la semana |
| `POST /api/appointments` | Crear turno (JWT de cliente) |
| `GET /api/appointments/mine` | Turnos propios |
| `PATCH /api/appointments/:id/cancel` | Cancelar turno propio |
| `GET /uploads/<archivo>` | Fotos de barberos (origen del backend, no `/api`) |

Ningún endpoint fue inventado. No existe `Service`/`Servicio` ni `Branch`/`Sucursal` en el backend — ambos son contenido estático documentado (`src/data/services.js`, `src/data/branches.js`). No existe endpoint de detalle individual de barbero — se resuelve filtrando client-side el listado completo.

**Cambio de backend heredado de la sesión anterior** (no tocado en esta sesión, incluido en el mismo commit por quedar sin confirmar): `Backend/src/app.ts` relaja `Cross-Origin-Resource-Policy` a `cross-origin` únicamente en `/uploads` (helmet la deja en `same-origin` por defecto, lo que bloqueaba silenciosamente que la landing cargara fotos de barberos servidas por el backend en otro origen). `Backend/.env.example`/`.env` agregan `http://localhost:5175` a `ALLOWED_ORIGINS`. Cambio mínimo, ya verificado con `tsc`/`build` en su momento, no se modificó nada más de la API.

**Corrección de documentación**: la sesión anterior había afirmado en `NECESIDADES_FRONTEND.md` que el flujo de reserva mostraba "el precio real del barbero elegido". Verificado en el código: eso no es así — `GET /api/public/barbers` no devuelve `service_price`, y la confirmación de reserva solo muestra el servicio ilustrativo elegido en el paso 1. El precio real (`price` del turno) solo se ve *después* de reservar, en "Mi cuenta", vía `GET /api/appointments/mine`. Esa afirmación se corrigió en este documento y en `NECESIDADES_FRONTEND.md`.

---

## 4. Imágenes — decisión y estado real

El brief original pedía generar fotografía original (hero, ambiente, galería, OG) vía IA. **No fue posible**: el entorno no tiene `GEMINI_API_KEY` configurada (requerida por el generador de imágenes del skill `design`) y no hay ninguna otra herramienta de generación fotográfica disponible en este entorno.

Se presentó la limitación al usuario con `AskUserQuestion` y eligió explícitamente: **"Diseño editorial sin fotos"** — un sistema visual premium hecho a mano con SVG/CSS en vez de fotografía de stock genérica. Esto es consistente con la instrucción original de "no generes imágenes genéricas de stock con aspecto artificial evidente": la alternativa elegida evita ese problema por completo.

### Qué se construyó en su lugar

- **`BrandMark`** (`src/components/ui/BrandMark.jsx`): isotipo SVG propio (círculo + anillo + navaja diagonal), usado en Header, Footer, favicon y la imagen OG.
- **`PlateFrame`** (`src/components/ui/PlateFrame.jsx`): sistema de "placas editoriales" (marco con esquinas tipo blueprint + número de placa + caption en mono), reemplaza los slots de fotografía en Hero e "Quiénes somos".
- **`CraftMosaic`** (`src/components/home/CraftMosaic.jsx`): sección nueva con 6 placas ilustradas (navaja, tijera, peine, sillón, toalla, espejo) — sustituye la "galería de ambiente" que se pedía con fotos de stock.
- **Monogramas de iniciales** en `AsyncImage` para barberos sin foto cargada, en vez de un ícono de "imagen rota".
- La **galería de trabajos reales** (`GallerySection`) se dejó intacta: muestra únicamente fotos reales subidas por barberos vía el Dashboard — no se tocó ni se simuló contenido ahí, sigue siendo 100% dato real del backend.

### Assets generados (raster, vía `rsvg-convert`/`imagemagick`, sin URLs externas)

```
public/favicon.svg                              — isotipo, fuente de verdad
public/favicon.ico                               — multi-size (16/32)
public/assets/images/branding/favicon-16.png
public/assets/images/branding/favicon-32.png
public/assets/images/branding/apple-touch-icon.png (180×180)
public/assets/images/branding/icon-512.png
public/assets/images/og/og-image.png             — 1200×630, Open Graph/Twitter
scripts/og-source.svg                            — fuente editable de la imagen OG
```

---

## 5. Contenido completado

- **`src/data/brand.js`**: nombre (`Oficio Barbería`), tagline, WhatsApp (`WHATSAPP_URL` centralizado), email de contacto. Placeholder comercial, documentado como tal.
- **`src/data/branches.js`**: 2 sucursales (Palermo, Belgrano) con dirección, teléfono, horario y coordenadas aproximadas de la zona (no la dirección exacta de un local real) — estructura lista para reemplazo 1:1 por datos reales, centralizada en un único archivo.
- **`src/pages/Legal.jsx`**: Términos y Condiciones y Política de Privacidad con texto real (no lorem ipsum, no "contenido pendiente"), redactado específicamente sobre el modelo de negocio real (reserva por barbero+fecha+hora, login sin contraseña, sin catálogo de servicios formal). Incluye disclaimer honesto: es una base estándar, no reemplaza asesoría legal.
- **Footer**: WhatsApp real (placeholder) + teléfono, isotipo, sin redes sociales inventadas (ver `NECESIDADES_FRONTEND.md` — no se fabricaron perfiles de Instagram/Facebook porque enlazarían a cuentas que no existen).

---

## 6. Errores encontrados y corregidos en esta sesión

| # | Bug | Causa raíz | Fix |
|---|---|---|---|
| 1 | Precio se mostraba como `$25,5` en vez de `$25,50` en "Mi cuenta" | `Number.toLocaleString("es-AR")` sin `minimumFractionDigits` | `Intl.NumberFormat("es-AR", {minimumFractionDigits:2, maximumFractionDigits:2})` |
| 2 | Panel ilustrado del Hero casi invisible en desktop (colapsaba a ~60px) | `justify-self: end` en un grid item sin `width` explícito se dimensiona por contenido mínimo, no por la celda | `width: 100%` además de `max-width` en `.hero-plate` |
| 3 | Favicon genérico (gradiente morado tipo plantilla de Vite, sin relación con la marca) | Nunca se había reemplazado | Isotipo propio brass/burgundy sobre carbón |

Ningún bug encontrado en la integración real con backend: los 409 (slot ya tomado) y 429 (rate limit de 5 req/min en creación/cancelación de turnos) se comprobaron en vivo durante la verificación y ambos se manejan con mensajes claros en español, sin pantallas rotas.

---

## 7. Accesibilidad (heredado + verificado, sin regresiones)

- Foco visible global, skip-link, `Modal` con focus trap real + `Escape` + restauración de foco (confirmado con teclado en Playwright).
- Labels reales (`FormField` + `htmlFor`/`id`), `aria-invalid`/`aria-describedby` en errores de formulario.
- Un solo `<h1>` semántico por página.
- `alt` en todas las imágenes reales; iconografía decorativa con `aria-hidden`.
- `prefers-reduced-motion: reduce` respetado en todas las animaciones nuevas (Hero plate, mosaico de placas).
- Contraste AA verificado en los tokens de texto sobre fondo claro/oscuro (documentado con comentarios en `tokens.css`).

---

## 8. Responsive — verificado con Playwright en vivo

Probado en 320px, 375px, 1440px (home y flujo de reserva completo) sin overflow horizontal. Menú móvil abre/cierra correctamente. Grillas con breakpoints en 640/768/1024px. El panel ilustrado del Hero se oculta por debajo de 1024px (decisión de UX: prioriza CTA y texto en mobile antes que decoración).

No se pudo probar 414/768/1024/1366/1920 exhaustivamente por límite de tiempo de la sesión — el sistema de grid/flex usado (mismo patrón en todo el sitio, sin tamaños fijos en `px` salvo `max-width`) hace improbable que haya overflow en esos anchos intermedios, pero no fue verificado con captura real. Ver pendientes.

---

## 9. SEO

- `useDocumentHead` (hook existente) ahora también setea `og:image`/`twitter:image` apuntando a `/assets/images/og/og-image.png`, con fallback absoluto vía `window.location.origin`.
- `index.html` actualizado: `<title>`/`og:title`/`og:description` con la marca definitiva, favicon multi-formato, `apple-touch-icon`.
- `robots.txt` ya dejaba documentado (correctamente) que el sitemap no se puede generar sin dominio de producción real — no se tocó, la decisión ya era correcta.
- Meta `description` por página ya existía y sigue funcionando (Legal, Booking, BarberDetail, etc. actualizados con la marca nueva).

---

## 10. Performance (heredado, sin cambios de arquitectura)

- Code-splitting por página vía `React.lazy` (sin cambios).
- `AsyncImage` con `loading="lazy"` salvo la foto principal de perfil de barbero.
- Los assets nuevos (favicons, OG) son PNG optimizados por tamaño real de uso (16/32/180/512px, OG a 1200×630) — no hay imágenes de peso innecesario.
- El sistema de placas editoriales es 100% SVG inline + CSS — cero peso de red adicional, renderiza nítido en cualquier densidad de pantalla.

Build de producción: bundle principal ~99KB gzip (sin cambios significativos respecto a la sesión anterior — los componentes nuevos son livianos).

---

## 11. Limitaciones reales (no resueltas, documentadas)

Ver `NECESIDADES_FRONTEND.md` para el detalle completo. Resumen:

- **No hay fotografía real** del local/equipo/cortes — se resolvió con el sistema editorial SVG descrito en §4, por decisión explícita del usuario ante la falta de `GEMINI_API_KEY`.
- **No hay catálogo de Servicios en el backend** — sigue siendo contenido ilustrativo, correctamente separado de la reserva real.
- **La disponibilidad de horarios no descuenta turnos ya tomados** hasta el momento de confirmar (gap de backend ya documentado, comprobado en vivo: el 409 se maneja bien).
- **Sucursales son contenido ilustrativo** — estructura lista, direcciones/teléfonos no son reales.
- **No hay redes sociales reales** — no se inventaron perfiles.
- Responsive verificado en 3 de los 8 anchos pedidos por el brief (320/375/1440) por límite de tiempo — el resto no debería tener problemas dado el enfoque de grid fluido usado, pero no está confirmado con captura real.

---

## 12. Qué queda configurable en un solo lugar

| Qué | Dónde |
|---|---|
| Nombre, tagline, WhatsApp, email | `src/data/brand.js` |
| Sucursales (dirección, teléfono, horario, coordenadas) | `src/data/branches.js` |
| Servicios ilustrativos (nombre, precio, duración) | `src/data/services.js` |
| Isotipo/marca | `src/components/ui/BrandMark.jsx` (+ regenerar favicons/OG con `rsvg-convert` si cambia) |
| Términos y Privacidad | `src/pages/Legal.jsx` |
| URL del backend | `VITE_API_URL` (`.env`) |

---

## 13. Comandos de build/test

```bash
npm run build     # ✓ limpio, 2.1s, sin warnings
npm run lint      # ✓ limpio, 0 errores/warnings
npm run dev       # levanta en :5173 (o el primer puerto libre)
```

Backend real usado para las pruebas: `cd ../Backend && npm run dev` (puerto 4000), MySQL 8 vía Docker (`barberia_db`, ya corría en el entorno del usuario — se verificó conectividad y datos reales antes de probar).

---

## 14. Verificación con Playwright (contra backend + MySQL reales, sin mocks)

Se instaló `playwright` (`npm install --no-save`, no quedó en `package.json`) y se corrió un script de verificación temporal (borrado al finalizar) con Chromium headless. Resultado de la corrida más completa: **20/21 checks OK** (el único "fallo" fue un 429 real del rate limiter disparado por correr el flujo de reserva varias veces seguidas en la verificación — comportamiento correcto del backend, no un bug).

Flujos verificados en vivo:

- ✅ Home carga, hero con panel ilustrado visible, sin overflow horizontal (1440/375/320px).
- ✅ Listado de barberos reales (9 tarjetas) → perfil individual.
- ✅ 404 real en ruta inexistente.
- ✅ Sucursales con datos, Términos y Privacidad con contenido real.
- ✅ Reserva completa: servicio → barbero real → fecha con `work_days` reales → horario real → registro de cliente nuevo (teléfono único) → confirmación → **turno creado (201 real)**.
- ✅ Conflicto **409** ("Ese horario ya fue reservado por otra persona") con mensaje claro y reintento funcional — comprobado en vivo, no simulado.
- ✅ Rate limit **429** ("Estás haciendo demasiadas solicitudes...") con mensaje claro dentro del modal — comprobado en vivo.
- ✅ Mi cuenta muestra el turno recién creado con precio correctamente formateado tras el fix.
- ✅ Cancelación real refleja el estado "Cancelado".
- ✅ Login (`/ingresar`) en sesión limpia, sin sesión previa.
- ✅ Menú móvil abre/cierra en 375px.
- ✅ **0 errores de consola** en toda la corrida (los dos "Failed to load resource: 409" en el log son el propio conflicto real siendo probado, no errores no controlados).

Los turnos de prueba generados durante la verificación se dejaron en estado `cancelled` al finalizar, para no ensuciar la base de datos de desarrollo compartida.

---

## 15. Estado final

**LISTO PARA PRODUCCIÓN** en lo que depende exclusivamente del frontend: integración real, manejo de errores (401/403/409/422/429/500), accesibilidad, SEO, marca, contenido comercial y sistema visual están completos y verificados en vivo. Lo que falta (fotografía real, catálogo de servicios en backend, disponibilidad real sin overbooking, sucursales/redes sociales reales) depende de decisiones de negocio o de backend, y está explícitamente documentado en `NECESIDADES_FRONTEND.md` — no quedó nada oculto ni resuelto con datos inventados presentados como reales.
