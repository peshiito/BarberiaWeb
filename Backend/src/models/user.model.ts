import pool from "../config/db";
import { SecurityUtils } from "../utils/security";

export interface User {
    id: number;
    email: string;
    password_hash: string;
    full_name: string;
    role: "admin" | "barber";
    profile_image: string | null;
    phone: string | null;
    is_active: boolean;
    last_login: Date | null;
    created_at: Date;
    updated_at: Date;
}

export const UserModel = {
    async create(email: string, password: string, fullName: string, role: "admin" | "barber", phone?: string) {
        const hash = await SecurityUtils.hashPassword(password);
        const [result] = await pool.execute(
            `INSERT INTO users (email, password_hash, full_name, role, phone) 
       VALUES (?, ?, ?, ?, ?)`,
            [email.toLowerCase().trim(), hash, fullName.trim(), role, phone || null],
        );
        return result;
    },

    async findByEmail(email: string) {
        const [rows] = await pool.execute("SELECT * FROM users WHERE email = ? AND is_active = TRUE", [
            email.toLowerCase().trim(),
        ]);
        return (rows as User[])[0];
    },

    async findById(id: number) {
        const [rows] = await pool.execute(
            `SELECT id, email, full_name, role, profile_image, phone, is_active, last_login, created_at 
       FROM users WHERE id = ? AND is_active = TRUE`,
            [id],
        );
        return (rows as User[])[0];
    },

    async updateLastLogin(id: number) {
        await pool.execute("UPDATE users SET last_login = NOW() WHERE id = ?", [id]);
    },

    async updateProfile(id: number, data: { full_name?: string; phone?: string; profile_image?: string }) {
        const [result] = await pool.execute(
            `UPDATE users SET full_name = COALESCE(?, full_name), 
                        phone = COALESCE(?, phone), 
                        profile_image = COALESCE(?, profile_image) 
       WHERE id = ?`,
            [data.full_name || null, data.phone || null, data.profile_image || null, id],
        );
        return result;
    },

    async deactivate(id: number) {
        await pool.execute("UPDATE users SET is_active = FALSE WHERE id = ?", [id]);
    },
};
