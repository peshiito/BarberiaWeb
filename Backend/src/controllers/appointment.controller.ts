// backend/src/controllers/appointment.controller.ts
import { Request, Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { AppointmentModel } from "../models/appointment.model";
import { BarberModel } from "../models/barber.model";
import { BarberServiceModel } from "../models/barberService.model";
import { ClientModel } from "../models/client.model";
import { ScheduleModel } from "../models/schedule.model";
import { ScheduleDayModel } from "../models/scheduleDay.model";
import { DateUtils } from "../utils/dateUtils";

export const AppointmentController = {
    async getAvailableSlots(req: Request, res: Response) {
        try {
            const { barberId, date } = req.query;

            const barber = await BarberModel.findById(Number(barberId));
            if (!barber) {
                return res.status(404).json({ error: "Barbero no encontrado" });
            }

            const schedule = await ScheduleModel.getCurrentWeekSchedule(Number(barberId));
            if (!schedule) {
                return res.json({ slots: [], schedule: null });
            }

            const scheduleDays = await ScheduleDayModel.findByScheduleId(schedule.id);
            const dayOfWeek = new Date(date as string).getDay();
            const dayOfWeekNumber = dayOfWeek === 0 ? 7 : dayOfWeek;

            const dayConfig = scheduleDays.find(d => d.day_of_week === dayOfWeekNumber);
            if (!dayConfig || !dayConfig.is_working) {
                return res.json({ slots: [], schedule });
            }

            const startTime = dayConfig.custom_start_time || schedule.start_time;
            const endTime = dayConfig.custom_end_time || schedule.end_time;

            const slots = DateUtils.generateSlots(startTime, endTime, schedule.slot_interval);

            // Filtrar slots ocupados
            const availableSlots: string[] = [];
            for (const time of slots) {
                const available = await AppointmentModel.checkAvailability(
                    Number(barberId),
                    new Date(date as string),
                    time,
                );
                if (available) {
                    availableSlots.push(time);
                }
            }

            res.json({ slots: availableSlots, schedule });
        } catch (error) {
            console.error("Get slots error:", error);
            res.status(500).json({ error: "Error al obtener horarios" });
        }
    },

    async createAppointment(req: AuthRequest, res: Response) {
        try {
            const { barberId, branchId, serviceId, date, time, notes } = req.body;
            const clientId = req.userId!;

            // Verificar que el cliente no tenga turno hoy
            const hasAppointmentToday = await AppointmentModel.checkClientAppointmentToday(clientId, new Date(date));
            if (!hasAppointmentToday) {
                return res.status(400).json({ error: "Ya tienes un turno para hoy" });
            }

            // Verificar disponibilidad
            const available = await AppointmentModel.checkAvailability(barberId, new Date(date), time);
            if (!available) {
                return res.status(409).json({ error: "Horario no disponible" });
            }

            // Verificar servicio
            const service = await BarberServiceModel.findById(serviceId);
            if (!service) {
                return res.status(404).json({ error: "Servicio no encontrado" });
            }

            // Crear turno
            await AppointmentModel.create({
                barber_id: barberId,
                branch_id: branchId,
                client_id: clientId,
                service_id: serviceId,
                appointment_date: new Date(date),
                appointment_time: time,
                status: "confirmed",
                notes: notes || null,
            });

            // Actualizar último turno del cliente
            await ClientModel.updateLastAppointment(clientId);

            res.status(201).json({ message: "Turno creado exitosamente" });
        } catch (error) {
            console.error("Create appointment error:", error);
            res.status(500).json({ error: "Error al crear turno" });
        }
    },

    async cancelAppointment(req: AuthRequest, res: Response) {
        try {
            const { id } = req.params;
            const { reason } = req.body;
            const clientId = req.userId!;

            const appointment = await AppointmentModel.findById(Number(id));
            if (!appointment) {
                return res.status(404).json({ error: "Turno no encontrado" });
            }

            if (appointment.client_id !== clientId) {
                return res.status(403).json({ error: "No tienes permiso para cancelar este turno" });
            }

            await AppointmentModel.cancel(Number(id), reason || "Cancelado por cliente", "client");

            res.json({ message: "Turno cancelado exitosamente" });
        } catch (error) {
            console.error("Cancel appointment error:", error);
            res.status(500).json({ error: "Error al cancelar turno" });
        }
    },

    async getMyAppointments(req: AuthRequest, res: Response) {
        try {
            const clientId = req.userId!;
            const { startDate, endDate } = req.query;

            const start = startDate ? new Date(startDate as string) : new Date();
            const end = endDate ? new Date(endDate as string) : new Date();
            end.setDate(end.getDate() + 30);

            const appointments = await AppointmentModel.findByClient(clientId, start, end);

            res.json(appointments);
        } catch (error) {
            console.error("Get my appointments error:", error);
            res.status(500).json({ error: "Error al obtener turnos" });
        }
    },
};
