# Informe de proyecto — BarberiaWeb

## 1. Resumen ejecutivo

BarberiaWeb es un sistema de gestión integral para una barbería, compuesto por tres partes que comparten un único backend: una landing page pública para captar y agendar clientes, un dashboard privado para que los barberos y el administrador gestionen la operación diaria, y una API que centraliza toda la lógica de negocio. El proyecto está pensado para correr **100% en local**, sin infraestructura en la nube, desarrollado por una sola persona en etapas incrementales con control de versiones en GitHub.

---

## 2. Arquitectura general

```
┌─────────────────┐     ┌──────────────────┐
│   Landing Page   │     │  Dashboard        │
│   (React + JS)   │     │  Barberos/Admin   │
│   Clientes        │     │  (React + JS)     │
└────────┬─────────┘     └────────┬──────────┘
         │                        │
         └───────────┬────────────┘
                      │
              ┌───────▼────────┐
              │    Backend      │
              │  Node + Express │
              │   TypeScript    │
              └───────┬─────────┘
                      │
              ┌───────▼────────┐
              │     MySQL        │
              │  (Docker local)  │
              └──────────────────┘
```

Un solo backend atiende a ambos frontends. La landing usa endpoints públicos y de clientes; el dashboard usa endpoints autenticados de barberos/admin.

---

## 3. Roles de usuario

| Rol              | Puede                                                                                                      |
| ---------------- | ---------------------------------------------------------------------------------------------------------- |
| **admin**        | Gestionar todo el sistema: usuarios, finanzas, caja, alta de barberos. No necesariamente atiende clientes. |
| **barber**       | Gestionar su propia agenda, turnos, fotos y descripción de perfil.                                         |
| **admin_barber** | Combina ambos: atiende clientes y administra el sistema.                                                   |

Un mismo usuario puede tener cualquiera de los tres roles, definido por el admin al crearlo.

---

## 4. Tecnologías

| Capa                    | Stack                                        | Notas                                                       |
| ----------------------- | -------------------------------------------- | ----------------------------------------------------------- |
| Landing page            | React + JavaScript (JSX)                     | Sin TypeScript                                              |
| Dashboard               | React + JavaScript (JSX)                     | Sin TypeScript, CSS plano (sin Tailwind ni librerías de UI) |
| Backend                 | Node.js + Express + TypeScript               | Arquitectura MVC                                            |
| Base de datos           | MySQL 8                                      | Corre en Docker, solo para desarrollo local                 |
| Administración de DB    | phpMyAdmin                                   | Vía Docker, puerto 8080                                     |
| Autenticación           | JWT (jsonwebtoken) + bcrypt                  | Tokens separados para staff (barbero/admin) y clientes      |
| Validación              | Zod                                          | Valida todos los inputs de la API antes de tocar la base    |
| Seguridad               | Helmet, CORS restringido, express-rate-limit | Headers seguros, rate limiting en auth/turnos/clientes      |
| Subida de archivos      | Multer                                       | Fotos de barberos guardadas en disco local                  |
| Cliente HTTP (frontend) | Axios                                        | Con interceptores para token y manejo de sesión expirada    |
| Ruteo (frontend)        | React Router                                 | Rutas protegidas según autenticación y rol                  |

El backend corre directo en la máquina (`npm run dev`), sin Docker — solo la base de datos y phpMyAdmin están dockerizados.

---

## 5. Identidad visual del dashboard

El dashboard se diseñó para sentirse como el libro de turnos físico de una barbería seria: preciso, con peso visual, sin gradientes ni colores pastel. Pensado para lectura rápida entre corte y corte.

### Paleta de colores

| Variable           | Hex       | Uso                                                             |
| ------------------ | --------- | --------------------------------------------------------------- |
| `--bg-base`        | `#18181B` | Fondo general (charcoal cálido, no negro puro)                  |
| `--bg-surface`     | `#242320` | Sidebar, cards                                                  |
| `--bg-elevated`    | `#2E2C28` | Elementos flotantes, modales                                    |
| `--brass`          | `#B8925A` | Acento principal — bronce, como las placas de barbería clásicas |
| `--burgundy`       | `#8B3A3A` | Acento secundario — alertas, cancelaciones                      |
| `--sage`           | `#4A7A5C` | Estados positivos — disponible, completado                      |
| `--text-primary`   | `#EDE9E3` | Texto principal (hueso, no blanco puro)                         |
| `--text-secondary` | `#A39D94` | Texto secundario                                                |

