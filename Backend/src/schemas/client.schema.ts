import { z } from "zod";
import { requireAtLeastOneField } from "./common";

export const registerClientSchema = z.object({
    first_name: z.string().min(2).max(100),
    last_name: z.string().min(2).max(100),
    phone: z
        .string()
        .min(8)
        .max(30)
        .regex(/^[0-9+\-\s]+$/, "Invalid phone format"),
});

export const createClientSchema = registerClientSchema;

export const updateClientSchema = requireAtLeastOneField(
    z.object({
        first_name: z.string().min(2).max(100).optional(),
        last_name: z.string().min(2).max(100).optional(),
        phone: z
            .string()
            .min(8)
            .max(30)
            .regex(/^[0-9+\-\s]+$/, "Invalid phone format")
            .optional(),
    }),
);
