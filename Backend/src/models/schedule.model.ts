import { ResultSetHeader, RowDataPacket } from "mysql2";
import pool from "../config/db";
import { Schedule, ScheduleInput } from "../types/schedule.types";

export const createSchedule = async (data: ScheduleInput): Promise<number> => {
    const [result] = await pool.query<ResultSetHeader>(
        `INSERT INTO schedules (barber_id, week_start, work_days, start_time, end_time, slot_duration_minutes)
     VALUES (?, ?, ?, ?, ?, ?)`,
        [data.barber_id, data.week_start, data.work_days, data.start_time, data.end_time, data.slot_duration_minutes],
    );
    return result.insertId;
};

export const findScheduleById = async (id: number): Promise<Schedule | null> => {
    const [rows] = await pool.query<RowDataPacket[]>(`SELECT * FROM schedules WHERE id = ?`, [id]);
    return rows.length ? (rows[0] as Schedule) : null;
};

export const findSchedulesByBarber = async (barberId: number): Promise<Schedule[]> => {
    const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT * FROM schedules WHERE barber_id = ? ORDER BY week_start DESC`,
        [barberId],
    );
    return rows as Schedule[];
};

export const findScheduleByBarberAndWeek = async (barberId: number, weekStart: string): Promise<Schedule | null> => {
    const [rows] = await pool.query<RowDataPacket[]>(`SELECT * FROM schedules WHERE barber_id = ? AND week_start = ?`, [
        barberId,
        weekStart,
    ]);
    return rows.length ? (rows[0] as Schedule) : null;
};