### Tipografía

- **Oswald** (condensada, bold): títulos, números grandes, nombres — evoca carteles de barbería
- **Inter**: texto general de la interfaz
- **JetBrains Mono**: horarios y datos numéricos (10:00, 10:30...) para que los turnos se lean como una lista técnica y precisa

### Elemento distintivo

La grilla semanal de turnos ("libro de turnos"): columnas por día, filas por horario, con una línea sutil marcando la hora actual — el componente central del dashboard.

---

## 6. Modelo de datos

| Tabla           | Contenido                                                                          |
| --------------- | ---------------------------------------------------------------------------------- |
| `users`         | Barberos y admins. Incluye rol, bio, precio de servicio, % de reparto de ganancias |
| `clients`       | Clientes de la landing. Solo nombre, apellido, teléfono                            |
| `schedules`     | Agenda semanal de cada barbero: días, horario, duración entre turnos               |
| `appointments`  | Turnos reservados: cliente, barbero, fecha, hora, estado, precio                   |
| `barber_photos` | Hasta 4 fotos por barbero, mostradas en la landing                                 |

---

## 7. Reglas de negocio clave

- El cliente se registra/loguea solo con teléfono (sin contraseña)
- Máximo **1 turno activo por día** por cliente
- Límite configurable de turnos **por semana** (actualmente 1, vía variable de entorno)
- Para cambiar de horario el mismo día, el cliente cancela el turno existente y saca uno nuevo
- Los horarios disponibles se calculan automáticamente a partir de la agenda semanal del barbero (hora inicio, hora fin, duración entre cortes)
- Un turno pasa de `active` → `completed` cuando el barbero lo marca, y ahí se refleja en las finanzas
- Un turno cancelado libera el slot para otro cliente

---

## 8. Seguridad implementada

- Registro público eliminado — ningún usuario puede autoasignarse rol admin. El primer admin se crea vía script de consola (seed), el resto los da de alta un admin ya autenticado
- Contraseñas hasheadas con bcrypt, nunca en texto plano
- JWT con expiración, separado por tipo de usuario (staff vs. cliente)
- CORS restringido a los orígenes del proyecto (no acepta cualquier dominio)
- Rate limiting en login, registro de clientes y creación de turnos (previene fuerza bruta y spam)
- Validación de todos los inputs con Zod antes de llegar a la base de datos
- Manejo global de errores: ningún error de base de datos tumba el servidor
- Índices en las columnas más consultadas para evitar escaneos completos de tabla al crecer los datos
- Consulta pública de barberos optimizada con JOIN (sin problema de N+1 queries)

---

## 9. Estado actual por módulo

### Backend — Completo

Auth, agendas, turnos con todas sus validaciones, fotos, endpoint público, panel admin con finanzas, seguridad y optimizaciones de escalabilidad.

### Dashboard de barberos — En progreso

- ✅ Proyecto base (Vite + React JS, sin TS, sin Tailwind)
- ✅ Sistema de diseño (paleta, tipografía, componentes base)
- ✅ Login conectado al backend
- ✅ Rutas protegidas y contexto de autenticación
- ✅ Sidebar con navegación condicional por rol
- ⏳ Grilla semanal de turnos (pantalla principal)
- ⏳ Pantalla "Mis horarios" (abrir agenda semanal)
- ⏳ Pantalla de perfil y fotos
- ⏳ Panel admin: gestión de barberos
- ⏳ Panel admin: finanzas

### Landing page — No iniciada

Pendiente de arrancar una vez cerrado el dashboard.

---

## 10. Metodología de trabajo

- Desarrollo por etapas, cada una cerrada con commit y push a GitHub
- Archivos completos entregados en cada paso, sin fragmentos parciales salvo corrección puntual
- Código en inglés (tablas, variables, funciones), mensajes de trabajo en español
- Sin archivos de más de 300-600 líneas; se divide en módulos cuando hace falta
- Todo probado con `curl` antes de avanzar a la siguiente etapa
- Entorno de shell: fish (no bash)

---

## 11. Próximos pasos inmediatos

1. Construir la grilla semanal de turnos (pantalla principal del dashboard)
2. Pantalla "Mis horarios" para que el barbero abra su agenda semana a semana
3. Pantalla de perfil y fotos
4. Panel admin (barberos + finanzas)
5. Arrancar landing page

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
