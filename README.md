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
