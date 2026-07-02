import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { BarberModel } from "../models/barber.model";
import { ScheduleModel } from "../models/schedule.model";
import { ScheduleDayModel } from "../models/scheduleDay.model";

export const ScheduleController = {
    async createWeeklySchedule(req: AuthRequest, res: Response) {
        try {
            const {
                branchId,
                weekStartDate,
                weekEndDate,
                startTime,
                endTime,
                slotInterval,
                days,
                breakStart,
                breakEnd,
            } = req.body;

            const barber = await BarberModel.findByUserId(req.userId!);
            if (!barber) {
                return res.status(404).json({ error: "Barbero no encontrado" });
            }

            // Verificar si ya existe horario para esta semana
            const existing = await ScheduleModel.findByBarberAndWeek(barber.id, new Date(weekStartDate));
            if (existing) {
                return res.status(400).json({ error: "Ya existe horario para esta semana" });
            }

            // Crear schedule
            const scheduleResult = await ScheduleModel.create({
                barber_id: barber.id,
                branch_id: branchId,
                week_start_date: new Date(weekStartDate),
                week_end_date: new Date(weekEndDate),
                start_time: startTime,
                end_time: endTime,
                slot_interval: slotInterval,
                break_start: breakStart || null,
                break_end: breakEnd || null,
                is_active: true,
            });

            const scheduleId = (scheduleResult as any).insertId;

            // Crear días de la semana
            for (const day of days) {
                await ScheduleDayModel.create({
                    schedule_id: scheduleId,
                    day_of_week: day.dayOfWeek,
                    is_working: day.isWorking,
                    custom_start_time: day.customStartTime || null,
                    custom_end_time: day.customEndTime || null,
                    notes: day.notes || null,
                });
            }

            res.status(201).json({
                message: "Horario semanal configurado",
                scheduleId,
            });
        } catch (error) {
            console.error("Create schedule error:", error);
            res.status(500).json({ error: "Error al configurar horario" });
        }
    },

    async getBarberSchedules(req: AuthRequest, res: Response) {
        try {
            const barber = await BarberModel.findByUserId(req.userId!);
            if (!barber) {
                return res.status(404).json({ error: "Barbero no encontrado" });
            }

            const schedules = await ScheduleModel.findByBarber(barber.id);

            // Obtener días para cada schedule
            const result = [];
            for (const schedule of schedules) {
                const days = await ScheduleDayModel.findByScheduleId(schedule.id);
                result.push({ ...schedule, days });
            }

            res.json(result);
        } catch (error) {
            console.error("Get schedules error:", error);
            res.status(500).json({ error: "Error al obtener horarios" });
        }
    },
};
