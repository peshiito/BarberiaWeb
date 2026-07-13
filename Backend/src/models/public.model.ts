import { RowDataPacket } from "mysql2";
import pool from "../config/db";

interface PublicBarberRow extends RowDataPacket {
    id: number;
    first_name: string;
    last_name: string;
    bio: string | null;
    photo_url: string | null;
}

export interface PublicBarber {
    id: number;
    first_name: string;
    last_name: string;
    bio: string | null;
    photos: string[];
}

export const findPublicBarbers = async (): Promise<PublicBarber[]> => {
    const [rows] = await pool.query<PublicBarberRow[]>(
        `SELECT u.id, u.first_name, u.last_name, u.bio, bp.url as photo_url
     FROM users u
     LEFT JOIN barber_photos bp ON bp.user_id = u.id
     WHERE u.role IN ('barber', 'admin_barber')
     ORDER BY u.id, bp.position`,
    );

    const barbersMap = new Map<number, PublicBarber>();

    for (const row of rows) {
        if (!barbersMap.has(row.id)) {
            barbersMap.set(row.id, {
                id: row.id,
                first_name: row.first_name,
                last_name: row.last_name,
                bio: row.bio,
                photos: [],
            });
        }
        if (row.photo_url) {
            barbersMap.get(row.id)!.photos.push(row.photo_url);
        }
    }

    return Array.from(barbersMap.values());
};
