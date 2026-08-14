# NECESIDADES_FRONTEND — Oficio Barbería (Frontend Público)

Actualizado 2026-08-14, tras la sesión de cierre a nivel producción. Ver `FRONTEND_FINAL.md` para el detalle completo de lo implementado.

Este documento separa tres cosas:

- 🟩 **Resuelto automáticamente** — decisiones que se tomaron y ejecutaron sin bloquear en esta sesión (contenido inventado razonablemente, assets generados, bugs corregidos).
- 🟨 **Requiere backend** — funcionalidad que no existe hoy en `Backend/src` y no se puede resolver solo desde el frontend sin inventar un contrato falso.
- 🟦 **Decisión / dato opcional del usuario** — todo lo que sigue siendo contenido placeholder razonable, pero que idealmente se reemplaza por un dato real cuando el usuario lo tenga (no bloquea producción, el sitio funciona igual mientras tanto).

---

## 🟩 Resuelto automáticamente en esta sesión

| Ítem | Cómo quedó |
|---|---|
| Nombre de marca | `Oficio Barbería` (antes: placeholder "BarberiaWeb", nombre interno del proyecto) |
| Logo / isotipo | `BrandMark` propio (SVG, círculo + navaja), usado en Header/Footer/favicon/OG |
| Favicon | Reemplazado el gradiente morado genérico de plantilla por el isotipo de marca, en svg/ico/png/apple-touch-icon |
| Imagen OG (1200×630) | Generada (`public/assets/images/og/og-image.png`), fuente editable en `scripts/og-source.svg` |
| Fotografía de hero/ambiente/galería | Reemplazada por sistema editorial SVG/CSS (`PlateFrame`, `CraftMosaic`, `BrandMark`) — decisión explícita del usuario, ver sección "Imágenes" más abajo |
| Placeholder de barberos sin foto | Monograma de iniciales en vez de ícono de "imagen rota" |
| Sucursales | 2 sucursales con contenido comercial completo (dirección, teléfono, horario, mapa embebido sin API key) |
| Términos y condiciones / Política de privacidad | Texto real redactado sobre el modelo de negocio real (antes: "contenido pendiente") |
| WhatsApp de contacto | Centralizado en `brand.js`, con CTA en el Footer |
| Bug: precio mal formateado en "Mi cuenta" (`$25,5`) | Corregido con `Intl.NumberFormat` |
| Bug: panel del Hero casi invisible en desktop | Corregido (problema de `justify-self` sin `width` en grid) |

---

## 🟨 Requiere backend (gaps reales, no inventados)

Sin cambios respecto a la auditoría previa — siguen siendo limitaciones reales del backend actual, no del frontend:

1. **No existe catálogo de Servicios.** No hay tabla/modelo `Service`. Cada barbero tiene un único `service_price` plano, no expuesto en `GET /api/public/barbers`. La sección "Servicios" de la Home y el paso 1 de reserva son contenido comercial ilustrativo, claramente separado de la reserva real (que solo usa barbero+fecha+hora). **Corrección respecto al documento anterior**: el precio real del barbero *no* se muestra durante el flujo de reserva (el endpoint público no lo expone) — solo aparece después, en "Mi cuenta", vía `GET /api/appointments/mine`.
2. **El endpoint de horarios no descuenta turnos ya reservados.** `GET /schedules/:barberId/:weekStart/slots` devuelve la grilla teórica completa, no la disponibilidad real. Verificado en vivo con Playwright: el frontend maneja esto correctamente mostrando "Ese horario ya fue reservado por otra persona. Elegí otro horario." ante el `409`, con reintento funcional.
3. **No existe `GET /api/clients/me`.** El perfil se obtiene solo del payload de login/registro.
4. **No existe endpoint de reprogramación**, solo cancelar.
5. **No existe entidad Sucursal/Branch.** Confirmado de nuevo: sin tabla, sin modelo, sin ruta.
6. **No hay endpoint público de detalle de un barbero individual.** Se resuelve filtrando client-side el listado completo.
7. **Seguridad de login por teléfono sin verificación** — riesgo ya documentado y aceptado por el usuario en la auditoría de backend previa (`barberiaweb_backend_audit_2026_08`), expuesto también desde el frontend público. No se intentó "arreglar" desde el frontend (sería una autorización cosmética, no real).
8. **Rate limit de 5 req/min compartido entre crear y cancelar turnos** (`appointmentsRateLimit`). Es intencional del backend, pero conviene que quien opere el sitio sepa que un cliente que reserva y cancela varias veces seguidas puede toparlo — el frontend lo maneja con un mensaje claro (verificado en vivo), pero el límite en sí es una decisión de backend, no ajustable desde acá.

