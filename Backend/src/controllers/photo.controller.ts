import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { addPhoto, countPhotosByUser, deletePhoto, findPhotosByUser } from "../models/photo.model";

const MAX_PHOTOS = 4;

export const uploadPhoto = async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;

    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }

    const current = await countPhotosByUser(userId);
    if (current >= MAX_PHOTOS) {
        return res.status(409).json({ error: `Maximum ${MAX_PHOTOS} photos allowed` });
    }

    const url = `/uploads/${req.file.filename}`;
    const id = await addPhoto(userId, url, current);

    return res.status(201).json({ id, url });
};

export const getMyPhotos = async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const photos = await findPhotosByUser(userId);
    return res.json(photos);
};

export const removePhoto = async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const { id } = req.params;
    await deletePhoto(Number(id), userId);
    return res.json({ message: "Photo deleted" });
};
