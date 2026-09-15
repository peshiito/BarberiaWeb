# Prompts para Stitch — Landing pública de Oficio

Pegalos **en una conversación nueva de Stitch**, uno por pantalla y en este orden. Esperá a que termine cada pantalla antes de pegar la siguiente. El prompt 1 trae las reglas completas; los demás las recuerdan en una línea, porque Stitch mantiene el contexto de la conversación.

Todo lo que aparece existe en la web o en el backend: servicios, barberos con bio y fotos, horarios por semana y reserva sin cuenta. No hay que inventar datos ni funciones.

---

## Reglas comunes (ya van incluidas en cada prompt)

> Landing pública de OFICIO Barbería (Buenos Aires). Mismo sistema visual que su panel interno "Oficio Barbería Clásica":
> - **Fondos:** carbón #131316; tarjetas #1b1b1e y #1f1f22; tinta #0e0e11 para hero y pie; secciones claras en crema #f3ede2 con texto #1c1712.
> - **Acento latón:**
>   - #b8925a en botones primarios, con texto #131316;
>   - #eac083 para acentos sobre fondo oscuro;
>   - #7d6038 para acentos sobre crema.
> - **Colores de estado:** verde salvia #9fd2af solo para WhatsApp y confirmaciones; borgoña #ffb3b0 solo para errores.
> - **Tipografía:** títulos en Oswald mayúsculas con tracking amplio; cuerpo en Inter 16px; precios, horarios y códigos en JetBrains Mono.
> - **Forma:** radios de 4 a 8px y bordes finos translúcidos. Nada de gradientes decorativos ni glassmorphism.
> - **Íconos:** Material Symbols Outlined.
> - **Idioma:** español rioplatense ("reservá", "elegí").
>
> No agregues nada de esto:
> - reseñas, estrellas ni testimonios;
> - pago online o seña;
> - cuentas o login;
> - tienda de productos, promociones, newsletter o blog;
> - feed de Instagram;
> - contadores de "lugares libres";
> - elegir sucursal dentro de la reserva;
> - chat;
> - marcadores numerados decorativos ("N.º 01").
>
> Datos de ejemplo:
> - **Servicios:** Corte de Pelo $15.000 (30 min), Corte + Tintura $30.000 (60 min) y Tintura $17.000 (45 min).
> - **Barberos:** Juan Baez y Admin Barbería.
> - **Sucursales:** Palermo (Av. Santa Fe 3456, CABA, +54 11 4821-3456) y Belgrano (Av. Cabildo 2100, CABA, +54 11 4780-2100). Las dos abren de lunes a sábado de 10:00 a 20:00; domingo cerrado.
> - **WhatsApp:** +54 9 11 2345-6789.

---

## 1. Inicio — escritorio 1440px

