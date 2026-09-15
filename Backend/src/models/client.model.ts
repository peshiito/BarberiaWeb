import { ResultSetHeader, RowDataPacket } from "mysql2";
import pool from "../config/db";
import { Client, ClientInput, ClientUpdateInput } from "../types/client.types";

export const createClient = async (data: ClientInput): Promise<number> => {
    const [result] = await pool.query<ResultSetHeader>(
        `INSERT INTO clients (first_name, last_name, phone, notes) VALUES (?, ?, ?, ?)`,
        [data.first_name, data.last_name, data.phone, data.notes?.trim() || null],
    );
    return result.insertId;
};

export const findClientByPhone = async (phone: string): Promise<Client | null> => {
    const [rows] = await pool.query<RowDataPacket[]>(`SELECT * FROM clients WHERE phone = ?`, [phone]);
    return rows.length ? (rows[0] as Client) : null;
};

export const findClientById = async (id: number): Promise<Client | null> => {
    const [rows] = await pool.query<RowDataPacket[]>(`SELECT * FROM clients WHERE id = ?`, [id]);
    return rows.length ? (rows[0] as Client) : null;
};

export const findOrCreateClient = async (data: ClientInput): Promise<{ client: Client; created: boolean }> => {
    const existing = await findClientByPhone(data.phone);
    if (existing) {
        return { client: existing, created: false };
    }

    const id = await createClient(data);
    const client = await findClientById(id);
    return { client: client as Client, created: true };
};

// Estadísticas de visitas completadas por cliente para el directorio y el
// buscador. Con barberId se limitan a los turnos de ese barbero, igual que
// el historial: un barbero no ve lo que otro le cobró al cliente.
const clientStatsSelect = (barberId?: number) => {
    const scope = barberId ? "AND a.barber_id = ?" : "";
    const scopeLast = barberId ? "AND a2.barber_id = ?" : "";
    return {
        sql: `SELECT c.*,
       COALESCE(st.completed_visits, 0) AS completed_visits,
       st.last_visit,
       COALESCE(st.total_spent, 0) AS total_spent,
       (SELECT s.name FROM appointments a2 LEFT JOIN services s ON s.id = a2.service_id
         WHERE a2.client_id = c.id AND a2.status = 'completed' ${scopeLast}
         ORDER BY a2.date DESC, a2.time DESC LIMIT 1) AS last_service_name
     FROM clients c
     LEFT JOIN (
       SELECT a.client_id, COUNT(*) AS completed_visits, MAX(a.date) AS last_visit, SUM(a.price) AS total_spent
       FROM appointments a
       WHERE a.status = 'completed' ${scope}
       GROUP BY a.client_id
     ) st ON st.client_id = c.id`,
        params: barberId ? [barberId, barberId] : [],
    };
};

export const listClientsPaginated = async (
    limit: number,
    offset: number,
    barberId?: number,
): Promise<{ clients: Client[]; total: number }> => {
    const stats = clientStatsSelect(barberId);
    const [rows] = await pool.query<RowDataPacket[]>(`${stats.sql} ORDER BY c.id DESC LIMIT ? OFFSET ?`, [
        ...stats.params,
        limit,
        offset,
    ]);
    const [countRows] = await pool.query<RowDataPacket[]>(`SELECT COUNT(*) as total FROM clients`);
    return { clients: rows as Client[], total: (countRows[0] as any).total };
};

export const searchClientsPaginated = async (
    query: string,
    limit: number,
    offset: number,
    barberId?: number,
): Promise<{ clients: Client[]; total: number }> => {
    const stats = clientStatsSelect(barberId);
    // CONCAT_WS: sin esto, buscar el nombre completo ("Juan Perez") no
    // coincidía con ninguna columna por separado y no devolvía nada.
    const like = `%${query.trim().replace(/\s+/g, " ")}%`;
    const [rows] = await pool.query<RowDataPacket[]>(
        `${stats.sql}
     WHERE c.phone LIKE ? OR c.first_name LIKE ? OR c.last_name LIKE ? OR CONCAT_WS(' ', c.first_name, c.last_name) LIKE ?
     ORDER BY c.id DESC LIMIT ? OFFSET ?`,
        [...stats.params, like, like, like, like, limit, offset],
    );
    const [countRows] = await pool.query<RowDataPacket[]>(
        `SELECT COUNT(*) as total FROM clients
     WHERE phone LIKE ? OR first_name LIKE ? OR last_name LIKE ? OR CONCAT_WS(' ', first_name, last_name) LIKE ?`,
        [like, like, like, like],
    );
    return { clients: rows as Client[], total: (countRows[0] as any).total };
};

export const updateClient = async (id: number, data: ClientUpdateInput): Promise<void> => {
    const fields: string[] = [];
    const values: (string | number)[] = [];

    if (data.first_name !== undefined) {
        fields.push("first_name = ?");
        values.push(data.first_name);
    }
    if (data.last_name !== undefined) {
        fields.push("last_name = ?");
        values.push(data.last_name);
    }
    if (data.phone !== undefined) {
        fields.push("phone = ?");
        values.push(data.phone);
    }
    if (data.notes !== undefined) {
        fields.push("notes = ?");
        values.push(data.notes);
    }

    if (!fields.length) {
        return;
    }

    values.push(id);
    await pool.query(`UPDATE clients SET ${fields.join(", ")} WHERE id = ?`, values);
};

