import pool from "../config/db";

export interface Appointment {
    id: number;
    barber_id: number;
    branch_id: number;
    client_id: number;
    service_id: number;
    appointment_date: Date;
    appointment_time: string;
    status: "confirmed" | "cancelled_by_client" | "cancelled_by_barber" | "completed" | "no_show";
    notes: string | null;
    reminder_sent: boolean;
    created_at: Date;
    updated_at: Date;
    cancelled_at: Date | null;
    cancelled_reason: string | null;
}

export const AppointmentModel = {
    async create(
        data: Omit<
            Appointment,
            "id" | "created_at" | "updated_at" | "cancelled_at" | "cancelled_reason" | "reminder_sent"
        >,
    ) {
        const [result] = await pool.execute(
            `INSERT INTO appointments 
       (barber_id, branch_id, client_id, service_id, appointment_date, appointment_time, status) 
       VALUES (?, ?, ?, ?, ?, ?, 'confirmed')`,
            [
                data.barber_id,
                data.branch_id,
                data.client_id,
                data.service_id,
                data.appointment_date,
                data.appointment_time,
            ],
        );
        return result;
    },

    async checkAvailability(barberId: number, date: Date, time: string) {
        const [rows] = await pool.execute(
            `SELECT COUNT(*) as count FROM appointments 
       WHERE barber_id = ? AND appointment_date = ? AND appointment_time = ? 
       AND status NOT IN ('cancelled_by_client', 'cancelled_by_barber', 'no_show')`,
            [barberId, date, time],
        );
        return (rows as any[])[0].count === 0;
    },

    async checkClientAppointmentToday(clientId: number, date: Date) {
        const [rows] = await pool.execute(
            `SELECT COUNT(*) as count FROM appointments 
       WHERE client_id = ? AND appointment_date = ? 
       AND status NOT IN ('cancelled_by_client', 'cancelled_by_barber', 'no_show')`,
            [clientId, date],
        );
        return (rows as any[])[0].count === 0;
    },

    async findByBarberAndDate(barberId: number, date: Date) {
        const [rows] = await pool.execute(
            `SELECT a.*, c.full_name as client_name, c.phone as client_phone, c.email as client_email,
              s.name as service_name, s.duration as service_duration
       FROM appointments a
       JOIN clients c ON a.client_id = c.id
       JOIN barber_services s ON a.service_id = s.id
       WHERE a.barber_id = ? AND a.appointment_date = ? 
       AND a.status NOT IN ('cancelled_by_client', 'cancelled_by_barber', 'no_show')
       ORDER BY a.appointment_time`,
            [barberId, date],
        );
        return rows as Appointment[];
    },

    async findByClient(clientId: number, startDate: Date, endDate: Date) {
        const [rows] = await pool.execute(
            `SELECT a.*, b.user_id as barber_user_id, u.full_name as barber_name, br.name as branch_name,
              s.name as service_name, s.duration as service_duration, s.price as service_price
       FROM appointments a
       JOIN barbers b ON a.barber_id = b.id
       JOIN users u ON b.user_id = u.id
       JOIN branches br ON a.branch_id = br.id
       JOIN barber_services s ON a.service_id = s.id
       WHERE a.client_id = ? AND a.appointment_date BETWEEN ? AND ?
       ORDER BY a.appointment_date, a.appointment_time`,
            [clientId, startDate, endDate],
        );
        return rows as Appointment[];
    },

    async cancel(id: number, reason: string, type: "client" | "barber") {
        const status = type === "client" ? "cancelled_by_client" : "cancelled_by_barber";
        const [result] = await pool.execute(
            `UPDATE appointments 
       SET status = ?, cancelled_at = NOW(), cancelled_reason = ? 
       WHERE id = ? AND status NOT IN ('cancelled_by_client', 'cancelled_by_barber', 'completed', 'no_show')`,
            [status, reason, id],
        );
        return result;
    },

    async complete(id: number) {
        const [result] = await pool.execute(
            `UPDATE appointments SET status = 'completed' WHERE id = ? AND status = 'confirmed'`,
            [id],
        );
        return result;
    },

    async noShow(id: number) {
        const [result] = await pool.execute(
            `UPDATE appointments SET status = 'no_show' WHERE id = ? AND status = 'confirmed'`,
            [id],
        );
        return result;
    },

    async getStats(barberId: number, startDate: Date, endDate: Date) {
        const [rows] = await pool.execute(
            `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'cancelled_by_client' THEN 1 ELSE 0 END) as cancelled_by_client,
        SUM(CASE WHEN status = 'cancelled_by_barber' THEN 1 ELSE 0 END) as cancelled_by_barber,
        SUM(CASE WHEN status = 'no_show' THEN 1 ELSE 0 END) as no_show
       FROM appointments
       WHERE barber_id = ? AND appointment_date BETWEEN ? AND ?`,
            [barberId, startDate, endDate],
        );
        return (rows as any[])[0];
    },

    async getAdminStats(startDate: Date, endDate: Date) {
        const [rows] = await pool.execute(
            `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'cancelled_by_client' THEN 1 ELSE 0 END) as cancelled_by_client,
        SUM(CASE WHEN status = 'cancelled_by_barber' THEN 1 ELSE 0 END) as cancelled_by_barber,
        SUM(CASE WHEN status = 'no_show' THEN 1 ELSE 0 END) as no_show
       FROM appointments
       WHERE appointment_date BETWEEN ? AND ?`,
            [startDate, endDate],
        );
        return (rows as any[])[0];
    },

    async findById(id: number) {
        const [rows] = await pool.execute(
            `SELECT a.*, c.full_name as client_name, c.phone as client_phone, c.email as client_email,
              s.name as service_name, s.duration as service_duration, s.price as service_price,
              u.full_name as barber_name
       FROM appointments a
       JOIN clients c ON a.client_id = c.id
       JOIN barber_services s ON a.service_id = s.id
       JOIN barbers b ON a.barber_id = b.id
       JOIN users u ON b.user_id = u.id
       WHERE a.id = ?`,
            [id],
        );
        return (rows as any[])[0];
    },
};
