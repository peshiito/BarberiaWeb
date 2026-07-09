import { Request, Response } from "express";
import { findPhotosByUser } from "../models/photo.model";
import { listUsers } from "../models/user.model";

export const getPublicBarbers = async (_req: Request, res: Response) => {
    const users = await listUsers();
    const barbers = users.filter(u => u.role === "barber" || u.role === "admin_barber");

    const result = await Promise.all(
        barbers.map(async b => {
            const photos = await findPhotosByUser(b.id);
            return {
                id: b.id,
                first_name: b.first_name,
                last_name: b.last_name,
                bio: b.bio,
                photos: photos.map(p => p.url),
            };
        }),
    );

    return res.json(result);
};
