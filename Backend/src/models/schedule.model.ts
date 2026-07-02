import pool from "../config/db";

export interface Schedule {
    id: number;
    barber_id: number;
    branch_id: number;
    week_start_date: Date;
    week_end_date: Date;
    start_time: string;
    end_time: string;
    slot_interval: number;
    break_start: string | null;
    break_end: string | null;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
}

export const ScheduleModel = {
    async create(data: Omit<Schedule, "id" | "created_at" | "updated_at">) {
        const [result] = await pool.execute(
            `INSERT INTO schedules 
       (barber_id, branch_id, week_start_date, week_end_date, start_time, end_time, slot_interval, break_start, break_end) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                data.barber_id,
                data.branch_id,
                data.week_start_date,
                data.week_end_date,
                data.start_time,
                data.end_time,
                data.slot_interval,
                data.break_start || null,
                data.break_end || null,
            ],
        );
        return result;
    },

    async findByBarberAndWeek(barberId: number, weekStartDate: Date) {
        const [rows] = await pool.execute(
            "SELECT * FROM schedules WHERE barber_id = ? AND week_start_date = ? AND is_active = TRUE",
            [barberId, weekStartDate],
        );
        return (rows as Schedule[])[0];
    },

    async getCurrentWeekSchedule(barberId: number) {
        const [rows] = await pool.execute(
            `SELECT * FROM schedules 
       WHERE barber_id = ? 
       AND week_start_date <= CURDATE() 
       AND week_end_date >= CURDATE() 
       AND is_active = TRUE 
       ORDER BY created_at DESC LIMIT 1`,
            [barberId],
        );
        return (rows as Schedule[])[0];
    },

    async findByBarber(barberId: number) {
        const [rows] = await pool.execute(
            "SELECT * FROM schedules WHERE barber_id = ? AND is_active = TRUE ORDER BY week_start_date DESC",
            [barberId],
        );
        return rows as Schedule[];
    },

    async deactivate(id: number) {
        await pool.execute("UPDATE schedules SET is_active = FALSE WHERE id = ?", [id]);
    },

    async deactivateAllByBarber(barberId: number) {
        await pool.execute("UPDATE schedules SET is_active = FALSE WHERE barber_id = ?", [barberId]);
    },
};