```
Landing pública de OFICIO Barbería (Buenos Aires), mismo sistema visual que su panel "Oficio Barbería Clásica": fondo carbón #131316, tarjetas #1b1b1e/#1f1f22, tinta #0e0e11 para hero y pie, secciones claras crema #f3ede2 con texto #1c1712; latón #b8925a en botones primarios (texto #131316), #eac083 para acentos sobre oscuro y #7d6038 sobre crema; verde salvia #9fd2af solo para WhatsApp y confirmaciones; borgoña #ffb3b0 solo para errores. Títulos Oswald mayúsculas con tracking amplio, cuerpo Inter 16px, precios/horarios/códigos en JetBrains Mono. Radios 4–8px, bordes finos translúcidos, sin gradientes decorativos ni glassmorphism. Íconos Material Symbols Outlined. Español rioplatense. No agregues reseñas, estrellas, testimonios, pago online, seña, login, tienda, promociones, newsletter, blog, feed de Instagram, contadores de lugares libres, chat ni marcadores numerados decorativos. Servicios: Corte de Pelo $15.000 (30 min), Corte + Tintura $30.000 (60 min), Tintura $17.000 (45 min). Barberos: Juan Baez, Admin Barbería. Sucursales: Palermo (Av. Santa Fe 3456) y Belgrano (Av. Cabildo 2100), lun a sáb 10:00 a 20:00, dom cerrado. WhatsApp +54 9 11 2345-6789.

Pantalla: INICIO, escritorio 1440px. Es la puerta de entrada a la reserva: todo empuja a "Reservar turno".

1. Header de 76px apoyado sobre el hero, transparente (al scrollear pasa a carbón): logo (tijera dentro de un círculo latón + "OFICIO"), links Inicio · Barberos · Sucursales, botón primario "Reservar turno".

2. Hero de ~720px sobre tinta. Foto a sangre en el 60% derecho: afeitado a navaja con luz cálida, fundida a negro hacia la izquierda. A la izquierda:
   - eyebrow "Barbería desde 2014 · Palermo y Belgrano";
   - título Oswald enorme en tres líneas: "Tijera, navaja / y el tiempo / que el corte necesita";
   - bajada de una línea: "Cortes a tijera y navaja, atención sin apuro, con el mismo barbero cada vez.";
   - bloque "¿Qué te hacés hoy?" con los tres servicios como chips grandes (nombre + precio en mono). Cada chip lleva a la reserva con ese servicio ya elegido;
   - link secundario con ícono salvia: "o escribinos por WhatsApp".

3. Firma de la página, "Lista de precios", sobre crema. Un tablero de precios de barbería clásica: fieltro negro con letras blancas encastradas, marco fino de latón. Cada servicio: nombre en mayúsculas, línea de puntos y precio en mono; debajo, descripción corta y duración. Al pie del tablero: "Precio final. Pagás en el local, en efectivo o transferencia." Botón primario "Reservar turno".

4. "El oficio", sobre carbón:
   - a la izquierda, foto vertical del interior (sillones de cuero y espejos con luces);
   - a la derecha, el título "Una barbería, no un local de paso" y dos párrafos cortos: empezamos en 2014 como barbería de esquina; cada barbero aprende navaja, tijera y toalla caliente antes de tomar turnos; si volvés con el mismo barbero, no tenés que explicar de nuevo tu corte;
   - tres datos en fila separados por líneas finas: "Desde 2014", "2 sucursales" y "Turno a horario".

5. "El equipo": título "Elegí con quién te cortás" y link "Ver todo el equipo".
   - Tarjetas en fila con foto 4:5, nombre, bio de dos líneas, servicios que hace en texto chico y botón secundario "Reservar con Juan".
   - Si un barbero no subió foto, en su lugar va un monograma grande en latón grabado sobre carbón texturado (iniciales "AB"). Tiene que verse intencional, no vacío.
   - Mostrá una tarjeta con foto (Juan Baez) y una con monograma (Admin Barbería).

6. "Trabajos", sobre tinta: galería de fotos de cortes que suben los barberos. Grilla asimétrica que funcione con 2 fotos y hasta con 8. Al pasar el mouse, el nombre del barbero. Bajada: "Fotos de nuestro equipo, no de un banco de imágenes."

7. "Sucursales", compacto sobre crema: dos columnas. Cada una con el barrio grande en Oswald ("Palermo", "Belgrano"), dirección, horario y teléfono, y los links "Cómo llegar" y "Llamar". Sin mapa.

8. Cierre sobre tinta: título "¿Te toca corte?", bajada "Elegí servicio, barbero y horario en un par de minutos.", botón primario "Reservar turno" y link de WhatsApp.

9. Footer: logo y la frase "Oficio clásico, filo moderno"; WhatsApp y teléfono; navegación (Inicio, Barberos, Sucursales, Reservar turno); legales (Términos y condiciones, Política de privacidad); "© 2026 Oficio Barbería".
```

---

## 2. Inicio — mobile 390px

