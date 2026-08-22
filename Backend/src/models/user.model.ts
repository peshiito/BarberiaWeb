import { ResultSetHeader, RowDataPacket } from "mysql2";
import pool from "../config/db";
import { Role, User, UserInput } from "../types/user.types";

export const createUser = async (data: UserInput): Promise<number> => {
    const [result] = await pool.query<ResultSetHeader>(
        `INSERT INTO users
      (first_name, last_name, email, password_hash, role, bio, earnings_split_percentage,
       phone, specialties, social_media, birth_date, address)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            data.first_name,
            data.last_name,
            data.email,
            data.password_hash,
            data.role,
            data.bio || null,
            data.earnings_split_percentage || 50,
            data.phone || null,
            data.specialties?.length ? data.specialties.join(",") : null,
            data.social_media || null,
            data.birth_date || null,
            data.address || null,
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

export const updateUserProfileDetails = async (
    userId: number,
    data: { first_name: string; last_name: string },
): Promise<void> => {
    await pool.query(`UPDATE users SET first_name = ?, last_name = ? WHERE id = ?`, [
        data.first_name,
        data.last_name,
        userId,
    ]);
};

export const updateBarberByAdmin = async (
    userId: number,
    data: {
        first_name?: string;
        last_name?: string;
        bio?: string;
        role?: Role;
        earnings_split_percentage?: number;
        phone?: string;
        specialties?: string[];
        social_media?: string;
        birth_date?: string;
        address?: string;
    },
): Promise<void> => {
    const fields: string[] = [];
    const values: unknown[] = [];

    if (data.first_name !== undefined) {
        fields.push("first_name = ?");
        values.push(data.first_name);
    }
    if (data.last_name !== undefined) {
        fields.push("last_name = ?");
        values.push(data.last_name);
    }
    if (data.bio !== undefined) {
        fields.push("bio = ?");
        values.push(data.bio || null);
    }
    if (data.role !== undefined) {
        fields.push("role = ?");
        values.push(data.role);
    }
    if (data.earnings_split_percentage !== undefined) {
        fields.push("earnings_split_percentage = ?");
        values.push(data.earnings_split_percentage);
    }
    if (data.phone !== undefined) {
        fields.push("phone = ?");
        values.push(data.phone || null);
    }
    if (data.specialties !== undefined) {
        fields.push("specialties = ?");
        values.push(data.specialties.length ? data.specialties.join(",") : null);
    }
    if (data.social_media !== undefined) {
        fields.push("social_media = ?");
        values.push(data.social_media || null);
    }
    if (data.birth_date !== undefined) {
        fields.push("birth_date = ?");
        values.push(data.birth_date || null);
    }
    if (data.address !== undefined) {
        fields.push("address = ?");
        values.push(data.address || null);
    }

    if (fields.length === 0) return;

    values.push(userId);
    await pool.query(`UPDATE users SET ${fields.join(", ")} WHERE id = ?`, values);
};

export const updateUserPassword = async (userId: number, passwordHash: string): Promise<void> => {
    await pool.query(`UPDATE users SET password_hash = ? WHERE id = ?`, [passwordHash, userId]);
};
