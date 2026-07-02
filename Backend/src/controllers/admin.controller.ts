import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { AppointmentModel } from "../models/appointment.model";
import { BarberModel } from "../models/barber.model";
import { BranchModel } from "../models/branch.model";
import { ClientModel } from "../models/client.model";
import { UserModel } from "../models/user.model";

export const AdminController = {
    async getDashboardStats(req: AuthRequest, res: Response) {
        try {
            const { startDate, endDate } = req.query;

            const stats = await AppointmentModel.getAdminStats(
                new Date(startDate as string),
                new Date(endDate as string),
            );

            const totalBarbers = await BarberModel.findAll();
            const totalClients = await ClientModel.findAll();

            res.json({
                appointments: stats,
                barbers: totalBarbers.length,
                clients: totalClients.length,
            });
        } catch (error) {
            console.error("Get stats error:", error);
            res.status(500).json({ error: "Error al obtener estadísticas" });
        }
    },

    async getAllBarbers(req: AuthRequest, res: Response) {
        try {
            const barbers = await BarberModel.findAll();
            res.json(barbers);
        } catch (error) {
            console.error("Get barbers error:", error);
            res.status(500).json({ error: "Error al obtener barberos" });
        }
    },

    async getAllBranches(req: AuthRequest, res: Response) {
        try {
            const branches = await BranchModel.findAll();
            res.json(branches);
        } catch (error) {
            console.error("Get branches error:", error);
            res.status(500).json({ error: "Error al obtener sedes" });
        }
    },

    async createBranch(req: AuthRequest, res: Response) {
        try {
            const { name, address, phone, email, scheduleInfo, latitude, longitude } = req.body;

            await BranchModel.create({
                name,
                address,
                phone,
                email,
                schedule_info: scheduleInfo,
                latitude,
                longitude,
                is_active: true,
            });

            res.status(201).json({ message: "Sede creada exitosamente" });
        } catch (error) {
            console.error("Create branch error:", error);
            res.status(500).json({ error: "Error al crear sede" });
        }
    },

    async createBarber(req: AuthRequest, res: Response) {
        try {
            const { email, password, fullName, phone, branchId, specialty, experienceYears, bio } = req.body;

            // Crear usuario
            const userResult = await UserModel.create(email, password, fullName, "barber", phone);
            const userId = (userResult as any).insertId;

            // Crear barbero
            await BarberModel.create({
                user_id: userId,
                branch_id: branchId,
                specialty,
                experience_years: experienceYears || 0,
                bio,
                is_active: true,
            });

            res.status(201).json({ message: "Barbero creado exitosamente" });
        } catch (error) {
            console.error("Create barber error:", error);
            res.status(500).json({ error: "Error al crear barbero" });
        }
    },

    async deactivateBarber(req: AuthRequest, res: Response) {
        try {
            const { id } = req.params;

            await BarberModel.deactivate(Number(id));

            res.json({ message: "Barbero desactivado" });
        } catch (error) {
            console.error("Deactivate barber error:", error);
            res.status(500).json({ error: "Error al desactivar barbero" });
        }
    },

    async getAllClients(req: AuthRequest, res: Response) {
        try {
            const clients = await ClientModel.findAll();
            res.json(clients);
        } catch (error) {
            console.error("Get clients error:", error);
            res.status(500).json({ error: "Error al obtener clientes" });
        }
    },
};
