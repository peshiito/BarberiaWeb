import { ResultSetHeader, RowDataPacket } from "mysql2";
import pool from "../config/db";
import { Client, ClientInput } from "../types/client.types";

export const createClient = async (data: ClientInput): Promise<number> => {
    const [result] = await pool.query<ResultSetHeader>(
        `INSERT INTO clients (first_name, last_name, phone) VALUES (?, ?, ?)`,
        [data.first_name, data.last_name, data.phone],
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
