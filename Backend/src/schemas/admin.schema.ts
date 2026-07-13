import { z } from "zod";

export const createBarberSchema = z.object({
    first_name: z.string().min(2).max(100),
    last_name: z.string().min(2).max(100),
    email: z.string().email(),
    password: z.string().min(6).max(100),
    role: z.enum(["admin", "barber", "admin_barber"]),
    bio: z.string().max(1000).optional(),
    service_price: z.number().nonnegative().optional(),
    earnings_split_percentage: z.number().min(0).max(100).optional(),
});
