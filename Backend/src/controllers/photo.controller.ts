import { Response } from "express";
import fs from "fs";
import { getPhotoPath, getPhotoUrl } from "../config/storage";
import { AuthRequest } from "../middlewares/auth.middleware";
import { BarberModel } from "../models/barber.model";
import { BarberPhotoModel } from "../models/barberPhoto.model";

export const PhotoController = {
    async uploadPhoto(req: AuthRequest, res: Response) {
        try {
            if (!req.file) {
                return res.status(400).json({ error: "No se envió ninguna imagen" });
            }

            const { title, description, isProfile } = req.body;

            const barber = await BarberModel.findByUserId(req.userId!);
            if (!barber) {
                return res.status(404).json({ error: "Barbero no encontrado" });
            }

            const photoUrl = getPhotoUrl(req.file.filename);

            const photoResult = await BarberPhotoModel.create({
                barber_id: barber.id,
                photo_url: photoUrl,
                is_profile: isProfile === "true" || false,
                title: title || null,
                description: description || null,
                order_position: 0,
                is_active: true,
            });

            if (isProfile === "true") {
                await BarberPhotoModel.setProfile((photoResult as any).insertId, barber.id);
            }

            res.status(201).json({
                message: "Foto subida exitosamente",
                photo: {
                    id: (photoResult as any).insertId,
                    url: photoUrl,
                    title,
                    description,
                    isProfile: isProfile === "true",
                },
            });
        } catch (error) {
            console.error("Upload photo error:", error);
            res.status(500).json({ error: "Error al subir foto" });
        }
    },

    async getPhotos(req: AuthRequest, res: Response) {
        try {
            const barber = await BarberModel.findByUserId(req.userId!);
            if (!barber) {
                return res.status(404).json({ error: "Barbero no encontrado" });
            }

            const photos = await BarberPhotoModel.findByBarberId(barber.id);
            res.json(photos);
        } catch (error) {
            console.error("Get photos error:", error);
            res.status(500).json({ error: "Error al obtener fotos" });
        }
    },

    async deletePhoto(req: AuthRequest, res: Response) {
        try {
            const { id } = req.params;

            const photo = await BarberPhotoModel.findById(Number(id));
            if (!photo) {
                return res.status(404).json({ error: "Foto no encontrada" });
            }

            // Eliminar archivo físico
            const photoPath = getPhotoPath(photo.photo_url.split("/").pop()!);
            if (fs.existsSync(photoPath)) {
                fs.unlinkSync(photoPath);
            }

            await BarberPhotoModel.delete(Number(id));

            res.json({ message: "Foto eliminada" });
        } catch (error) {
            console.error("Delete photo error:", error);
            res.status(500).json({ error: "Error al eliminar foto" });
        }
    },

    async setProfilePhoto(req: AuthRequest, res: Response) {
        try {
            const { id } = req.params;

            const barber = await BarberModel.findByUserId(req.userId!);
            if (!barber) {
                return res.status(404).json({ error: "Barbero no encontrado" });
            }

            await BarberPhotoModel.setProfile(Number(id), barber.id);

            res.json({ message: "Foto de perfil actualizada" });
        } catch (error) {
            console.error("Set profile photo error:", error);
            res.status(500).json({ error: "Error al establecer foto de perfil" });
        }
    },
};
