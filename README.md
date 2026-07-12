necesito tu ayuda claude

quiero levantar una web para una barberia, en este caso va a funcionar de la siguiente manera, quiero dos web, una va a ser una landing page elaborada, que ayude a tratar de llamar a los clientes, con informacion de barberos y asi eso lo vemos luego

esta web tambien va a permitir un inicio de sesion minimo para agendar turnos con barberos y que los barberos puedan verlo ,tambien la idea es que los usuarios tengan limite de turnos por semana y un rate limit

la otra web es un dashboard donde los barberos puedan iniciar sesion con datos mas detallados, almacenen informacion sobre sus cortes, y las mecanicas mas importantes de esto es que los barberos puedan abrir agendas, las agendas la van a abrir cada semana, ademas de que carguen informacion como dias que trabajen, los horarios (ej 10am - 8pm) y el tiempo entre corte y corte, (juan tiene una demora de 30 minutos entre cortes, horarios de turnos 10 : 00 -- 10:30 -- 11:00 -- 11:30 -- 12:30 o si pedro tiene turnos cada 1 hora, los horarios de turnos para pedro son de 10: 00 -- 11: 00 -- 12:00 -- 13: 00), creo que con eso se entiendela funcion del dashboard para los barberos, con estadisticas y cosas asi, otra cosa del dashboard es del admin, que el pueda ver toda la informacion de los barberos, de los usuarios registrados (clientes, barberos, turnos, ganancias, caja, division de ganancia entre barbero y local, cosas asi), registrar nuevos barberos, aclaremos que el admin puede ser barbero tambien, tiene que poder ser ambas opciones, puede ser un admin, un barbero y un adminbarbero

mi idea es que para sacar turno los clientes desde la landing se registren con informacion minima como nombre, apellido y telefono para ponerse en contacto, ademas de eso podran anular turnos, solo pueden sacar un turno por dia, en el caso de que allan sacado un turno a las 12 el lunes, pero realmente queria el lunes a las 13, deberia anular el turno y sacar para el 13, ahora te voy a pasar las tecnologias y ademas de eso como vamos a hacer las carpetas para el trabajo

Una idea del backend es que maneje todo de las dos paginas

ademas que de eso pueda funcionar lo siguiente, un apartado con informacion donde se refleje en la lading page, que los barberos desde se dashboard puedan subir 3, 4 fotos y una extra de ellos, ademas de una descripcion que este vinculado a ellos, que eso se refleje en la landing page donde los usuarios peudan sacar turnos y ver los turnos disponible de los barberos y informacion

--LANDING PAGE --

Tecnologias : React con javascript

Utilizacion : informar sobre la barberia, los barberos, registro y inicio de sesion de usuarios para que saquen turnos

-- DASHBOARD BARBEROS --

Tecnologias : React con js

Utilizacion : Ver metricas, abrir agenda de cada barbero, admin ver metricas de cada barbero y informacion (caja de ahorro, division de ganancia local y barbero, registro de cada usuario (Barbero, admin y barberoadmin) ademas muchas metricas)

-- BACKEND --

Tecnologias : Nodejs Express Typescript Docker (Phpmyadmin, y mysql)

Utilizacion : La idea es que maneje ambas paginas, la forma de ordenar las carpetas sea mvc , maneje de todo lo necesario para ambas paginas, un solo backend

¡¡ ACLARACION DE TRABAJO !!

Iremos con un trabajo de flujo real, la idea es que no agregues mensajes extra, en lo posible que sea todo codigo, nada de comentar cosas raras o con emoji

Trabajaremos con mucho esfuerzo, primero iremos con backend, luego con el dashboard y despues con el landing page

trabajariamos con codigo completo, si yo te pido la correccion de algo vos tenes que ayudarme a ubicar esa correccion de ese codigo, un ejemplo app. ts quiero modificar esto (linea 116) o directamente el codigo del archivo completo con la correcion

otra cosa a mencionar es que la idea es que funcione todo en local, nada enla nube ni nada mas

vamos a trabajr por etapas, un ejemplo seria terminar con el registro de admin o con la base de datos o con partes completas y subir a github los cambios y asi

nada de codigos ultra largosde 300 lineas o 600 lineas, si hay que crear varios archivos asi sera

creo que con eso esta todo, quiero que ademas de las lineas de codigo, nombre de archivo me pases los arboles de archivos de proyectos, las lineas de comandos, pruebas curl

todo

este proyecto la idea es solo funcionar local

# Glosario BarberiaWeb (ES → EN)

| Español              | Inglés                    | Descripción                                             |
| -------------------- | ------------------------- | ------------------------------------------------------- |
| Usuarios             | `users`                   | Barberos y admins que inician sesión en el dashboard    |
| Clientes             | `clients`                 | Personas que sacan turnos desde la landing              |
| Turnos               | `appointments`            | Reservas de corte entre cliente y barbero               |
| Agendas              | `schedules`               | Configuración semanal de disponibilidad de un barbero   |
| Fotos de barbero     | `barber_photos`           | Imágenes subidas por el barbero para su perfil público  |
| Rol                  | `role`                    | admin / barber / admin_barber                           |
| Contraseña           | `password_hash`           | Contraseña ya hasheada (nunca se guarda en texto plano) |
| Nombre               | `first_name`              |                                                         |
| Apellido             | `last_name`               |                                                         |
| Teléfono             | `phone`                   |                                                         |
| Descripción          | `bio`                     | Texto del barbero mostrado en su perfil público         |
| Semana de inicio     | `week_start`              | Fecha desde la cual arranca una agenda                  |
| Días de trabajo      | `work_days`               | Días que el barbero atiende esa semana                  |
| Hora inicio / fin    | `start_time` / `end_time` | Rango horario de atención                               |
| Duración de turno    | `slot_duration_minutes`   | Minutos entre corte y corte                             |
| Estado               | `status`                  | active / cancelled / completed                          |
| Fecha                | `date`                    |                                                         |
| Hora                 | `time`                    |                                                         |
| Caja                 | `cash_register`           | Registro de ingresos del local                          |
| Ganancia             | `earnings`                |                                                         |
| División de ganancia | `earnings_split`          | Porcentaje entre barbero y local                        |

## Convención de nombres (estilo industria)

- **Tablas**: plural, snake_case → `users`, `appointments`
- **Columnas**: snake_case → `first_name`, `created_at`
- **Foreign keys**: `<tabla_singular>_id` → `user_id`, `client_id`
- **Archivos TypeScript**: camelCase → `user.model.ts`, `appointment.controller.ts`
- **Interfaces/Types**: PascalCase → `User`, `AppointmentInput`
- **Variables y funciones**: camelCase → `createUser`, `findByEmail`
- **Constantes**: UPPER_SNAKE_CASE → `JWT_SECRET`
  A partir de ahora todo el código (SQL, TS, variables) se maneja en inglés.
