import { z } from "zod";
import { phoneField, requireAtLeastOneField } from "./common";

// Apellido opcional: desde el dashboard se da de alta a un cliente al vuelo
// con nombre y teléfono, sin frenar el turno por un dato que no hace falta.
const lastNameField = z.string().trim().max(100);

export const createClientSchema = z.object({
    first_name: z.string().trim().min(2).max(100),
    last_name: lastNameField.optional(),
    phone: phoneField,
    notes: z.string().max(500).optional(),
});

export const updateClientSchema = requireAtLeastOneField(
    z.object({
        first_name: z.string().trim().min(2).max(100).optional(),
        last_name: lastNameField.optional(),
        phone: phoneField.optional(),
        notes: z.string().max(500).optional(),
    }),
);
