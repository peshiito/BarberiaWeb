# Prompts para Stitch — Finanzas, liquidaciones, productos y caja

Pegalos **en el mismo proyecto de Stitch** ("Oficio Barbershop Admin Dashboard"), uno por pantalla y en este orden. Cada prompt ya trae las reglas comunes, así no hace falta repetir nada.

Todo lo que aparece en las pantallas existe en el backend: no hay que inventar datos ni funciones.

---

## Reglas comunes (ya van incluidas en cada prompt)

> Usá el sistema de diseño **"Oficio Barbería Clásica"** de este proyecto y el mismo esqueleto que las pantallas anteriores:
> - Header superior fijo de 64px con el logo OFICIO, el botón "+ Nuevo turno", notificaciones y el usuario.
> - Barra lateral izquierda de 256px con estas secciones:
>   - Operación diaria: Agenda & Turnos, Clientes.
>   - Mi espacio: Mis horarios, Fotos y bio, Mi perfil.
>   - Administración: Barberos & Equipo, Servicios & Tarifas, **Finanzas & Caja** (activo).
>
> Textos en español rioplatense. Montos en pesos argentinos con JetBrains Mono ("$15.000"), títulos en Oswald mayúsculas y cuerpo en Inter. Ingresos en verde salvia y egresos en borgoña. Íconos de Material Symbols.
>
> No agregues nada que no esté en este pedido. En particular, nada de:
> - sillones o puestos;
> - IVA, proyecciones o metas;
> - "rendimiento", porcentajes contra el mes anterior o gráficos de tendencia;
> - fotos de stock.
>
> Datos de ejemplo:
> - Barberos: Admin Barbería (comisión 50%) y Juan Baez (comisión 25%).
> - Servicios: Corte de Pelo $15.000, Corte + Tintura $30.000, Tintura $17.000.
> - Productos: Gel fijación fuerte, Pomada mate, Perfume para barba.

---

## 1. Finanzas — Caja (desktop 1440px)

```
Usá el sistema de diseño "Oficio Barbería Clásica" de este proyecto y el mismo esqueleto que las pantallas anteriores: header fijo de 64px (logo OFICIO, botón "+ Nuevo turno", notificaciones, usuario) y barra lateral izquierda de 256px con Operación diaria (Agenda & Turnos, Clientes), Mi espacio (Mis horarios, Fotos y bio, Mi perfil) y Administración (Barberos & Equipo, Servicios & Tarifas, Finanzas & Caja activo). Español rioplatense, montos ARS en JetBrains Mono, títulos Oswald mayúsculas, cuerpo Inter, ingresos en verde salvia y egresos en borgoña, íconos Material Symbols. No agregues sillones, IVA, proyecciones, metas, comparaciones contra el período anterior, gráficos de tendencia ni fotos.

Pantalla: FINANZAS // CAJA, escritorio 1440px.

Encabezado de página: eyebrow "Administración", título "Finanzas // Caja". A la derecha, un selector de período con atajos (Hoy, Esta semana, Quincena, Este mes) y un rango desde–hasta. Debajo, pestañas segmentadas: Caja (activa) | Liquidaciones | Productos. Acciones de la página: botón secundario "Registrar egreso" y botón primario "Registrar venta".

Bloque 1 "Saldo actual" (acumulado hasta la fecha final del período): tres tarjetas.
- "Efectivo".
- "Transferencia", con subtítulo "Cuenta de la barbería".
- "Sin especificar", con subtítulo "Turnos anteriores a registrar el medio de pago".
Arriba de las tarjetas, el saldo total grande. Un saldo negativo se muestra en borgoña.

Bloque 2 "Resumen del período", en dos columnas:
- INGRESOS:
  - Servicios: monto y cantidad de cortes, desglosado efectivo / transferencia.
  - Venta de productos: monto y unidades.
  - Otros ingresos.
  - Total de ingresos.
- EGRESOS:
  - Insumos.
  - Equipamiento e inversiones.
  - Reposición de productos.
  - Alquiler y servicios.
  - Otros gastos.
  - Liquidaciones pagadas a barberos (con cantidad).
  - Adelantos entregados.
  - Total de egresos.
Abajo de las dos columnas, una franja "Resultado del período" = ingresos − egresos, grande.

Bloque 3 "Libro de caja": tabla con todos los movimientos del período.
- Columnas: Fecha | Tipo (ícono + etiqueta: Corte, Venta, Ingreso/Egreso manual, Liquidación, Adelanto) | Concepto | Detalle | Medio de pago (chip Efectivo / Transferencia / Sin especificar) | Monto (con + en verde para ingresos y − en borgoña para egresos).
- Contenido de "Concepto" y "Detalle" según el tipo:
  - Corte: nombre del servicio; detalle "cliente · barbero".
  - Venta: "producto x cantidad"; detalle, el vendedor.
  - Movimiento manual: la descripción; detalle, la categoría.
  - Liquidación y adelanto: el nombre del barbero.
- Arriba de la tabla, filtros: Todos / Ingresos / Egresos y medio de pago.
- Paginación abajo ("Página 1 de 3 · 42 movimientos").
- Los movimientos manuales tienen un menú de acciones con "Eliminar".
- Mostrá 10 filas de ejemplo variadas y un estado vacío pensado para cuando no hay movimientos.
```

