# Informe para la sesión de desarrollo — Scripts de Playwright para el video demo

Hola. Otra sesión de Claude se encarga de grabar con OBS. Tu parte es escribir **un script de Playwright por toma**. El guion con las tomas está en `demo-video/GUION.md`: leelo primero.

No toques OBS ni Hyprland. Vos manejás el navegador y la sesión de grabación maneja el resto.

## Entregables

```
demo-video/
  package.json            # "type": "module", dependencia playwright@1.63
  lib/demo.mjs            # helpers compartidos (ver abajo)
  tomas/toma-01-recorrido.mjs
  tomas/toma-02-reserva.mjs
```

Cada script se ejecuta con `node tomas/toma-XX-*.mjs`.

## Contrato con la sesión de grabación (obligatorio)

La sesión de grabación lanza tu script y habla con él por stdin/stdout:

1. El script abre el navegador y carga la URL inicial. Espera `networkidle`, `document.fonts.ready` y que terminen las animaciones de entrada del Hero.
2. Imprime **exactamente** `READY` en una línea de stdout.
3. Espera leer **`GO`** por stdin. Mientras tanto no hace nada: en ese momento arranca OBS.
4. Ejecuta la toma.
5. Imprime `DONE` y sostiene el último plano, sin mover nada, hasta leer **`CLOSE`** por stdin. Recién entonces cierra el navegador y sale con código 0.
6. Ante cualquier error imprime `ERROR <mensaje>` y sale con código ≠ 0. Nunca se queda colgado.

Con `DRY_RUN=1`, el script corre sin esperar `GO`/`CLOSE` y con las pausas divididas por 4, para ensayar rápido.

## Navegador

- Brave headed: `chromium.launchPersistentContext(tmpDir, { executablePath: '/usr/bin/brave', headless: false, viewport: null, args: ['--kiosk', '--no-first-run', '--no-default-browser-check', '--disable-features=Translate', '--hide-crash-restore-bubble'] })`.
- Perfil temporal nuevo en cada corrida, sin extensiones ni barras.
- `viewport: null` hace que la página use la ventana real a pantalla completa (1920×1080).
- URL base: `process.env.BASE_URL ?? 'http://localhost:5175'`.

## Cursor visible (importante)

OBS graba la pantalla, pero Playwright **no mueve el cursor real**. Por eso en `lib/demo.mjs` hay que:
- Inyectar con `context.addInitScript` un cursor falso: un `div` fixed con `pointer-events: none`, z-index máximo y una flecha SVG que siga los eventos `mousemove`. Al hacer clic, un "pulse" sutil de ~150 ms.
- Moverlo siempre con `page.mouse.move(x, y, { steps })` y curvas suaves. Nada de saltos.
- Helper `clickLikeHuman(locator)`: scrollIntoView suave, mover el cursor al centro del elemento en ~600–900 ms, pausa de 250 ms, clic y pausa de 400 ms.
- Si el cursor falso se pierde tras una navegación, volver a inyectarlo o usar `addInitScript`, que se re-ejecuta en cada carga.

## Ritmo (se graba a 60 fps: tiene que verse humano)

- **Scroll:** `page.mouse.wheel` en pasos de 80–120 px cada ~16 ms, o `scrollTo({ behavior: 'smooth' })` hacia el `offsetTop` de la sección, y esperar a que termine. Dejar asentar las animaciones `Reveal` (motion) antes de la pausa.
- **Pausas por plano:** las duraciones del guion. Helper `hold(ms)`.
- **Escritura:** `locator.pressSequentially(texto, { delay: 90–130 })`.
- **Links externos** (WhatsApp, Maps, Google Calendar, `tel:`): solo hover, **nunca clic**.
- **Selectores:** por rol, label o texto (`getByRole`, `getByLabel`), no por coordenadas ni por clases frágiles.

## Toma 2 — cuidados

- Crea un **turno real**. El script tiene que elegir dinámicamente el **primer día con horarios libres** y el **primer horario libre**, para poder repetirse.
- Solo **Juan Baez** (id 2) tiene horarios, y solo la semana del 14/09/2026. Si no hay horarios, salir con `ERROR sin horarios` antes de `READY`: hacé ese chequeo contra `GET /api/schedules/2/<lunes>/slots` antes de abrir el navegador.
- Juan solo ofrece **Corte de Pelo** (service id 1). Es el servicio a elegir en el paso 1; con otro, Juan no aparece en el paso 2.
- Al final imprimí el id del turno creado en una línea `APPOINTMENT <id>`, para poder cancelarlo después (lo obtenés escuchando la respuesta de `POST /api/appointments`).
- Datos de prueba: Martín / Gómez / 11 2345-6789 / "Primera vez".

## Qué devolver cuando termines

- Rutas de los scripts, duración real medida con `DRY_RUN=0` sin OBS y cualquier prerequisito.
- Cualquier cosa del guion que no se pueda hacer tal cual, con tu propuesta.
- Los problemas de datos del guion (sección "Prerequisitos") que decidas corregir en el código o en la base.
