import { z } from "zod";
import { requireAtLeastOneField, strongPasswordField } from "./common";

const barberPhoneField = z
    .string()
    .min(8)
    .max(30)
    .regex(/^[0-9+\-\s]+$/, "Invalid phone format");

const specialtiesField = z.array(z.string().trim().min(1).max(40)).max(10);
const socialMediaField = z.string().max(150);
const birthDateField = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format");
const addressField = z.string().max(255);

export const createBarberSchema = z.object({
    first_name: z.string().min(2).max(100),
    last_name: z.string().min(2).max(100),
    email: z.string().email(),
    password: strongPasswordField,
    role: z.enum(["admin", "barber", "admin_barber"]),
    bio: z.string().max(1000).optional(),
    earnings_split_percentage: z.number().min(0).max(100).optional(),
    phone: barberPhoneField.optional(),
    specialties: specialtiesField.optional(),
    social_media: socialMediaField.optional(),
    birth_date: birthDateField.optional(),
    address: addressField.optional(),
});

export const updateBarberSchema = requireAtLeastOneField(
    z.object({
        first_name: z.string().min(2).max(100).optional(),
        last_name: z.string().min(2).max(100).optional(),
        bio: z.string().max(1000).optional(),
        role: z.enum(["admin", "barber", "admin_barber"]).optional(),
        earnings_split_percentage: z.number().min(0).max(100).optional(),
        service_ids: z.array(z.number().int().positive()).optional(),
        phone: barberPhoneField.optional(),
        specialties: specialtiesField.optional(),
        social_media: socialMediaField.optional(),
        birth_date: birthDateField.optional(),
        address: addressField.optional(),
    }),
);