---

## 2. Finanzas — Liquidaciones a barberos (desktop 1440px)

```
Usá el sistema de diseño "Oficio Barbería Clásica" de este proyecto y el mismo esqueleto que las pantallas anteriores: header fijo de 64px (logo OFICIO, botón "+ Nuevo turno", notificaciones, usuario) y barra lateral izquierda de 256px con Operación diaria (Agenda & Turnos, Clientes), Mi espacio (Mis horarios, Fotos y bio, Mi perfil) y Administración (Barberos & Equipo, Servicios & Tarifas, Finanzas & Caja activo). Español rioplatense, montos ARS en JetBrains Mono, títulos Oswald mayúsculas, cuerpo Inter, ingresos en verde salvia y egresos en borgoña, íconos Material Symbols. No agregues sillones, IVA, proyecciones, metas, comparaciones contra el período anterior, gráficos de tendencia ni fotos.

Pantalla: FINANZAS // LIQUIDACIONES, escritorio 1440px. Mismo encabezado que Caja, con pestañas Caja | Liquidaciones (activa) | Productos.

Contexto: los clientes pagan a la barbería y la barbería le paga a cada barbero lo que le corresponde. Se puede pagar por semana, por quincena o cualquier rango corto (por ejemplo 2 días, si el barbero necesita cobrar antes).

Barra de control:
- Selector "Liquidar hasta" (fecha, nunca futura) con atajos: Hoy, Domingo pasado, Día 15.
- Franja de totales: Total a pagar | Cortes pendientes | Comisiones por productos | Adelantos a descontar.

Tabla "Pendiente por barbero", una fila por barbero:
- Columnas:
  - Barbero (avatar con iniciales, nombre y "Comisión 50%").
  - Cortes sin pagar (cantidad y "desde 8 sept").
  - Facturado por servicios.
  - Le corresponde por cortes.
  - Comisiones por productos.
  - Adelantos a descontar (en borgoña).
  - NETO A PAGAR, destacado en latón grande.
  - Último pago ("Pagado hasta 31 ago" o "Nunca").
- Acciones: botón secundario "Adelanto" y primario "Pagar".
- Una fila con neto 0 muestra "Al día" y el botón deshabilitado.
- Una fila donde los adelantos superan lo generado muestra un aviso borgoña "Los adelantos superan lo generado".

Panel lateral derecho (drawer de 420px) abierto para "Pagar liquidación — Admin Barbería":
- Período: desde la fecha del corte más viejo sin pagar hasta la fecha elegida.
- Sección "Cortes": lista con fecha, servicio, cliente, precio, % y le corresponde.
- Sección "Comisiones por ventas": producto, cantidad, total de la venta y comisión.
- Sección "Adelantos a descontar": fecha, nota y monto en negativo.
- Cuenta final alineada a la derecha: Cortes + Comisiones − Adelantos = NETO.
- Selector de medio de pago segmentado: Efectivo / Transferencia.
- Nota opcional.
- Botón primario ancho "Confirmar pago $27.600".
- Texto chico: "Los cortes, ventas y adelantos incluidos quedan marcados como pagados. Si te equivocás, podés anular el pago desde el historial."

Sección inferior "Historial de pagos":
- Columnas: Fecha de pago | Barbero | Período (8 sept – 13 sept) | Cortes | Comisiones | Adelantos | Neto pagado | Medio | Registrado por.
- Acciones: "Ver comprobante" y "Anular".
```

---

## 3. Modal — Registrar adelanto (desktop)

```
Usá el sistema de diseño "Oficio Barbería Clásica" de este proyecto. Mismo estilo de modal que "Nuevo turno" y "Nuevo cliente": superficie elevada, línea superior de latón, encabezado con ícono en recuadro, título en Oswald y subtítulo. Español rioplatense, montos en JetBrains Mono, íconos Material Symbols. Mostralo sobre la pantalla de Liquidaciones oscurecida.

Modal "Registrar adelanto" (ancho 560px):
- Encabezado: ícono de billete, eyebrow "Liquidaciones", título "Registrar adelanto", subtítulo "Plata que le das hoy a un barbero y se descuenta sola de su próximo pago".
- Campos:
  1. Barbero: selector con avatar, nombre y, a la derecha, "Pendiente $31.000".
  2. Monto: input grande con prefijo $.
  3. Fecha: por defecto hoy; no permite fechas futuras.
  4. Medio de pago: segmentado Efectivo / Transferencia.
  5. Nota opcional ("Pidió adelanto por viaje").
- Recuadro de resumen: "Tiene pendiente $31.000 · Adelanto $5.000 · Le quedaría para el próximo pago $26.000". Si el adelanto supera lo pendiente, aviso borgoña "El adelanto supera lo que tiene generado".
- Pie: botón fantasma "Cancelar" y botón primario "Registrar adelanto".
```

