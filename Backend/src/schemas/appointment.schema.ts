import { z } from "zod";
import { calendarDateField, phoneField, requireAtLeastOneField, timeField } from "./common";

const dateField = calendarDateField;

const noteField = z.string().max(300).optional();

// Reserva pública como invitado: no hay cuenta ni JWT de cliente, así que
// el nombre/teléfono viajan en el body y el backend resuelve o crea el
// cliente por teléfono (mismo find-or-create que usa el alta por staff).
export const createAppointmentSchema = z.object({
    first_name: z.string().min(2).max(100),
    last_name: z.string().min(2).max(100),
    phone: phoneField,
    barber_id: z.number().int().positive(),
    service_id: z.number().int().positive(),
    date: dateField,
    time: timeField,
    note: noteField,
});

export const createAppointmentByAdminSchema = z.object({
    client_id: z.number().int().positive(),
    barber_id: z.number().int().positive(),
    service_id: z.number().int().positive(),
    date: dateField,
    time: timeField,
    note: noteField,
});

export const createAppointmentByBarberSchema = z.object({
    client_id: z.number().int().positive(),
    service_id: z.number().int().positive(),
    date: dateField,
    time: timeField,
    note: noteField,
});

// Opcional: el cuerpo puede venir vacío (clientes viejos del dashboard) y el
// turno queda con medio de pago "sin especificar".
export const completeAppointmentSchema = z
    .object({
        payment_method: z.enum(["cash", "transfer"]).optional(),
    })
    .optional();

export const updateAppointmentByAdminSchema = requireAtLeastOneField(
    z.object({
        barber_id: z.number().int().positive().optional(),
        date: dateField.optional(),
        time: timeField.optional(),
    }),
);