```
Mismo sistema visual y mismas reglas que la pantalla INICIO de esta conversación: colores carbón/crema/latón, Oswald + Inter + JetBrains Mono, íconos Material Symbols, español rioplatense, sin reseñas, pago online, login, tienda, promociones, Instagram, contadores de lugares libres ni chat, y los mismos datos de ejemplo (servicios, barberos Juan Baez y Admin Barbería, sucursales Palermo y Belgrano, WhatsApp).

Pantalla: INICIO, mobile 390px. Mismo contenido y orden que la versión de escritorio, adaptado al celular:
- Header de 64px: logo, botón primario chico "Reservar" y botón de menú (hamburguesa).
- Hero: foto recortada arriba (60% del alto de pantalla) y, debajo, eyebrow, título en 4 líneas, bajada y los chips de servicio en un carrusel horizontal con scroll.
- Lista de precios: el tablero a ancho completo, con precios alineados a la derecha.
- El oficio: foto arriba, texto y los tres datos apilados.
- El equipo: carrusel horizontal de tarjetas con snap (se asoma la siguiente).
- Trabajos: grilla de 2 columnas.
- Sucursales: apiladas.
- Cierre y footer en una columna.
- Después del hero aparece una barra inferior fija: botón primario ancho "Reservar turno" y, al lado, un botón cuadrado salvia con el ícono de WhatsApp. Respetá el área segura inferior del teléfono.

Agregá una segunda pantalla con el menú abierto a pantalla completa sobre tinta: links grandes en Oswald (Inicio, Barberos, Sucursales), botón "Reservar turno", WhatsApp y las dos direcciones abajo en chico.
```

---

## 3. Reservar turno — escritorio 1440px

```
Mismo sistema visual y mismas reglas que la pantalla INICIO de esta conversación: colores carbón/crema/latón, Oswald + Inter + JetBrains Mono, íconos Material Symbols, español rioplatense, sin reseñas, pago online, login, tienda, promociones, Instagram, contadores de lugares libres ni chat, y los mismos datos de ejemplo (servicios, barberos Juan Baez y Admin Barbería, sucursales Palermo y Belgrano, WhatsApp).

Pantalla: RESERVAR TURNO, escritorio 1440px. Todo en una sola página, sin pantallas separadas por paso. Header normal sobre carbón (sin hero).

Arriba: título "Reservá tu turno" y bajada "Sin cuenta y sin seña. Te lleva un par de minutos."

Dos columnas.

Izquierda (~780px): cuatro bloques en orden. Acá la numeración sí corresponde, porque es una secuencia real.
1. SERVICIO: filas seleccionables con nombre, descripción corta, duración y precio en mono. La elegida lleva borde latón y check.
2. BARBERO: solo los que hacen ese servicio. Tarjetas con foto (o monograma latón si no tiene), nombre y bio de una línea.
3. DÍA Y HORARIO:
   - tira de la semana, de lunes a domingo, con flechas "semana anterior" y "semana siguiente";
   - los días pasados o que el barbero no trabaja van deshabilitados y atenuados;
   - debajo, los horarios del día elegido como botones en mono agrupados en "Mañana" y "Tarde"; el horario elegido va en latón;
   - nota chica: "Si alguien toma ese horario justo antes, te avisamos al confirmar."
4. TUS DATOS:
   - Nombre y Apellido;
   - Teléfono, con la ayuda "Solo lo usamos para este turno";
   - Referencia (opcional), con el ejemplo "De parte de Juan, el corte de la vez pasada".

Cómo se ven los bloques:
- Los que ya están completos se colapsan a una línea de resumen con el link "Cambiar".
- El bloque activo va abierto.
- Los que siguen quedan atenuados y bloqueados.

Derecha: resumen fijo (sticky) "Tu turno":
- servicio;
- barbero con su avatar;
- fecha en formato largo ("jueves 18 de septiembre");
- hora y duración;
- precio grande en mono;
- botón primario ancho "Confirmar turno", deshabilitado hasta completar todo;
- texto "Pagás en el local: efectivo o transferencia.";
- link salvia "¿Dudas? Escribinos por WhatsApp".

Estado a mostrar: servicio "Corte de Pelo" elegido, barbero "Juan Baez" elegido, día jueves elegido y el bloque de horario activo con "11:00" seleccionado.
```

---

## 4. Reservar turno — mobile 390px