---

## 4. Finanzas — Productos y stock (desktop 1440px)

```
Usá el sistema de diseño "Oficio Barbería Clásica" de este proyecto y el mismo esqueleto que las pantallas anteriores: header fijo de 64px (logo OFICIO, botón "+ Nuevo turno", notificaciones, usuario) y barra lateral izquierda de 256px con Operación diaria (Agenda & Turnos, Clientes), Mi espacio (Mis horarios, Fotos y bio, Mi perfil) y Administración (Barberos & Equipo, Servicios & Tarifas, Finanzas & Caja activo). Español rioplatense, montos ARS en JetBrains Mono, títulos Oswald mayúsculas, cuerpo Inter, íconos Material Symbols. No agregues fotos de productos: usá un ícono en recuadro. Nada de proveedores, códigos de barras ni proyecciones.

Pantalla: FINANZAS // PRODUCTOS, escritorio 1440px. Mismo encabezado, con pestañas Caja | Liquidaciones | Productos (activa). Acciones: secundario "Reponer stock" y primario "+ Nuevo producto".

Franja de resumen: Productos activos | Unidades en stock | Con stock bajo (en borgoña si hay alguno) | Vendido últimos 30 días (monto y unidades).

Catálogo como grilla de tarjetas o tabla densa. Cada producto muestra:
- nombre y descripción corta;
- precio de venta;
- costo y margen %;
- stock con barra y la leyenda "mínimo 2", con alerta borgoña "Stock bajo" si está en el mínimo o debajo;
- comisión para el barbero que lo vende (%);
- vendidos en los últimos 30 días;
- estado Activo / Inactivo.
Acciones por producto: "Vender", "Reponer", "Editar", "Desactivar". Un producto inactivo aparece atenuado.

Tabla "Ventas recientes":
- Columnas: Fecha | Producto | Cantidad | Total | Vendedor (nombre del barbero, o "Local" si vendió la barbería) | Comisión | Medio de pago.
- Acción "Anular". Si la comisión ya se pagó en una liquidación, en lugar de "Anular" muestra un tag "Liquidada".

Panel lateral derecho (drawer de 420px) "Nuevo producto":
- Campos: nombre, descripción, precio de venta, costo (opcional), stock inicial, stock mínimo para avisar, % de comisión para el barbero que lo vende y switch Activo.
- Vista previa en vivo: "Margen: $4.000 (50%) · Comisión por unidad: $800".
- Botón "Guardar producto".
```

---

## 5. Modal — Registrar venta de producto (desktop)

```
Usá el sistema de diseño "Oficio Barbería Clásica" de este proyecto. Mismo estilo de modal que "Nuevo turno": superficie elevada, línea superior de latón, encabezado con ícono en recuadro, pie con resumen y botones. Español rioplatense, montos en JetBrains Mono, íconos Material Symbols. Mostralo sobre la pantalla de Productos oscurecida.

Modal "Registrar venta" (ancho 640px):
- Encabezado: ícono de bolsa, eyebrow "Productos", título "Registrar venta", subtítulo "Descuenta stock y suma a la caja".
- Campos:
  1. Producto: selector con nombre, precio y "6 en stock". Los que no tienen stock aparecen deshabilitados con "Sin stock".
  2. Cantidad: stepper − / + con máximo igual al stock. Si se pide más, error "Hay 6 unidades disponibles".
  3. Quién vendió:
     - selector con los barberos (avatar y "Comisión 10%");
     - opción "Venta del local (sin comisión)".
  4. Fecha: por defecto hoy; no futura.
  5. Medio de pago: segmentado Efectivo / Transferencia.
- Pie con resumen en línea:
  - Precio unitario × cantidad = TOTAL (grande en latón).
  - "Comisión para Juan: $1.600".
  - "Quedan 4 en stock".
- Botones: "Cancelar" y "Registrar venta".
```

---

## 6. Modal — Movimiento de caja: egresos, compras e inversiones (desktop)

