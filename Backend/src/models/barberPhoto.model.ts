import pool from "../config/db";

export interface BarberPhoto {
    id: number;
    barber_id: number;
    photo_url: string;
    is_profile: boolean;
    title: string | null;
    description: string | null;
    order_position: number;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
}

export const BarberPhotoModel = {
    async create(data: Omit<BarberPhoto, "id" | "created_at" | "updated_at">) {
        const [result] = await pool.execute(
            `INSERT INTO barber_photos (barber_id, photo_url, is_profile, title, description, order_position) 
       VALUES (?, ?, ?, ?, ?, ?)`,
            [
                data.barber_id,
                data.photo_url,
                data.is_profile || false,
                data.title || null,
                data.description || null,
                data.order_position || 0,
            ],
        );
        return result;
    },

    async findByBarberId(barberId: number) {
        const [rows] = await pool.execute(
            "SELECT * FROM barber_photos WHERE barber_id = ? AND is_active = TRUE ORDER BY order_position, created_at DESC",
            [barberId],
        );
        return rows as BarberPhoto[];
    },

    async findProfilePhoto(barberId: number) {
        const [rows] = await pool.execute(
            "SELECT * FROM barber_photos WHERE barber_id = ? AND is_profile = TRUE AND is_active = TRUE LIMIT 1",
            [barberId],
        );
        return (rows as BarberPhoto[])[0];
    },

    async findById(id: number) {
        const [rows] = await pool.execute("SELECT * FROM barber_photos WHERE id = ? AND is_active = TRUE", [id]);
        return (rows as BarberPhoto[])[0];
    },

    async setProfile(id: number, barberId: number) {
        // Quitar profile de todas las fotos del barbero
        await pool.execute("UPDATE barber_photos SET is_profile = FALSE WHERE barber_id = ?", [barberId]);
        // Establecer esta como profile
        await pool.execute("UPDATE barber_photos SET is_profile = TRUE WHERE id = ?", [id]);
    },

    async delete(id: number) {
        await pool.execute("UPDATE barber_photos SET is_active = FALSE WHERE id = ?", [id]);
    },

    async updateOrder(id: number, orderPosition: number) {
        await pool.execute("UPDATE barber_photos SET order_position = ? WHERE id = ?", [orderPosition, id]);
    },
};
