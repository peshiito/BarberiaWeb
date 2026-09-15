import { ResultSetHeader, RowDataPacket } from "mysql2";
import pool from "../config/db";
import { Appointment, AppointmentInput } from "../types/appointment.types";
import { PaymentMethod } from "../types/finance.types";

export interface AppointmentWithClient extends Appointment {
    client_first_name: string;
    client_last_name: string;
    client_phone: string;
    service_name: string | null;
}

export interface AppointmentWithService extends Appointment {
    service_name: string | null;
}

// Explicit column list (not `SELECT *`) so the two internal generated
// columns used to enforce slot/day uniqueness at the DB level
// (active_slot_key, active_client_day_key — see db/init.sql) never leak
// into API responses and change the existing response shape.
const APPOINTMENT_COLUMN_LIST = [
    "id",
    "client_id",
    "barber_id",
    "schedule_id",
    "service_id",
    "date",
    "time",
    "status",
    "created_at",
    "price",
    "note",
    "payment_method",
    "completed_at",
];
const APPOINTMENT_COLUMNS = APPOINTMENT_COLUMN_LIST.join(", ");
const APPOINTMENT_COLUMNS_PREFIXED = APPOINTMENT_COLUMN_LIST.map(c => `a.${c}`).join(", ");

export const createAppointment = async (data: AppointmentInput): Promise<number> => {
    const [result] = await pool.query<ResultSetHeader>(
        `INSERT INTO appointments (client_id, barber_id, schedule_id, service_id, date, time, price, note)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            data.client_id,
            data.barber_id,
            data.schedule_id,
            data.service_id,
            data.date,
            data.time,
            data.price,
            data.note ?? null,
        ],
    );
    return result.insertId;
};

export const findActiveAppointmentByClientAndDate = async (
    clientId: number,
    date: string,
): Promise<Appointment | null> => {
    const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT ${APPOINTMENT_COLUMNS} FROM appointments WHERE client_id = ? AND date = ? AND status = 'active'`,
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
        `SELECT ${APPOINTMENT_COLUMNS} FROM appointments WHERE barber_id = ? AND date = ? AND time = ? AND status = 'active'`,
        [barberId, date, time],
    );
    return rows.length ? (rows[0] as Appointment) : null;
};

export const findAppointmentById = async (id: number): Promise<Appointment | null> => {
    const [rows] = await pool.query<RowDataPacket[]>(`SELECT ${APPOINTMENT_COLUMNS} FROM appointments WHERE id = ?`, [
        id,
    ]);
    return rows.length ? (rows[0] as Appointment) : null;
};

export const cancelAppointmentById = async (id: number): Promise<void> => {
    await pool.query(`UPDATE appointments SET status = 'cancelled' WHERE id = ?`, [id]);
};

// Congela el porcentaje del barbero al completar: la liquidación usa este valor
// aunque después se le cambie la comisión.
export const completeAppointmentById = async (id: number, paymentMethod: PaymentMethod | null): Promise<void> => {
    await pool.query(
        `UPDATE appointments a JOIN users u ON u.id = a.barber_id
     SET a.status = 'completed', a.completed_at = NOW(),
       a.barber_split_percentage = u.earnings_split_percentage, a.payment_method = ?
     WHERE a.id = ?`,
        [paymentMethod, id],
    );
};

export const findAppointmentsByClient = async (clientId: number): Promise<AppointmentWithService[]> => {
    const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT ${APPOINTMENT_COLUMNS_PREFIXED}, s.name as service_name
     FROM appointments a
     LEFT JOIN services s ON s.id = a.service_id
     WHERE a.client_id = ? ORDER BY a.date DESC, a.time DESC`,
        [clientId],
    );
    return rows as AppointmentWithService[];
};

export const findAppointmentsByBarberAndWeekPaginated = async (
    barberId: number,
    weekStart: string,
    weekEnd: string,
    limit: number,
    offset: number,
): Promise<{ appointments: AppointmentWithClient[]; total: number }> => {
    const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT ${APPOINTMENT_COLUMNS_PREFIXED}, c.first_name as client_first_name, c.last_name as client_last_name, c.phone as client_phone, s.name as service_name
     FROM appointments a
     JOIN clients c ON c.id = a.client_id
     LEFT JOIN services s ON s.id = a.service_id
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

export const countActiveAppointmentsByClientInWeekExcluding = async (
    clientId: number,
    weekStart: string,
    weekEnd: string,
    excludeId: number,
): Promise<number> => {
    const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT COUNT(*) as total FROM appointments
     WHERE client_id = ? AND date BETWEEN ? AND ? AND status = 'active' AND id != ?`,
        [clientId, weekStart, weekEnd, excludeId],
    );
    return (rows[0] as any).total;
};

export const findAppointmentsByClientAndBarber = async (clientId: number, barberId: number): Promise<Appointment[]> => {
    const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT ${APPOINTMENT_COLUMNS} FROM appointments WHERE client_id = ? AND barber_id = ? ORDER BY date DESC, time DESC`,
        [clientId, barberId],
    );
    return rows as Appointment[];
};

export const updateAppointmentByAdmin = async (
    id: number,
    data: { barber_id: number; schedule_id: number; service_id: number | null; date: string; time: string; price: number },
): Promise<void> => {
    await pool.query(
        `UPDATE appointments SET barber_id = ?, schedule_id = ?, service_id = ?, date = ?, time = ?, price = ? WHERE id = ?`,
        [data.barber_id, data.schedule_id, data.service_id, data.date, data.time, data.price, id],
    );
};

// Horarios ya tomados de un barbero en un rango de fechas (para mostrar
// disponibilidad real en la reserva pública). Solo fecha y hora: sin datos del cliente.
export const findTakenSlotsByBarberBetween = async (
    barberId: number,
    from: string,
    to: string,
): Promise<{ date: string; time: string }[]> => {
    const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT DATE_FORMAT(date, '%Y-%m-%d') AS date, TIME_FORMAT(time, '%H:%i') AS time
     FROM appointments
     WHERE barber_id = ? AND date BETWEEN ? AND ? AND status = 'active'`,
        [barberId, from, to],
    );
    return rows as { date: string; time: string }[];
};
