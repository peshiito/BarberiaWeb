import { ResultSetHeader, RowDataPacket } from "mysql2";
import pool from "../config/db";
import { Appointment, AppointmentInput } from "../types/appointment.types";

export const createAppointment = async (data: AppointmentInput): Promise<number> => {
    const [result] = await pool.query<ResultSetHeader>(
        `INSERT INTO appointments (client_id, barber_id, schedule_id, date, time)
     VALUES (?, ?, ?, ?, ?)`,
        [data.client_id, data.barber_id, data.schedule_id, data.date, data.time],
    );
    return result.insertId;
};

export const findActiveAppointmentByClientAndDate = async (
    clientId: number,
    date: string,
): Promise<Appointment | null> => {
    const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT * FROM appointments WHERE client_id = ? AND date = ? AND status = 'active'`,
        [clientId, date],
    );
    return rows.length ? (rows[0] as Appointment) : null;
};

export const findActiveAppointmentBySlot = async (
    barberId: number,
    date: string,
    time: string,
): Promise<Appointment | null> => {
    const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT * FROM appointments WHERE barber_id = ? AND date = ? AND time = ? AND status = 'active'`,
        [barberId, date, time],
    );
    return rows.length ? (rows[0] as Appointment) : null;
};

export const findAppointmentById = async (id: number): Promise<Appointment | null> => {
    const [rows] = await pool.query<RowDataPacket[]>(`SELECT * FROM appointments WHERE id = ?`, [id]);
    return rows.length ? (rows[0] as Appointment) : null;
};

export const cancelAppointmentById = async (id: number): Promise<void> => {
    await pool.query(`UPDATE appointments SET status = 'cancelled' WHERE id = ?`, [id]);
};

export const findAppointmentsByClient = async (clientId: number): Promise<Appointment[]> => {
    const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT * FROM appointments WHERE client_id = ? ORDER BY date DESC, time DESC`,
        [clientId],
    );
    return rows as Appointment[];
};

export const findAppointmentsByBarberAndWeek = async (
    barberId: number,
    weekStart: string,
    weekEnd: string,
): Promise<Appointment[]> => {
    const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT * FROM appointments
     WHERE barber_id = ? AND date BETWEEN ? AND ? AND status = 'active'
     ORDER BY date, time`,
        [barberId, weekStart, weekEnd],
    );
    return rows as Appointment[];
};
export const countActiveAppointmentsByClientInWeek = async (
    clientId: number,
    weekStart: string,
    weekEnd: string,
): Promise<number> => {
    const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT COUNT(*) as total FROM appointments
     WHERE client_id = ? AND date BETWEEN ? AND ? AND status = 'active'`,
        [clientId, weekStart, weekEnd],
    );
    return (rows[0] as any).total;
};
