import bcrypt from "bcrypt";
import { env } from "../config/env";

export const SecurityUtils = {
    async hashPassword(password: string): Promise<string> {
        return bcrypt.hash(password, env.BCRYPT_ROUNDS);
    },

    async comparePassword(password: string, hash: string): Promise<boolean> {
        return bcrypt.compare(password, hash);
    },

    sanitizeInput(input: string): string {
        return input.trim().replace(/[<>]/g, "");
    },

    validatePhone(phone: string): boolean {
        return /^[0-9]{7,15}$/.test(phone.replace(/\s/g, ""));
    },

    validateEmail(email: string): boolean {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    },

    generateIdempotencyKey(): string {
        return `idem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    },

    maskPhone(phone: string): string {
        if (phone.length <= 4) return "****";
        return phone.slice(0, 2) + "****" + phone.slice(-2);
    },
};
