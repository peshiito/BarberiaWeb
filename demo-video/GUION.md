# Guion — Video demo "Oficio Barbería" (BarberiaWeb)

> Borrador v1 — 2026-09-14. Para corregir antes de grabar.
> Una toma = un archivo de video = un script de Playwright.

## Cómo se graba

| Qué | Detalle |
|---|---|
| Sitio | Landing en `http://localhost:5175` (Vite dev) + Backend `:4000` |
| Pantalla | eDP-1, 1920×1080 @ 60 fps, H.264 VAAPI CQP 18 |
| Workspace | 2 — Brave (lanzado por Playwright) a pantalla completa |
| OBS | Escena "Workspace 1" (captura de pantalla). Arranca a grabar y se oculta (`special:obs`) |
| Cursor | Cursor falso inyectado en la página (Playwright no mueve el cursor real). Cursor real oculto en OBS |
| Salida | `demo-video/grabaciones/toma-XX-<nombre>.mp4` |

**Reparto:**
- **Esta sesión (grabación):** OBS, workspace, arranque y corte de cada toma, cortes finales con ffmpeg.
- **Sesión de desarrollo de BarberiaWeb:** escribe un script de Playwright por toma siguiendo `INFORME_PLAYWRIGHT.md`.

**Secuencia de cada toma:**
1. El script abre Brave, carga la página, espera a que no haya requests pendientes y avisa `READY`.
2. Esta sesión pasa al workspace 2, empieza a grabar en OBS y lo oculta.
3. El script recibe `GO` y hace la demo.
4. El script avisa `DONE`, se sostiene el último plano 2 s y se para la grabación.

---

## Toma 1 — Recorrido por la landing (~75–90 s)

Objetivo: mostrar todo lo que tiene el sitio, sin reservar.

| # | Plano / acción | Pantalla | Dur. |
|---|---|---|---|
| 1.1 | Plano quieto en el Hero: título "Tijera, navaja / y el tiempo / que el corte necesita" y subtítulo. El cursor entra desde abajo a la derecha y se detiene cerca del botón "Reservar" (solo hover, sin clic). | `/` | 5 s |
| 1.2 | Scroll suave hasta **Servicios** (PriceBoard): lista de servicios con duración y precio. El cursor recorre 2 o 3 filas. | `/` | 8 s |
| 1.3 | Scroll a **Intro / Sobre nosotros**. | `/` | 5 s |
| 1.4 | Scroll a **El equipo** (BarbersTeaser). Hover sobre una tarjeta. | `/` | 6 s |
| 1.5 | Scroll a **Trabajos** (galería). Pausa para ver las fotos. | `/` | 6 s |
| 1.6 | Scroll a **Sucursales** (Palermo y Belgrano). Hover en "Cómo llegar" y en el teléfono, sin clic. | `/` | 6 s |
| 1.7 | Scroll a la banda final (CTA). Se ve la barra fija de reserva (StickyBookBar). | `/` | 4 s |
| 1.8 | Subir al header y hacer clic en **Barberos**. Mostrar la grilla del equipo y la banda "¿No sabés con quién?". | `/barberos` | 8 s |
| 1.9 | Clic en la tarjeta de **Juan Baez**. Mostrar el perfil y la sección "Lo que hace". | `/barberos/2` | 8 s |
| 1.10 | Clic en **Sucursales** en el header. Mostrar las tarjetas de Palermo y Belgrano. | `/sucursales` | 7 s |
| 1.11 | Clic en el logo para volver al Inicio. Plano quieto final en el Hero. | `/` | 4 s |

## Toma 2 — Cómo sacar un turno (~70–90 s)

Objetivo: el proceso completo de reserva, de principio a fin.

| # | Plano / acción | Pantalla | Dur. |
|---|---|---|---|
| 2.1 | Arranca en el Hero. El cursor va a **Reservar** en el header y hace clic. | `/` → `/reservar` | 4 s |
| 2.2 | **Paso 1 · Servicio:** recorrer la lista y elegir **Corte de Pelo** ($15.000 · 30 min), el único que ofrece Juan Baez. El paso se colapsa en un resumen. | `/reservar` | 8 s |
| 2.3 | **Paso 2 · Barbero:** elegir **Juan Baez**. | | 6 s |
| 2.4 | **Paso 3 · Día y horario:** pausa en la tira de días. Elegir el primer día con horarios libres y luego un horario de la grilla. Confirmar el horario. | | 12 s |
| 2.5 | **Paso 4 · Tus datos:** escribir letra por letra a velocidad humana: Nombre "Martín", Apellido "Gómez", Teléfono "11 2345-6789" y Referencia "Primera vez". | | 15 s |
| 2.6 | Pausa en el resumen de la reserva y en la barra de progreso completa. Clic en **Confirmar**. | | 5 s |
| 2.7 | **Pantalla "Turno confirmado":** plano quieto con el detalle. Hover en "Agregar a Google Calendar" (sin clic) y scroll corto hasta "¿No podés venir?". | confirmación | 10 s |
| 2.8 | Clic en "Volver al inicio". Plano final. | `/` | 3 s |

---

## Tomas opcionales (decidir si van)

- **Toma 3 — Reservar desde el perfil de un barbero:** `/barberos/2` → "Reservar con Juan" (`/reservar?barbero=2`). Muestra que el barbero ya viene preseleccionado.
- **Toma 4 — Validaciones y errores:** enviar el paso 4 vacío, mostrar los errores de los campos y corregirlos.
- **Toma 5 — El otro lado (dashboard):** entrar como admin en `:5173` y ver el turno recién creado en la agenda. Esto necesita otro script y login.
- **Toma 6 — Versión mobile:** Brave en una ventana angosta. En Hyprland conviene grabarla aparte con otro encuadre.

---

## Prerequisitos y problemas encontrados (corregir antes de grabar)

1. **Horarios:** solo **Juan Baez** tiene horarios cargados, y solo la semana del 14/09 (lunes, martes, viernes y sábado). La semana del 21/09 está vacía. Si grabamos después, hay que cargar horarios desde el dashboard.
2. **"Admin Barbería" aparece como barbero público** en `/api/public/barbers`, sin servicios, sin bio y sin fotos. Se va a ver en Equipo y en Barberos. Conviene ocultarlo o renombrarlo.
3. **Fotos:** solo Juan Baez tiene fotos (4). Pedro Baez y Florencia Bargas Torres no tienen ninguna, así que en Equipo y Barberos van a mostrar placeholders. Por eso el perfil de la toma 1.9 es el de Juan.
4. **Nombres de servicios desprolijos:** "Tintura " tiene un espacio al final, y conviven "Corte de pelo Mujer + Tintura a mujeres" con "Tintura de Mujeres". Se leen en pantalla en la toma 1.
5. **La toma 2 crea un turno real** (`POST /api/appointments`). Cada ensayo ocupa un horario, así que después hay que cancelarlo como admin (`PATCH /:id/cancel-by-admin`) o desde el dashboard.
6. **Servicio del paso 1:** Juan Baez solo ofrece **Corte de Pelo** (`service_ids: [1]`). Si se elige otro servicio, Juan no aparece en el paso 2.
7. **Notificaciones:** activar "no molestar" durante la grabación.

## Preguntas abiertas

- ¿Brave con barra de direcciones visible, o pantalla completa limpia (kiosk)? Recomiendo kiosk: se ve más prolijo y la URL no aporta.
- ¿Querés música o voz en off después (edición), o las tomas van "mudas"?
- ¿Las tomas opcionales 3 a 6 entran?
