import pool from "../config/db";

export interface Branch {
    id: number;
    name: string;
    address: string;
    phone: string | null;
    email: string | null;
    schedule_info: string | null;
    latitude: number | null;
    longitude: number | null;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
}

export const BranchModel = {
    async create(data: Omit<Branch, "id" | "created_at" | "updated_at">) {
        const [result] = await pool.execute(
            `INSERT INTO branches (name, address, phone, email, schedule_info, latitude, longitude) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                data.name,
                data.address,
                data.phone || null,
                data.email || null,
                data.schedule_info || null,
                data.latitude || null,
                data.longitude || null,
            ],
        );
        return result;
    },

    async findAll() {
        const [rows] = await pool.execute("SELECT * FROM branches WHERE is_active = TRUE ORDER BY name");
        return rows as Branch[];
    },

    async findById(id: number) {
        const [rows] = await pool.execute("SELECT * FROM branches WHERE id = ? AND is_active = TRUE", [id]);
        return (rows as Branch[])[0];
    },

    async update(id: number, data: Partial<Omit<Branch, "id" | "created_at" | "updated_at">>) {
        const [result] = await pool.execute(
            `UPDATE branches SET name = COALESCE(?, name), 
                            address = COALESCE(?, address), 
                            phone = COALESCE(?, phone), 
                            email = COALESCE(?, email), 
                            schedule_info = COALESCE(?, schedule_info), 
                            latitude = COALESCE(?, latitude), 
                            longitude = COALESCE(?, longitude) 
       WHERE id = ?`,
            [
                data.name || null,
                data.address || null,
                data.phone || null,
                data.email || null,
                data.schedule_info || null,
                data.latitude || null,
                data.longitude || null,
                id,
            ],
        );
        return result;
    },

    async deactivate(id: number) {
        await pool.execute("UPDATE branches SET is_active = FALSE WHERE id = ?", [id]);
    },
};
