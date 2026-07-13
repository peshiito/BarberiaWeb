import { z } from "zod";

export const registerClientSchema = z.object({
    first_name: z.string().min(2).max(100),
    last_name: z.string().min(2).max(100),
    phone: z
        .string()
        .min(8)
        .max(30)
        .regex(/^[0-9+\-\s]+$/, "Invalid phone format"),
});
