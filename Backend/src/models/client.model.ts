import pool from "../config/db";
import { SecurityUtils } from "../utils/security";

export interface Client {
    id: number;
    full_name: string;
    phone: string;
    email: string | null;
    password_hash: string;
    profile_image: string | null;
    is_active: boolean;
    total_appointments: number;
    last_appointment_date: Date | null;
    created_at: Date;
    updated_at: Date;
}

export const ClientModel = {
    async create(fullName: string, phone: string, password: string, email?: string) {
        const hash = await SecurityUtils.hashPassword(password);
        const [result] = await pool.execute(
            `INSERT INTO clients (full_name, phone, email, password_hash) 
       VALUES (?, ?, ?, ?)`,
            [fullName.trim(), phone.trim(), email?.toLowerCase().trim() || null, hash],
        );
        return result;
    },

    async findByPhone(phone: string) {
        const [rows] = await pool.execute("SELECT * FROM clients WHERE phone = ? AND is_active = TRUE", [phone.trim()]);
        return (rows as Client[])[0];
    },

    async findById(id: number) {
        const [rows] = await pool.execute(
            `SELECT id, full_name, phone, email, profile_image, is_active, total_appointments, 
              last_appointment_date, created_at 
       FROM clients WHERE id = ? AND is_active = TRUE`,
            [id],
        );
        return (rows as Client[])[0];
    },

    async updateLastAppointment(id: number) {
        await pool.execute(
            `UPDATE clients SET last_appointment_date = CURDATE(), 
                          total_appointments = total_appointments + 1 
       WHERE id = ?`,
            [id],
        );
    },

    async findAll() {
        const [rows] = await pool.execute(
            `SELECT id, full_name, phone, email, profile_image, total_appointments, 
              last_appointment_date, created_at 
       FROM clients WHERE is_active = TRUE 
       ORDER BY created_at DESC`,
        );
        return rows as Client[];
    },

    async search(term: string) {
        const [rows] = await pool.execute(
            `SELECT id, full_name, phone, email, profile_image, total_appointments 
       FROM clients 
       WHERE is_active = TRUE 
       AND (full_name LIKE ? OR phone LIKE ?)
       LIMIT 20`,
            [`%${term}%`, `%${term}%`],
        );
        return rows as Client[];
    },

    async updateProfile(id: number, data: { full_name?: string; email?: string; profile_image?: string }) {
        const [result] = await pool.execute(
            `UPDATE clients SET full_name = COALESCE(?, full_name), 
                           email = COALESCE(?, email), 
                           profile_image = COALESCE(?, profile_image) 
       WHERE id = ?`,
            [data.full_name || null, data.email || null, data.profile_image || null, id],
        );
        return result;
    },

    async deactivate(id: number) {
        await pool.execute("UPDATE clients SET is_active = FALSE WHERE id = ?", [id]);
    },
};
