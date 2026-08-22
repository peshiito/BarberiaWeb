import { z } from "zod";
import { strongPasswordField } from "./common";

export const updateBioSchema = z.object({
    bio: z.string().max(1000),
});

export const updateProfileDetailsSchema = z.object({
    first_name: z.string().min(2).max(100),
    last_name: z.string().min(2).max(100),
});

export const changePasswordSchema = z.object({
    current_password: z.string().min(1).max(100),
    new_password: strongPasswordField,
});
