import { ResultSetHeader, RowDataPacket } from "mysql2";
import pool from "../config/db";
import { BarberPhoto } from "../types/photo.types";

export const addPhoto = async (userId: number, url: string, position: number): Promise<number> => {
    const [result] = await pool.query<ResultSetHeader>(
        `INSERT INTO barber_photos (user_id, url, position) VALUES (?, ?, ?)`,
        [userId, url, position],
    );
    return result.insertId;
};

export const findPhotosByUser = async (userId: number): Promise<BarberPhoto[]> => {
    const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT * FROM barber_photos WHERE user_id = ? ORDER BY position`,
        [userId],
    );
    return rows as BarberPhoto[];
};

export const countPhotosByUser = async (userId: number): Promise<number> => {
    const [rows] = await pool.query<RowDataPacket[]>(`SELECT COUNT(*) as total FROM barber_photos WHERE user_id = ?`, [
        userId,
    ]);
    return (rows[0] as any).total;
};

export const deletePhoto = async (id: number, userId: number): Promise<void> => {
    await pool.query(`DELETE FROM barber_photos WHERE id = ? AND user_id = ?`, [id, userId]);
};
