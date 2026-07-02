import pool from "../config/db";

export interface Barber {
    id: number;
    user_id: number;
    branch_id: number;
    specialty: string | null;
    experience_years: number;
    rating: number;
    total_ratings: number;
    bio: string | null;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
}

export const BarberModel = {
    async create(data: Omit<Barber, "id" | "rating" | "total_ratings" | "created_at" | "updated_at">) {
        const [result] = await pool.execute(
            `INSERT INTO barbers (user_id, branch_id, specialty, experience_years, bio) 
       VALUES (?, ?, ?, ?, ?)`,
            [data.user_id, data.branch_id, data.specialty || null, data.experience_years || 0, data.bio || null],
        );
        return result;
    },

    async findByUserId(userId: number) {
        const [rows] = await pool.execute(
            `SELECT b.*, u.full_name, u.email, u.profile_image, u.phone, br.name as branch_name 
       FROM barbers b 
       JOIN users u ON b.user_id = u.id 
       JOIN branches br ON b.branch_id = br.id 
       WHERE b.user_id = ? AND b.is_active = TRUE`,
            [userId],
        );
        return (rows as any[])[0];
    },

    async findById(id: number) {
        const [rows] = await pool.execute(
            `SELECT b.*, u.full_name, u.email, u.profile_image, u.phone, br.name as branch_name 
       FROM barbers b 
       JOIN users u ON b.user_id = u.id 
       JOIN branches br ON b.branch_id = br.id 
       WHERE b.id = ? AND b.is_active = TRUE`,
            [id],
        );
        return (rows as any[])[0];
    },

    async findAllByBranch(branchId: number) {
        const [rows] = await pool.execute(
            `SELECT b.*, u.full_name, u.email, u.profile_image, u.phone 
       FROM barbers b 
       JOIN users u ON b.user_id = u.id 
       WHERE b.branch_id = ? AND b.is_active = TRUE 
       ORDER BY u.full_name`,
            [branchId],
        );
        return rows as Barber[];
    },

    async findAll() {
        const [rows] = await pool.execute(
            `SELECT b.*, u.full_name, u.email, u.profile_image, br.name as branch_name 
       FROM barbers b 
       JOIN users u ON b.user_id = u.id 
       JOIN branches br ON b.branch_id = br.id 
       WHERE b.is_active = TRUE 
       ORDER BY u.full_name`,
        );
        return rows as any[];
    },

    async update(id: number, data: Partial<Omit<Barber, "id" | "created_at" | "updated_at">>) {
        const [result] = await pool.execute(
            `UPDATE barbers SET specialty = COALESCE(?, specialty), 
                           experience_years = COALESCE(?, experience_years), 
                           bio = COALESCE(?, bio), 
                           branch_id = COALESCE(?, branch_id) 
       WHERE id = ?`,
            [data.specialty || null, data.experience_years || null, data.bio || null, data.branch_id || null, id],
        );
        return result;
    },

    async deactivate(id: number) {
        await pool.execute("UPDATE barbers SET is_active = FALSE WHERE id = ?", [id]);
    },

    async updateRating(id: number, rating: number) {
        const [result] = await pool.execute(
            `UPDATE barbers SET rating = ((rating * total_ratings) + ?) / (total_ratings + 1), 
                           total_ratings = total_ratings + 1 
       WHERE id = ?`,
            [rating, id],
        );
        return result;
    },
};
