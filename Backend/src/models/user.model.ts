import { ResultSetHeader, RowDataPacket } from "mysql2";
import pool from "../config/db";
import { User, UserInput } from "../types/user.types";

export const createUser = async (data: UserInput): Promise<number> => {
    const [result] = await pool.query<ResultSetHeader>(
        `INSERT INTO users (first_name, last_name, email, password_hash, role, bio, service_price, earnings_split_percentage)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            data.first_name,
            data.last_name,
            data.email,
            data.password_hash,
            data.role,
            data.bio || null,
            data.service_price || 0,
            data.earnings_split_percentage || 50,
        ],
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

export const listUsersPaginated = async (limit: number, offset: number): Promise<{ users: User[]; total: number }> => {
    const [rows] = await pool.query<RowDataPacket[]>(`SELECT * FROM users ORDER BY id LIMIT ? OFFSET ?`, [
        limit,
        offset,
    ]);
    const [countRows] = await pool.query<RowDataPacket[]>(`SELECT COUNT(*) as total FROM users`);
    return { users: rows as User[], total: (countRows[0] as any).total };
};

export const updateUserBio = async (userId: number, bio: string): Promise<void> => {
    await pool.query(`UPDATE users SET bio = ? WHERE id = ?`, [bio, userId]);
};
