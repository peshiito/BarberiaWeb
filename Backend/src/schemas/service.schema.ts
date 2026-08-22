import { z } from "zod";
import { requireAtLeastOneField } from "./common";

export const createServiceSchema = z.object({
    name: z.string().min(2).max(100),
    description: z.string().max(255).optional(),
    price: z.number().nonnegative(),
    duration_minutes: z.number().int().positive().max(600),
    active: z.boolean().optional(),
});

export const updateServiceSchema = requireAtLeastOneField(
    z.object({
        name: z.string().min(2).max(100).optional(),
        description: z.string().max(255).optional(),
        price: z.number().nonnegative().optional(),
        duration_minutes: z.number().int().positive().max(600).optional(),
        active: z.boolean().optional(),
    }),
);
