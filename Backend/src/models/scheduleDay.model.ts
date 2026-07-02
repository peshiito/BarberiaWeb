import pool from "../config/db";

export interface ScheduleDay {
    id: number;
    schedule_id: number;
    day_of_week: number;
    is_working: boolean;
    custom_start_time: string | null;
    custom_end_time: string | null;
    notes: string | null;
    created_at: Date;
    updated_at: Date;
}

export const ScheduleDayModel = {
    async create(data: Omit<ScheduleDay, "id" | "created_at" | "updated_at">) {
        const [result] = await pool.execute(
            `INSERT INTO schedule_days (schedule_id, day_of_week, is_working, custom_start_time, custom_end_time, notes) 
       VALUES (?, ?, ?, ?, ?, ?)`,
            [
                data.schedule_id,
                data.day_of_week,
                data.is_working,
                data.custom_start_time || null,
                data.custom_end_time || null,
                data.notes || null,
            ],
        );
        return result;
    },

    async findByScheduleId(scheduleId: number) {
        const [rows] = await pool.execute("SELECT * FROM schedule_days WHERE schedule_id = ? ORDER BY day_of_week", [
            scheduleId,
        ]);
        return rows as ScheduleDay[];
    },

    async updateDay(
        scheduleId: number,
        dayOfWeek: number,
        data: Partial<Omit<ScheduleDay, "id" | "schedule_id" | "created_at" | "updated_at">>,
    ) {
        const [result] = await pool.execute(
            `UPDATE schedule_days SET is_working = COALESCE(?, is_working), 
                                 custom_start_time = COALESCE(?, custom_start_time), 
                                 custom_end_time = COALESCE(?, custom_end_time), 
                                 notes = COALESCE(?, notes) 
       WHERE schedule_id = ? AND day_of_week = ?`,
            [
                data.is_working !== undefined ? data.is_working : null,
                data.custom_start_time || null,
                data.custom_end_time || null,
                data.notes || null,
                scheduleId,
                dayOfWeek,
            ],
        );
        return result;
    },
};
