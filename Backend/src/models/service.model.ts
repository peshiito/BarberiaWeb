import { ResultSetHeader, RowDataPacket } from "mysql2";
import pool from "../config/db";
import { Service, ServiceInput, ServiceUpdateInput } from "../types/service.types";

export const createService = async (data: ServiceInput): Promise<number> => {
    const [result] = await pool.query<ResultSetHeader>(
        `INSERT INTO services (name, description, price, duration_minutes, active)
     VALUES (?, ?, ?, ?, ?)`,
        [data.name, data.description || null, data.price, data.duration_minutes, data.active ?? true],
    );
    return result.insertId;
};

export const findAllServices = async (): Promise<Service[]> => {
    const [rows] = await pool.query<RowDataPacket[]>(`SELECT * FROM services ORDER BY name`);
    return rows as Service[];
};

export const findActiveServices = async (): Promise<Service[]> => {
    const [rows] = await pool.query<RowDataPacket[]>(`SELECT * FROM services WHERE active = TRUE ORDER BY name`);
    return rows as Service[];
};

export const findServiceById = async (id: number): Promise<Service | null> => {
    const [rows] = await pool.query<RowDataPacket[]>(`SELECT * FROM services WHERE id = ?`, [id]);
    return rows.length ? (rows[0] as Service) : null;
};

export const updateService = async (id: number, data: ServiceUpdateInput): Promise<void> => {
    const fields: string[] = [];
    const values: unknown[] = [];

    if (data.name !== undefined) {
        fields.push("name = ?");
        values.push(data.name);
    }
    if (data.description !== undefined) {
        fields.push("description = ?");
        values.push(data.description || null);
    }
    if (data.price !== undefined) {
        fields.push("price = ?");
        values.push(data.price);
    }
    if (data.duration_minutes !== undefined) {
        fields.push("duration_minutes = ?");
        values.push(data.duration_minutes);
    }
    if (data.active !== undefined) {
        fields.push("active = ?");
        values.push(data.active);
    }

    if (fields.length === 0) return;

    values.push(id);
    await pool.query(`UPDATE services SET ${fields.join(", ")} WHERE id = ?`, values);
};

export const findServiceIdsByBarber = async (barberId: number): Promise<number[]> => {
    const [rows] = await pool.query<RowDataPacket[]>(`SELECT service_id FROM barber_services WHERE barber_id = ?`, [
        barberId,
    ]);
    return rows.map((r: any) => r.service_id);
};

export const findActiveServicesByBarber = async (barberId: number): Promise<Service[]> => {
    const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT s.* FROM services s
     JOIN barber_services bs ON bs.service_id = s.id
     WHERE bs.barber_id = ? AND s.active = TRUE
     ORDER BY s.name`,
        [barberId],
    );
    return rows as Service[];
};

export const barberOffersService = async (barberId: number, serviceId: number): Promise<boolean> => {
    const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT 1 FROM barber_services WHERE barber_id = ? AND service_id = ? LIMIT 1`,
        [barberId, serviceId],
    );
    return rows.length > 0;
};

// Reemplaza el set completo de servicios que ofrece un barbero (borra +
// inserta) en vez de exponer altas/bajas individuales — coincide con cómo
// lo edita el admin en el dashboard: un multi-select que manda la lista
// final, no deltas.
export const replaceBarberServices = async (barberId: number, serviceIds: number[]): Promise<void> => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        await connection.query(`DELETE FROM barber_services WHERE barber_id = ?`, [barberId]);
        if (serviceIds.length > 0) {
            const values = serviceIds.map(serviceId => [barberId, serviceId]);
            await connection.query(`INSERT INTO barber_services (barber_id, service_id) VALUES ?`, [values]);
        }
        await connection.commit();
    } catch (err) {
        await connection.rollback();
        throw err;
    } finally {
        connection.release();
    }
};
