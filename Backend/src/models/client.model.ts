import { ResultSetHeader, RowDataPacket } from "mysql2";
import pool from "../config/db";
import { Client, ClientInput, ClientUpdateInput } from "../types/client.types";

export const createClient = async (data: ClientInput): Promise<number> => {
    const [result] = await pool.query<ResultSetHeader>(
        `INSERT INTO clients (first_name, last_name, phone, password_hash) VALUES (?, ?, ?, ?)`,
        [data.first_name, data.last_name, data.phone, data.password_hash ?? null],
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

export const listClientsPaginated = async (limit: number, offset: number): Promise<{ clients: Client[]; total: number }> => {
    const [rows] = await pool.query<RowDataPacket[]>(`SELECT * FROM clients ORDER BY id DESC LIMIT ? OFFSET ?`, [
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
): Promise<{ clients: Client[]; total: number }> => {
    const like = `%${query}%`;
    const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT * FROM clients WHERE phone LIKE ? OR first_name LIKE ? OR last_name LIKE ?
     ORDER BY id DESC LIMIT ? OFFSET ?`,
        [like, like, like, limit, offset],
    );
    const [countRows] = await pool.query<RowDataPacket[]>(
        `SELECT COUNT(*) as total FROM clients WHERE phone LIKE ? OR first_name LIKE ? OR last_name LIKE ?`,
        [like, like, like],
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

export const updateClientPassword = async (id: number, passwordHash: string): Promise<void> => {
    await pool.query(`UPDATE clients SET password_hash = ? WHERE id = ?`, [passwordHash, id]);
};

export const setClientPhoto = async (id: number, photoUrl: string): Promise<void> => {
    await pool.query(`UPDATE clients SET photo_url = ? WHERE id = ?`, [photoUrl, id]);
};