```
Mismo sistema visual y mismas reglas que la pantalla INICIO de esta conversación: colores carbón/crema/latón, Oswald + Inter + JetBrains Mono, íconos Material Symbols, español rioplatense, sin reseñas, pago online, login, tienda, promociones, Instagram, contadores de lugares libres ni chat, y los mismos datos de ejemplo (servicios, barberos Juan Baez y Admin Barbería, sucursales Palermo y Belgrano, WhatsApp).

Pantalla: RESERVAR TURNO, mobile 390px. La misma página única, en vertical:
- Header de 64px con logo y botón de cerrar (vuelve al inicio).
- Debajo, una barra de progreso fina de 4 segmentos (servicio, barbero, día y horario, tus datos).
- Los cuatro bloques en acordeón: los completos se colapsan a una línea con "Cambiar" y el activo va abierto.
- Día y horario:
  - la semana es una tira horizontal con scroll;
  - los horarios van en una grilla de 3 columnas de botones de al menos 44px de alto.
- Resumen: barra inferior fija con "Corte de Pelo · jue 18 · 11:00" y el precio en mono, más el botón primario "Confirmar". Tocar el texto abre una hoja inferior con el resumen completo (servicio, barbero, fecha, hora, duración, precio y "Pagás en el local: efectivo o transferencia").

Estado a mostrar: el bloque "Tus datos" abierto, con Nombre y Teléfono completos, Apellido vacío y enfocado, y el teclado cerrado.
```

---

## 5. Reservar turno — estados y errores (escritorio)

```
Mismo sistema visual y mismas reglas que la pantalla INICIO de esta conversación: colores carbón/crema/latón, Oswald + Inter + JetBrains Mono, íconos Material Symbols, español rioplatense, sin reseñas, pago online, login, tienda, promociones, Instagram, contadores de lugares libres ni chat, y los mismos datos de ejemplo (servicios, barberos Juan Baez y Admin Barbería, sucursales Palermo y Belgrano, WhatsApp).

Pantalla: RESERVAR TURNO — ESTADOS, escritorio 1440px. Una hoja de referencia con estas variantes, cada una en su recuadro con un rótulo chico arriba:

a) HORARIO OCUPADO AL CONFIRMAR: en el resumen, un aviso borgoña "Ese horario se acaba de ocupar. Elegí otro y confirmá de nuevo." con el botón "Elegir otro horario". En la grilla, "11:00" aparece tachado y deshabilitado.
b) BARBERO SIN AGENDA ESA SEMANA: en el bloque de día, "Juan todavía no cargó horarios para esta semana." con el botón secundario "Ver semana siguiente" y el link "Elegir otro barbero".
c) SIN HORARIOS ESE DÍA: "No quedan horarios el sábado 20." y la sugerencia "Probá con otro día de la semana".
d) NADIE HACE ESE SERVICIO: en el bloque de barbero, "Por ahora nadie ofrece este servicio." con el link "Elegir otro servicio".
e) CONFIRMANDO: botón "Confirmando…" con spinner y los bloques atenuados sin interacción.
f) ERROR DE CARGA: "No pudimos cargar los servicios. Revisá tu conexión." con el botón "Reintentar".
g) DATOS CON ERROR: campos con borde borgoña y el mensaje debajo de cada uno ("Ingresá tu apellido", "Ingresá un teléfono válido, por ejemplo 11 2345-6789").

Nada de ilustraciones: ícono Material Symbols, texto claro y una acción.
```

---

## 6. Turno confirmado — escritorio 1440px

