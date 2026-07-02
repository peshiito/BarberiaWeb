import pool from "../config/db";

export interface BarberService {
    id: number;
    barber_id: number;
    name: string;
    description: string | null;
    duration: number;
    price: number;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
}

export const BarberServiceModel = {
    async create(data: Omit<BarberService, "id" | "created_at" | "updated_at">) {
        const [result] = await pool.execute(
            `INSERT INTO barber_services (barber_id, name, description, duration, price) 
       VALUES (?, ?, ?, ?, ?)`,
            [data.barber_id, data.name, data.description || null, data.duration, data.price],
        );
        return result;
    },

    async findByBarberId(barberId: number) {
        const [rows] = await pool.execute(
            "SELECT * FROM barber_services WHERE barber_id = ? AND is_active = TRUE ORDER BY name",
            [barberId],
        );
        return rows as BarberService[];
    },

    async findById(id: number) {
        const [rows] = await pool.execute("SELECT * FROM barber_services WHERE id = ? AND is_active = TRUE", [id]);
        return (rows as BarberService[])[0];
    },

    async update(id: number, data: Partial<Omit<BarberService, "id" | "barber_id" | "created_at" | "updated_at">>) {
        const [result] = await pool.execute(
            `UPDATE barber_services SET name = COALESCE(?, name), 
                                   description = COALESCE(?, description), 
                                   duration = COALESCE(?, duration), 
                                   price = COALESCE(?, price) 
       WHERE id = ?`,
            [data.name || null, data.description || null, data.duration || null, data.price || null, id],
        );
        return result;
    },

    async deactivate(id: number) {
        await pool.execute("UPDATE barber_services SET is_active = FALSE WHERE id = ?", [id]);
    },
};
