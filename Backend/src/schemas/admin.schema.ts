import { z } from "zod";
import { requireAtLeastOneField, strongPasswordField } from "./common";

const barberPhoneField = z
    .string()
    .min(8)
    .max(30)
    .regex(/^[0-9+\-\s]+$/, "Invalid phone format");

const serviceIdsField = z.array(z.number().int().positive());
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
    service_ids: serviceIdsField.optional(),
    phone: barberPhoneField.optional(),
    social_media: socialMediaField.optional(),
    birth_date: birthDateField.optional(),
    address: addressField.optional(),
});

export const deleteBarberSchema = z.object({
    password: z.string().min(1).max(200).optional(),
});

export const updateBarberSchema = requireAtLeastOneField(
    z.object({
        first_name: z.string().min(2).max(100).optional(),
        last_name: z.string().min(2).max(100).optional(),
        bio: z.string().max(1000).optional(),
        role: z.enum(["admin", "barber", "admin_barber"]).optional(),
        earnings_split_percentage: z.number().min(0).max(100).optional(),
        service_ids: serviceIdsField.optional(),
        phone: barberPhoneField.optional(),
        social_media: socialMediaField.optional(),
        birth_date: birthDateField.optional(),
        address: addressField.optional(),
    }),
);
