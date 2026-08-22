import { z } from "zod";
import { calendarDateField, requireAtLeastOneField, timeField } from "./common";

const dateField = calendarDateField;

export const createAppointmentSchema = z.object({
    barber_id: z.number().int().positive(),
    service_id: z.number().int().positive(),
    date: dateField,
    time: timeField,
});

export const createAppointmentByAdminSchema = z.object({
    client_id: z.number().int().positive(),
    barber_id: z.number().int().positive(),
    service_id: z.number().int().positive(),
    date: dateField,
    time: timeField,
});

export const createAppointmentByBarberSchema = z.object({
    client_id: z.number().int().positive(),
    service_id: z.number().int().positive(),
    date: dateField,
    time: timeField,
});

export const updateAppointmentByAdminSchema = requireAtLeastOneField(
    z.object({
        barber_id: z.number().int().positive().optional(),
        date: dateField.optional(),
        time: timeField.optional(),
    }),
);
