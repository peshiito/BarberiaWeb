import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { createSchedule, findScheduleByBarberAndWeek, findSchedulesByBarber } from "../models/schedule.model";
import { ScheduleInput } from "../types/schedule.types";
import { generateSlots } from "../utils/slots";

export const createScheduleHandler = async (req: AuthRequest, res: Response) => {
    const barberId = req.user!.id;
    const { week_start, work_days, start_time, end_time, slot_duration_minutes } = req.body as Omit<
        ScheduleInput,
        "barber_id"
    >;

    if (!week_start || !work_days || !start_time || !end_time || !slot_duration_minutes) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    const existing = await findScheduleByBarberAndWeek(barberId, week_start);
    if (existing) {
        return res.status(409).json({ error: "Schedule already exists for this week" });
    }

    const id = await createSchedule({
        barber_id: barberId,
        week_start,
        work_days,
        start_time,
        end_time,
        slot_duration_minutes,
    });

    return res.status(201).json({ id });
};

export const getMySchedules = async (req: AuthRequest, res: Response) => {
    const barberId = req.user!.id;
    const schedules = await findSchedulesByBarber(barberId);
    return res.json(schedules);
};

export const getScheduleSlots = async (req: AuthRequest, res: Response) => {
    const { barberId, weekStart } = req.params;

    const schedule = await findScheduleByBarberAndWeek(Number(barberId), weekStart);
    if (!schedule) {
        return res.status(404).json({ error: "Schedule not found" });
    }

    const slots = generateSlots(schedule.start_time, schedule.end_time, schedule.slot_duration_minutes);

    return res.json({ work_days: schedule.work_days, slots });
};
