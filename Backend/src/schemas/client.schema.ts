import { z } from "zod";
import { requireAtLeastOneField, strongPasswordField } from "./common";

const phoneField = z
    .string()
    .min(8)
    .max(30)
    .regex(/^[0-9+\-\s]+$/, "Invalid phone format");

export const registerClientSchema = z.object({
    first_name: z.string().min(2).max(100),
    last_name: z.string().min(2).max(100),
    phone: phoneField,
    password: strongPasswordField,
});

// El staff da de alta clientes sin password (ej. reserva presencial): la
// cuenta queda igual que una legacy y el cliente la reclama con POST
// /clients/claim la primera vez que quiere entrar desde la Landing.
export const createClientSchema = z.object({
    first_name: z.string().min(2).max(100),
    last_name: z.string().min(2).max(100),
    phone: phoneField,
});

// Login nunca valida contra la política fuerte: una cuenta creada antes de
// un endurecimiento de política sigue teniendo que poder loguearse con su
// password original (mismo criterio que loginSchema de staff).
export const loginClientSchema = z.object({
    phone: phoneField,
    password: z.string().min(1).max(100),
});

// Migración one-time para clientes creados antes de que existiera password:
// mismos 3 campos identificadores que usaba el login viejo (no empeora la
// seguridad, es un paso único) + la password nueva que van a usar de ahora
// en más.
export const claimClientSchema = z.object({
    first_name: z.string().min(2).max(100),
    last_name: z.string().min(2).max(100),
    phone: phoneField,
    password: strongPasswordField,
});

export const updateClientSchema = requireAtLeastOneField(
    z.object({
        first_name: z.string().min(2).max(100).optional(),
        last_name: z.string().min(2).max(100).optional(),
        phone: phoneField.optional(),
        notes: z.string().max(500).optional(),
    }),
);
