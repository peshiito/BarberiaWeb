import { ResultSetHeader, RowDataPacket } from "mysql2";
import pool from "../config/db";
import { User, UserInput } from "../types/user.types";

export const createUser = async (data: UserInput): Promise<number> => {
    const [result] = await pool.query<ResultSetHeader>(
        `INSERT INTO users (first_name, last_name, email, password_hash, role, bio)
     VALUES (?, ?, ?, ?, ?, ?)`,
        [data.first_name, data.last_name, data.email, data.password_hash, data.role, data.bio || null],
    );
    return result.insertId;
};

export const findByEmail = async (email: string): Promise<User | null> => {
    const [rows] = await pool.query<RowDataPacket[]>(`SELECT * FROM users WHERE email = ?`, [email]);
    return rows.length ? (rows[0] as User) : null;
};

export const findById = async (id: number): Promise<User | null> => {
    const [rows] = await pool.query<RowDataPacket[]>(`SELECT * FROM users WHERE id = ?`, [id]);
    return rows.length ? (rows[0] as User) : null;
};

export const listUsers = async (): Promise<User[]> => {
    const [rows] = await pool.query<RowDataPacket[]>(`SELECT * FROM users`);
    return rows as User[];
};
