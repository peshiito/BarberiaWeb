import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { createSchedule, findScheduleByBarberAndWeek, findSchedulesByBarber } from "../models/schedule.model";
import { findTakenSlotsByBarberBetween } from "../models/appointment.model";
import { findById } from "../models/user.model";
import { ScheduleInput } from "../types/schedule.types";
import { generateSlots } from "../utils/slots";
import { isValidCalendarDate, parsePositiveIntParam } from "../utils/validators";

export const createScheduleHandler = async (req: AuthRequest, res: Response) => {
    const barberId = req.user!.id;
    const { week_start, work_days, start_time, end_time, slot_duration_minutes } = req.body as Omit<
        ScheduleInput,
        "barber_id"
    >;

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
    const { weekStart } = req.params;

    const barberIdNum = parsePositiveIntParam(req.params.barberId);
    if (barberIdNum === null) {
        return res.status(400).json({ error: "Invalid barberId" });
    }

    if (!isValidCalendarDate(weekStart)) {
        return res.status(400).json({ error: "Invalid date format. Expected YYYY-MM-DD" });
    }

    const barber = await findById(barberIdNum);
    if (!barber || (barber.role !== "barber" && barber.role !== "admin_barber")) {
        return res.status(404).json({ error: "Barber not found" });
    }

    const schedule = await findScheduleByBarberAndWeek(barberIdNum, weekStart);
    if (!schedule) {
        return res.json({ has_schedule: false, work_days: null, slots: [], taken: {} });
    }

    const slots = generateSlots(schedule.start_time, schedule.end_time, schedule.slot_duration_minutes);

    const weekEndDate = new Date(`${weekStart}T00:00:00Z`);
    weekEndDate.setUTCDate(weekEndDate.getUTCDate() + 6);
    const takenRows = await findTakenSlotsByBarberBetween(barberIdNum, weekStart, weekEndDate.toISOString().slice(0, 10));
    const taken: Record<string, string[]> = {};
    for (const row of takenRows) {
        (taken[row.date] ??= []).push(row.time);
    }

    return res.json({ has_schedule: true, work_days: schedule.work_days, slots, taken });
};
