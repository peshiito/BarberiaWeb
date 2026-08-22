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
    service_ids: number[];
}

// Un barbero puede tener N fotos y N servicios asignados a la vez — cruzar
// ambos joins en una sola query duplicaría filas (producto cartesiano de
// fotos x servicios), así que el join a barber_services va aparte y se
// mergea en memoria por barbero, igual que ya se hace con las fotos.
export const findPublicBarbers = async (): Promise<PublicBarber[]> => {
    const [photoRows] = await pool.query<PublicBarberRow[]>(
        `SELECT u.id, u.first_name, u.last_name, u.bio, bp.url as photo_url
     FROM users u
     LEFT JOIN barber_photos bp ON bp.user_id = u.id
     WHERE u.role IN ('barber', 'admin_barber')
     ORDER BY u.id, bp.position`,
    );

    const [serviceRows] = await pool.query<RowDataPacket[]>(
        `SELECT barber_id, service_id FROM barber_services`,
    );
    const serviceIdsByBarber = new Map<number, number[]>();
    for (const row of serviceRows as { barber_id: number; service_id: number }[]) {
        const list = serviceIdsByBarber.get(row.barber_id) || [];
        list.push(row.service_id);
        serviceIdsByBarber.set(row.barber_id, list);
    }

    const barbersMap = new Map<number, PublicBarber>();

    for (const row of photoRows) {
        if (!barbersMap.has(row.id)) {
            barbersMap.set(row.id, {
                id: row.id,
                first_name: row.first_name,
                last_name: row.last_name,
                bio: row.bio,
                photos: [],
                service_ids: serviceIdsByBarber.get(row.id) || [],
            });
        }
        if (row.photo_url) {
            barbersMap.get(row.id)!.photos.push(row.photo_url);
        }
    }

    return Array.from(barbersMap.values());
};