```
Usá el sistema de diseño "Oficio Barbería Clásica" de este proyecto. Mismo estilo de modal que "Nuevo turno": superficie elevada, línea superior de latón, encabezado con ícono en recuadro, pie con resumen y botones. Español rioplatense, montos en JetBrains Mono, íconos Material Symbols. Mostralo sobre la pantalla de Caja oscurecida.

Modal "Registrar movimiento" (ancho 640px):
- Encabezado: ícono de caja registradora, eyebrow "Caja", título "Registrar movimiento".
- Arriba, segmentado grande: Egreso (activo, borgoña) | Ingreso.
- Categorías como chips grandes con ícono.
  - Para egreso:
    - "Insumos" (toallas, alcohol, hojas de afeitar);
    - "Equipamiento e inversiones" (navajas, máquinas, matizadores, muebles);
    - "Reposición de productos";
    - "Alquiler y servicios";
    - "Otro gasto".
  - Para ingreso: "Saldo inicial" y "Otro ingreso".
- Campos comunes: descripción ("Navaja clásica de acero"), monto grande con $, fecha (no futura) y medio de pago segmentado Efectivo / Transferencia.
- Si la categoría es "Reposición de productos", aparece un bloque extra:
  - selector de producto con su stock actual;
  - cantidad comprada;
  - texto "Suma 3 unidades al stock de Gel fijación fuerte (queda en 9)".
- Pie con resumen: "Sale de Efectivo · saldo actual $81.000 → $56.000". En borgoña si el saldo queda negativo.
- Botones: "Cancelar" y "Registrar egreso" (o "Registrar ingreso", según el segmento elegido).
```

---

## 7. Detalle de turno — Marcar completado con medio de pago (desktop)

```
Tomá la pantalla existente "Detalle de turno" de este proyecto y mantenela idéntica, con un solo cambio.

Al tocar "Marcar completado", en lugar de completar directo aparece dentro del mismo modal un paso de confirmación "¿Cómo pagó el cliente?":
- Dos opciones grandes tipo tarjeta seleccionable:
  - "Efectivo" (ícono de billetes);
  - "Transferencia" (ícono de banco), con subtítulo "A la cuenta de la barbería".
- El total a cobrar grande en latón.
- Texto chico: "Queda registrado en la caja y en la liquidación del barbero".
- Botones: "Volver" y primario verde "Confirmar cobro".
Mostrá el modal con "Transferencia" seleccionada.
```

---

## 8. Mobile — Caja (390px)

```
Usá el sistema de diseño "Oficio Barbería Clásica" de este proyecto y el mismo esqueleto mobile que "Agenda móvil barbero": header de 64px con logo y título de sección, y barra de navegación inferior (Agenda, Clientes, botón central +, Horarios, Menú). Español rioplatense, montos ARS en JetBrains Mono, títulos Oswald mayúsculas, ingresos en verde salvia y egresos en borgoña, íconos Material Symbols. No agregues gráficos de tendencia, proyecciones ni fotos.

Pantalla "Caja" en 390px de ancho:
- Pestañas desplazables: Caja (activa) | Liquidaciones | Productos.
- Selector de período compacto ("Esta semana ▾").
- Saldo total grande. Debajo, carrusel horizontal con tarjetas Efectivo / Transferencia / Sin especificar.
- Resumen del período en dos filas: Ingresos (monto verde) y Egresos (monto borgoña), y Resultado.
- Lista "Movimientos" como tarjetas compactas agrupadas por día ("Hoy", "Ayer", "Jue 10 sept"). Cada tarjeta muestra ícono de tipo, concepto, detalle en gris, chip de medio de pago y monto con signo a la derecha.
- Filtro rápido arriba de la lista: Todos / Ingresos / Egresos.
- Botón flotante secundario "Registrar egreso" encima de la barra inferior.
```

---

## 9. Mobile — Liquidaciones (390px)

```
Usá el sistema de diseño "Oficio Barbería Clásica" de este proyecto y el mismo esqueleto mobile que "Agenda móvil barbero": header de 64px con logo y título de sección, y barra de navegación inferior (Agenda, Clientes, botón central +, Horarios, Menú). Español rioplatense, montos ARS en JetBrains Mono, títulos Oswald mayúsculas, íconos Material Symbols.

Pantalla "Liquidaciones" en 390px de ancho:
- Pestañas: Caja | Liquidaciones (activa) | Productos.
- Selector "Liquidar hasta: Hoy ▾" y total a pagar grande.
- Una tarjeta por barbero, con:
  - avatar con iniciales, nombre y comisión %;
  - fila de chips: "3 cortes", "+$1.600 comisiones", "−$5.000 adelantos";
  - NETO A PAGAR grande en latón;
  - "Pagado hasta 31 ago";
  - botones "Adelanto" y "Pagar".
- Una tarjeta "Al día" atenuada, sin botón Pagar.
- Hoja inferior (bottom sheet) abierta para pagar a un barbero:
  - resumen Cortes / Comisiones / Adelantos / Neto;
  - enlace "Ver detalle de cortes";
  - segmentado Efectivo / Transferencia;
  - botón ancho "Confirmar pago $27.600".
```
