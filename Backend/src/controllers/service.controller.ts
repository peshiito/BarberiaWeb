import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { BarberModel } from "../models/barber.model";
import { BarberServiceModel } from "../models/barberService.model";

export const ServiceController = {
    async createService(req: AuthRequest, res: Response) {
        try {
            const { name, description, duration, price } = req.body;

            const barber = await BarberModel.findByUserId(req.userId!);
            if (!barber) {
                return res.status(404).json({ error: "Barbero no encontrado" });
            }

            await BarberServiceModel.create({
                barber_id: barber.id,
                name,
                description: description || null,
                duration,
                price,
                is_active: true,
            });

            res.status(201).json({ message: "Servicio creado exitosamente" });
        } catch (error) {
            console.error("Create service error:", error);
            res.status(500).json({ error: "Error al crear servicio" });
        }
    },

    async updateService(req: AuthRequest, res: Response) {
        try {
            const { id } = req.params;
            const { name, description, duration, price } = req.body;

            await BarberServiceModel.update(Number(id), {
                name,
                description,
                duration,
                price,
            });

            res.json({ message: "Servicio actualizado" });
        } catch (error) {
            console.error("Update service error:", error);
            res.status(500).json({ error: "Error al actualizar servicio" });
        }
    },

    async deleteService(req: AuthRequest, res: Response) {
        try {
            const { id } = req.params;

            await BarberServiceModel.deactivate(Number(id));

            res.json({ message: "Servicio eliminado" });
        } catch (error) {
            console.error("Delete service error:", error);
            res.status(500).json({ error: "Error al eliminar servicio" });
        }
    },

    async getServices(req: AuthRequest, res: Response) {
        try {
            const barber = await BarberModel.findByUserId(req.userId!);
            if (!barber) {
                return res.status(404).json({ error: "Barbero no encontrado" });
            }

            const services = await BarberServiceModel.findByBarberId(barber.id);
            res.json(services);
        } catch (error) {
            console.error("Get services error:", error);
            res.status(500).json({ error: "Error al obtener servicios" });
        }
    },
};
