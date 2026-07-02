import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { AppointmentModel } from "../models/appointment.model";
import { BarberModel } from "../models/barber.model";
import { BarberServiceModel } from "../models/barberService.model";
import { ScheduleModel } from "../models/schedule.model";
import { ScheduleDayModel } from "../models/scheduleDay.model";

export const BarberController = {
    async getMyProfile(req: AuthRequest, res: Response) {
        try {
            const barber = await BarberModel.findByUserId(req.userId!);
            if (!barber) {
                return res.status(404).json({ error: "Barbero no encontrado" });
            }

            res.json(barber);
        } catch (error) {
            console.error("Get profile error:", error);
            res.status(500).json({ error: "Error al obtener perfil" });
        }
    },

    async getMySchedule(req: AuthRequest, res: Response) {
        try {
            const barber = await BarberModel.findByUserId(req.userId!);
            if (!barber) {
                return res.status(404).json({ error: "Barbero no encontrado" });
            }

            const schedule = await ScheduleModel.getCurrentWeekSchedule(barber.id);
            if (!schedule) {
                return res.json(null);
            }

            const days = await ScheduleDayModel.findByScheduleId(schedule.id);

            res.json({ ...schedule, days });
        } catch (error) {
            console.error("Get schedule error:", error);
            res.status(500).json({ error: "Error al obtener horarios" });
        }
    },

    async getMyAppointments(req: AuthRequest, res: Response) {
        try {
            const { date } = req.query;
            const barber = await BarberModel.findByUserId(req.userId!);

            if (!barber) {
                return res.status(404).json({ error: "Barbero no encontrado" });
            }

            const appointments = await AppointmentModel.findByBarberAndDate(barber.id, new Date(date as string));

            res.json(appointments);
        } catch (error) {
            console.error("Get appointments error:", error);
            res.status(500).json({ error: "Error al obtener turnos" });
        }
    },

    async getMyServices(req: AuthRequest, res: Response) {
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

    async completeAppointment(req: AuthRequest, res: Response) {
        try {
            const { id } = req.params;

            await AppointmentModel.complete(Number(id));
            res.json({ message: "Turno completado" });
        } catch (error) {
            console.error("Complete appointment error:", error);
            res.status(500).json({ error: "Error al completar turno" });
        }
    },

    async noShowAppointment(req: AuthRequest, res: Response) {
        try {
            const { id } = req.params;

            await AppointmentModel.noShow(Number(id));
            res.json({ message: "Turno marcado como no asistió" });
        } catch (error) {
            console.error("No-show appointment error:", error);
            res.status(500).json({ error: "Error al marcar no asistió" });
        }
    },
};