```
Mismo sistema visual y mismas reglas que la pantalla INICIO de esta conversación: colores carbón/crema/latón, Oswald + Inter + JetBrains Mono, íconos Material Symbols, español rioplatense, sin reseñas, pago online, login, tienda, promociones, Instagram, contadores de lugares libres ni chat, y los mismos datos de ejemplo (servicios, barberos Juan Baez y Admin Barbería, sucursales Palermo y Belgrano, WhatsApp).

Pantalla: TURNO CONFIRMADO, escritorio 1440px, sobre carbón con header normal.

En el centro, el comprobante es la firma de esta pantalla: un ticket de barbería en papel crema #f3ede2 con texto oscuro, borde troquelado arriba y abajo y muescas semicirculares a los costados.
- Arriba del ticket: ícono de check en verde salvia y "Turno confirmado".
- Código grande en JetBrains Mono: "#OFC-1042", con el botón chico "Copiar código".
- Filas con etiqueta a la izquierda y valor a la derecha: Servicio (Corte de Pelo), Barbero (Juan Baez), Fecha (jueves 18 de septiembre), Hora (11:00), Duración (30 min), Precio ($15.000), A nombre de (Martín Gómez).
- Al pie del ticket: "Pagás en el local: efectivo o transferencia."

Debajo del ticket, una fila de acciones secundarias con ícono: "Agregar a Google Calendar", "Descargar .ics" y "Ver sucursales y cómo llegar".

Bloque aparte: "¿No podés venir? Avisanos por WhatsApp para liberar el horario.", con botón salvia "Avisar por WhatsApp".

Link final: "Volver al inicio".

No agregues QR, mail de confirmación, cuenta, reprogramar online ni cancelar online: nada de eso existe.
```

---

## 7. Turno confirmado — mobile 390px

```
Mismo sistema visual y mismas reglas que la pantalla INICIO de esta conversación: colores carbón/crema/latón, Oswald + Inter + JetBrains Mono, íconos Material Symbols, español rioplatense, sin reseñas, pago online, login, tienda, promociones, Instagram, contadores de lugares libres ni chat, y los mismos datos de ejemplo (servicios, barberos Juan Baez y Admin Barbería, sucursales Palermo y Belgrano, WhatsApp).

Pantalla: TURNO CONFIRMADO, mobile 390px. El mismo contenido que en escritorio:
- El ticket crema a ancho completo, con margen de 16px, borde troquelado y muescas.
- El código "#OFC-1042" en mono con "Copiar código".
- Las filas del turno en una columna.
- Las acciones "Agregar a Google Calendar", "Descargar .ics" y "Cómo llegar" como botones apilados de ancho completo.
- El botón salvia "Avisar por WhatsApp si no podés venir".
- "Volver al inicio".
- Nada fijo abajo que tape el contenido.
```

---

## 8. Barberos — escritorio 1440px

```
Mismo sistema visual y mismas reglas que la pantalla INICIO de esta conversación: colores carbón/crema/latón, Oswald + Inter + JetBrains Mono, íconos Material Symbols, español rioplatense, sin reseñas, pago online, login, tienda, promociones, Instagram, contadores de lugares libres ni chat, y los mismos datos de ejemplo (servicios, barberos Juan Baez y Admin Barbería, sucursales Palermo y Belgrano, WhatsApp).

Pantalla: BARBEROS (el equipo), escritorio 1440px, sobre carbón con header normal (link "Barberos" activo).

Encabezado: eyebrow "Equipo", título "Elegí con quién te cortás" y bajada "Cada barbero maneja su propia agenda. Reservá directo con quien quieras."

Grilla de 3 columnas. Cada tarjeta:
- foto vertical 4:5 o, si no subió foto, monograma grande latón grabado sobre carbón texturado (tiene que verse intencional);
- nombre en Oswald;
- bio de dos líneas;
- servicios que hace como chips chicos;
- acciones: link "Ver perfil" y botón secundario "Reservar".
Mostrá 2 tarjetas: Juan Baez con foto y Admin Barbería con monograma "AB".

Banda final sobre crema: "¿No sabés con quién? Elegí el servicio y te mostramos quién lo hace." con el botón primario "Reservar turno".
```

---

## 9. Perfil de barbero — escritorio 1440px

```
Mismo sistema visual y mismas reglas que la pantalla INICIO de esta conversación: colores carbón/crema/latón, Oswald + Inter + JetBrains Mono, íconos Material Symbols, español rioplatense, sin reseñas, pago online, login, tienda, promociones, Instagram, contadores de lugares libres ni chat, y los mismos datos de ejemplo (servicios, barberos Juan Baez y Admin Barbería, sucursales Palermo y Belgrano, WhatsApp).

Pantalla: PERFIL DE BARBERO, escritorio 1440px, sobre carbón con header normal.

Arriba, migas: "Equipo / Juan Baez".

Dos columnas:
- Izquierda: foto principal 4:5 y, debajo, una tira de miniaturas de sus fotos.
- Derecha:
  - eyebrow "Barbero" y nombre enorme en Oswald;
  - bio en uno o dos párrafos;
  - lista "Lo que hace" con estética de pizarra chica: nombre del servicio, línea de puntos, precio en mono y la duración debajo;
  - botón primario "Reservar con Juan" y link salvia "Consultar por WhatsApp".

Abajo, a ancho completo: "Trabajos de Juan", una galería de sus fotos en grilla.

Agregá una segunda pantalla con la variante sin fotos: el monograma "JB" en lugar de la foto, sin la tira de miniaturas, y en lugar de la galería un texto chico: "Juan todavía no subió fotos de sus trabajos."
```

