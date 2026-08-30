import { z } from "zod";
import { isValidCalendarDate } from "../utils/validators";

export const calendarDateField = z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format")
    .refine(isValidCalendarDate, { message: "Date does not exist" });

// Bounded HH:MM (00-23:00-59), unlike a bare \d{2}:\d{2} regex which lets
// values like "25:99" through: those reach MySQL's TIME column under
// STRICT_TRANS_TABLES and throw an unhandled error (500) instead of a clean
// validation error, confirmed live during the 2026-08-10 audit.
export const timeField = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Invalid time format");

export const requireAtLeastOneField = <T extends z.ZodRawShape>(schema: z.ZodObject<T>) =>
    schema.refine(data => Object.keys(data).length > 0, { message: "At least one field is required" });

// Used only when a new password is being set (registration, password change),
// never for login — login must keep accepting whatever password an existing
// account was created with, even if it predates this policy.
export const strongPasswordField = z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .max(100)
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character");
