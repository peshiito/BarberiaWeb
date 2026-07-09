import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { ClientAuthRequest } from "../middlewares/client-auth.middleware";
import {
    cancelAppointmentById,
    createAppointment,
    findActiveAppointmentByClientAndDate,
    findActiveAppointmentBySlot,
    findAppointmentById,
    findAppointmentsByBarberAndWeek,
    findAppointmentsByClient,
} from "../models/appointment.model";
import { findScheduleByBarberAndWeek } from "../models/schedule.model";
import { generateSlots } from "../utils/slots";

const getWeekStart = (date: string): string => {
    const d = new Date(date + "T00:00:00");
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    return d.toISOString().split("T")[0];
};

export const createAppointmentHandler = async (req: ClientAuthRequest, res: Response) => {
    const clientId = req.client!.clientId;
    const { barber_id, date, time } = req.body as {
        barber_id: number;
        date: string;
        time: string;
    };

    if (!barber_id || !date || !time) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    const existingForDay = await findActiveAppointmentByClientAndDate(clientId, date);
    if (existingForDay) {
        return res.status(409).json({ error: "You already have an appointment that day" });
    }

    const weekStart = getWeekStart(date);
    const schedule = await findScheduleByBarberAndWeek(barber_id, weekStart);
    if (!schedule) {
        return res.status(404).json({ error: "Schedule not found for that week" });
    }

    const validSlots = generateSlots(schedule.start_time, schedule.end_time, schedule.slot_duration_minutes);
    if (!validSlots.includes(time)) {
        return res.status(400).json({ error: "Invalid time slot" });
    }

    const taken = await findActiveAppointmentBySlot(barber_id, date, time);
    if (taken) {
        return res.status(409).json({ error: "Slot already taken" });
    }

    const id = await createAppointment({
        client_id: clientId,
        barber_id,
        schedule_id: schedule.id,
        date,
        time,
    });

    return res.status(201).json({ id });
};

export const cancelAppointmentHandler = async (req: ClientAuthRequest, res: Response) => {
    const clientId = req.client!.clientId;
    const { id } = req.params;

    const appointment = await findAppointmentById(Number(id));
    if (!appointment || appointment.client_id !== clientId) {
        return res.status(404).json({ error: "Appointment not found" });
    }

    if (appointment.status !== "active") {
        return res.status(409).json({ error: "Appointment is not active" });
    }

    await cancelAppointmentById(appointment.id);
    return res.json({ message: "Appointment cancelled" });
};

export const getMyAppointments = async (req: ClientAuthRequest, res: Response) => {
    const clientId = req.client!.clientId;
    const appointments = await findAppointmentsByClient(clientId);
    return res.json(appointments);
};

export const getBarberWeekAppointments = async (req: AuthRequest, res: Response) => {
    const barberId = req.user!.id;
    const { weekStart } = req.params;

    const d = new Date(weekStart + "T00:00:00");
    d.setDate(d.getDate() + 6);
    const weekEnd = d.toISOString().split("T")[0];

    const appointments = await findAppointmentsByBarberAndWeek(barberId, weekStart, weekEnd);
    return res.json(appointments);
};