---

## 10. Perfil de barbero — mobile 390px

```
Mismo sistema visual y mismas reglas que la pantalla INICIO de esta conversación: colores carbón/crema/latón, Oswald + Inter + JetBrains Mono, íconos Material Symbols, español rioplatense, sin reseñas, pago online, login, tienda, promociones, Instagram, contadores de lugares libres ni chat, y los mismos datos de ejemplo (servicios, barberos Juan Baez y Admin Barbería, sucursales Palermo y Belgrano, WhatsApp).

Pantalla: PERFIL DE BARBERO, mobile 390px:
- Header de 64px con flecha "Equipo".
- Foto a ancho completo (4:5), con el nombre en Oswald encima, sobre un fundido oscuro en la parte inferior de la foto.
- Bio.
- Lista "Lo que hace", estilo pizarra.
- "Trabajos de Juan" en grilla de 2 columnas.
- Barra inferior fija con el botón primario ancho "Reservar con Juan" y el botón cuadrado salvia de WhatsApp, respetando el área segura.
```

---

## 11. Sucursales — escritorio 1440px

```
Mismo sistema visual y mismas reglas que la pantalla INICIO de esta conversación: colores carbón/crema/latón, Oswald + Inter + JetBrains Mono, íconos Material Symbols, español rioplatense, sin reseñas, pago online, login, tienda, promociones, Instagram, contadores de lugares libres ni chat, y los mismos datos de ejemplo (servicios, barberos Juan Baez y Admin Barbería, sucursales Palermo y Belgrano, WhatsApp).

Pantalla: SUCURSALES, escritorio 1440px, sobre carbón con header normal (link "Sucursales" activo).

Encabezado: eyebrow "Sucursales", título "Dónde estamos" y bajada "Dos barberías, el mismo oficio. Reservás online y elegís tu barbero."

Dos bloques grandes, uno debajo del otro, con el orden alternado (mapa a la izquierda en el primero, a la derecha en el segundo):
- Mapa (60% del ancho) con estilo oscuro propio: calles en carbón y gris, parques apenas verdosos, pin latón y sin los colores de Google.
- Ficha:
  - barrio en Oswald grande ("Palermo");
  - dirección completa;
  - horario en una tablita mono: "Lun a sáb 10:00 – 20:00" y "Domingo cerrado";
  - teléfono;
  - botón primario "Cómo llegar" y botón secundario "Llamar".

No pongas qué barberos trabajan en cada sucursal: ese dato no existe.
```

---

## 12. Sucursales — mobile 390px

```
Mismo sistema visual y mismas reglas que la pantalla INICIO de esta conversación: colores carbón/crema/latón, Oswald + Inter + JetBrains Mono, íconos Material Symbols, español rioplatense, sin reseñas, pago online, login, tienda, promociones, Instagram, contadores de lugares libres ni chat, y los mismos datos de ejemplo (servicios, barberos Juan Baez y Admin Barbería, sucursales Palermo y Belgrano, WhatsApp).

Pantalla: SUCURSALES, mobile 390px:
- Header de 64px.
- Título y bajada.
- Cada sucursal en una tarjeta: mapa oscuro arriba (16:10, pin latón), barrio en Oswald, dirección, horario en mono y teléfono.
- Dos botones de ancho completo en la tarjeta: "Cómo llegar" (primario) y "Llamar" (secundario).
- Al final, la banda "¿Ya sabés dónde? Reservá tu turno" con el botón primario.
```