---

## 🟦 Decisión / dato opcional del usuario

Nada de esto bloquea producción — el sitio funciona completo y coherente con estos placeholders. Reemplazarlos es deseable, no urgente.

### Imágenes reales
No fue posible generar fotografía real en esta sesión: el entorno no tenía `GEMINI_API_KEY` configurada (necesaria para el generador de imágenes del skill `design`) y no había otra herramienta de generación fotográfica disponible. Se le preguntó al usuario cómo proceder y eligió explícitamente **no fabricar fotos de stock genéricas** — se construyó en su lugar un sistema editorial de ilustración propia (ver `FRONTEND_FINAL.md`, sección 4).

Si en el futuro se quiere fotografía real, dos caminos:
- Configurar `GEMINI_API_KEY` y regenerar el hero/mosaico con imágenes reales generadas por IA (los slots ya están preparados: `Hero.jsx` acepta `--hero-image` como variable CSS sin tocar el markup).
- Contratar fotografía real del local/equipo y reemplazar los mismos slots.

### Sucursales reales
Las 2 sucursales cargadas (Palermo, Belgrano) son contenido comercial ilustrativo con coordenadas aproximadas de la zona, no la dirección exacta de un local real. Para reemplazar por datos reales, editar `src/data/branches.js` (un solo archivo, forma documentada en el propio archivo).

### Redes sociales
No se inventaron perfiles de Instagram/Facebook/etc. — enlazar a una cuenta que no existe sería peor que no mostrar nada. Si el usuario tiene cuentas reales, agregarlas es un cambio menor en `Footer.jsx` + `brand.js`.

### Servicios (contenido comercial)
Lista actual: Corte clásico, Corte + Barba, Arreglo de barba, Fade, Corte premium, Perfilado — con precios/duraciones ilustrativos en `src/data/services.js`. Confirmar o ajustar antes de tratarlos como definitivos.

### Legal
El texto de Términos y Privacidad es una base estándar redactada específicamente sobre el modelo de negocio real de este sitio (no lorem ipsum, no genérico de otro rubro) — pero no reemplaza una revisión por un asesor legal. Así lo dice el propio pie de la página `/legal/*`.

### Dominio de producción
`robots.txt` ya documenta correctamente que no se puede generar un `sitemap.xml` sin URLs absolutas de un dominio real. Cuando exista, agregar el sitemap y actualizar `og:url`/canonical (ya se arman dinámicamente con `window.location`, no hace falta tocar código para que funcionen bien en el dominio real).

---

## Resumen rápido

| Ítem | Estado |
|---|---|
| Auth cliente (registro/login por teléfono) | 🟩 Integrado con backend real, verificado en vivo |
| Listado de barberos + fotos reales | 🟩 Integrado con backend real, verificado en vivo |
| Reserva de turno (barbero+fecha+hora) | 🟩 Integrado con backend real, 409/429 verificados en vivo |
| Cancelar turno propio | 🟩 Integrado con backend real, verificado en vivo |
| Marca, logo, favicon, OG | 🟩 Resuelto esta sesión |
| Sistema visual (sin fotografía real) | 🟩 Resuelto esta sesión, por decisión explícita del usuario |
| Sucursales, legal, contacto | 🟩 Contenido completado esta sesión (placeholder razonable, no bloqueante) |
| Catálogo de Servicios con precio/duración propios | 🟨 No existe en backend |
| Disponibilidad real (slots menos reservados) | 🟨 Gap de backend, manejado con conflicto 409 |
| Perfil de barbero individual (endpoint dedicado) | 🟨 No existe, resuelto client-side |
| Fotografía real | 🟦 Opcional — requiere `GEMINI_API_KEY` o fotos reales del usuario |
| Sucursales/redes sociales reales | 🟦 Opcional — datos reales del usuario cuando los tenga |
