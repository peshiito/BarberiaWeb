import fs from "fs";
import path from "path";
import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { addPhoto, countPhotosByUser, deletePhoto, findPhotoByIdAndUser, findPhotosByUser } from "../models/photo.model";
import { hasValidImageSignature } from "../utils/fileSignature";
import { parsePositiveIntParam } from "../utils/validators";

const MAX_PHOTOS = 4;

export const uploadPhoto = async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;

    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }

    const ext = path.extname(req.file.filename);
    if (!hasValidImageSignature(req.file.path, ext)) {
        fs.unlink(req.file.path, () => {});
        return res.status(400).json({ error: "Invalid file type" });
    }

    const current = await countPhotosByUser(userId);
    if (current >= MAX_PHOTOS) {
        fs.unlink(req.file.path, () => {});
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
    const photoId = parsePositiveIntParam(req.params.id);
    if (photoId === null) {
        return res.status(400).json({ error: "Invalid photo id" });
    }

    const photo = await findPhotoByIdAndUser(photoId, userId);
    if (!photo) {
        return res.status(404).json({ error: "Photo not found" });
    }

    await deletePhoto(photoId, userId);
    // The DB row is the source of truth for what "deleted" means to the API;
    // without this the file stays on disk and publicly reachable at its old
    // /uploads URL forever, despite the API reporting it as deleted
    // (confirmed live during the 2026-08-10 audit).
    fs.unlink(path.join(__dirname, "..", "uploads", path.basename(photo.url)), () => {});

    return res.json({ message: "Photo deleted" });
};
