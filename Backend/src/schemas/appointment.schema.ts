import { z } from "zod";

export const createAppointmentSchema = z.object({
    barber_id: z.number().int().positive(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
    time: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format"),
});
