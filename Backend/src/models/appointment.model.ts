import { ResultSetHeader, RowDataPacket } from "mysql2";
import pool from "../config/db";
import { Appointment, AppointmentInput } from "../types/appointment.types";

export interface AppointmentWithClient extends Appointment {
    client_first_name: string;
    client_last_name: string;
    client_phone: string;
}

export const createAppointment = async (data: AppointmentInput): Promise<number> => {
    const [result] = await pool.query<ResultSetHeader>(
        `INSERT INTO appointments (client_id, barber_id, schedule_id, date, time, price)
     VALUES (?, ?, ?, ?, ?, ?)`,
        [data.client_id, data.barber_id, data.schedule_id, data.date, data.time, data.price],
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

export const completeAppointmentById = async (id: number): Promise<void> => {
    await pool.query(`UPDATE appointments SET status = 'completed' WHERE id = ?`, [id]);
};

export const findAppointmentsByClient = async (clientId: number): Promise<Appointment[]> => {
    const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT * FROM appointments WHERE client_id = ? ORDER BY date DESC, time DESC`,
        [clientId],
    );
    return rows as Appointment[];
};

export const findAppointmentsByBarberAndWeekPaginated = async (
    barberId: number,
    weekStart: string,
    weekEnd: string,
    limit: number,
    offset: number,
): Promise<{ appointments: AppointmentWithClient[]; total: number }> => {
    const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT a.*, c.first_name as client_first_name, c.last_name as client_last_name, c.phone as client_phone
     FROM appointments a
     JOIN clients c ON c.id = a.client_id
     WHERE a.barber_id = ? AND a.date BETWEEN ? AND ? AND a.status IN ('active', 'completed')
     ORDER BY a.date, a.time
     LIMIT ? OFFSET ?`,
        [barberId, weekStart, weekEnd, limit, offset],
    );
    const [countRows] = await pool.query<RowDataPacket[]>(
        `SELECT COUNT(*) as total FROM appointments
     WHERE barber_id = ? AND date BETWEEN ? AND ? AND status IN ('active', 'completed')`,
        [barberId, weekStart, weekEnd],
    );
    return {
        appointments: rows as AppointmentWithClient[],
        total: (countRows[0] as any).total,
    };
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

export const cancelAppointmentByBarber = async (id: number, barberId: number): Promise<boolean> => {
    const [result] = await pool.query<ResultSetHeader>(
        `UPDATE appointments SET status = 'cancelled' WHERE id = ? AND barber_id = ? AND status = 'active'`,
        [id, barberId],
    );
    return result.affectedRows > 0;
};
