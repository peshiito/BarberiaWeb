import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { ClientAuthRequest } from "../middlewares/client-auth.middleware";
import {
    cancelAppointmentById,
    completeAppointmentById,
    countActiveAppointmentsByClientInWeek,
    countActiveAppointmentsByClientInWeekExcluding,
    createAppointment,
    findActiveAppointmentByClientAndDate,
    findActiveAppointmentBySlot,
    findAppointmentById,
    findAppointmentsByBarberAndWeekPaginated,
    findAppointmentsByClient,
    updateAppointmentByAdmin,
} from "../models/appointment.model";
import { findClientById } from "../models/client.model";
import { findScheduleByBarberAndWeek } from "../models/schedule.model";
import { findById } from "../models/user.model";
import { Appointment } from "../types/appointment.types";
import { getPagination } from "../utils/pagination";
import { generateSlots } from "../utils/slots";
import { isValidCalendarDate, parsePositiveIntParam } from "../utils/validators";

const MAX_APPOINTMENTS_PER_WEEK = Number(process.env.MAX_APPOINTMENTS_PER_WEEK) || 1;

const getWeekStart = (date: string): string => {
    const [year, month, day] = date.split("-").map(Number);
    const d = new Date(Date.UTC(year, month - 1, day));
    const weekday = d.getUTCDay();
    const diff = weekday === 0 ? -6 : 1 - weekday;
    d.setUTCDate(d.getUTCDate() + diff);
    return d.toISOString().split("T")[0];
};

const getWeekEnd = (weekStart: string): string => {
    const [year, month, day] = weekStart.split("-").map(Number);
    const d = new Date(Date.UTC(year, month - 1, day));
    d.setUTCDate(d.getUTCDate() + 6);
    return d.toISOString().split("T")[0];
};

interface AppointmentValidationError {
    status: number;
    error: string;
}

interface AppointmentValidationOk {
    schedule_id: number;
    price: number;
}

const validateAndBuildAppointment = async (
    clientId: number,
    barberId: number,
    date: string,
    time: string,
    excludeAppointmentId?: number,
): Promise<AppointmentValidationError | AppointmentValidationOk> => {
    const client = await findClientById(clientId);
    if (!client) {
        return { status: 404, error: "Client not found" };
    }

    const existingForDay = await findActiveAppointmentByClientAndDate(clientId, date);
    if (existingForDay && existingForDay.id !== excludeAppointmentId) {
        return { status: 409, error: "Client already has an appointment that day" };
    }

    const weekStart = getWeekStart(date);
    const weekEnd = getWeekEnd(weekStart);

    const weeklyCount = excludeAppointmentId
        ? await countActiveAppointmentsByClientInWeekExcluding(clientId, weekStart, weekEnd, excludeAppointmentId)
        : await countActiveAppointmentsByClientInWeek(clientId, weekStart, weekEnd);
    if (weeklyCount >= MAX_APPOINTMENTS_PER_WEEK) {
        return { status: 409, error: "Weekly appointment limit reached" };
    }

    const schedule = await findScheduleByBarberAndWeek(barberId, weekStart);
    if (!schedule) {
        return { status: 404, error: "Schedule not found for that week" };
    }

    const validSlots = generateSlots(schedule.start_time, schedule.end_time, schedule.slot_duration_minutes);
    if (!validSlots.includes(time)) {
        return { status: 400, error: "Invalid time slot" };
    }

    const taken = await findActiveAppointmentBySlot(barberId, date, time);
    if (taken && taken.id !== excludeAppointmentId) {
        return { status: 409, error: "Slot already taken" };
    }

    const barber = await findById(barberId);
    return { schedule_id: schedule.id, price: barber?.service_price || 0 };
};

const findActionableAppointment = async (
    id: number,
    ownerCheck?: (appointment: Appointment) => boolean,
): Promise<AppointmentValidationError | { appointment: Appointment }> => {
    const appointment = await findAppointmentById(id);
    if (!appointment || (ownerCheck && !ownerCheck(appointment))) {
        return { status: 404, error: "Appointment not found" };
    }
    if (appointment.status !== "active") {
        return { status: 409, error: "Appointment is not active" };
    }
    return { appointment };
};

export const createAppointmentHandler = async (req: ClientAuthRequest, res: Response) => {
    const clientId = req.client!.clientId;
    const { barber_id, date, time } = req.body as {
        barber_id: number;
        date: string;
        time: string;
    };

    const result = await validateAndBuildAppointment(clientId, barber_id, date, time);
    if ("error" in result) {
        return res.status(result.status).json({ error: result.error });
    }

    const id = await createAppointment({
        client_id: clientId,
        barber_id,
        schedule_id: result.schedule_id,
        date,
        time,
        price: result.price,
    });

    return res.status(201).json({ id });
};

export const createAppointmentByAdminHandler = async (req: AuthRequest, res: Response) => {
    const { client_id, barber_id, date, time } = req.body as {
        client_id: number;
        barber_id: number;
        date: string;
        time: string;
    };

    const result = await validateAndBuildAppointment(client_id, barber_id, date, time);
    if ("error" in result) {
        return res.status(result.status).json({ error: result.error });
    }

    const id = await createAppointment({
        client_id,
        barber_id,
        schedule_id: result.schedule_id,
        date,
        time,
        price: result.price,
    });

    return res.status(201).json({ id });
};

export const createAppointmentByBarberHandler = async (req: AuthRequest, res: Response) => {
    const barberId = req.user!.id;
    const { client_id, date, time } = req.body as {
        client_id: number;
        date: string;
        time: string;
    };

    const result = await validateAndBuildAppointment(client_id, barberId, date, time);
    if ("error" in result) {
        return res.status(result.status).json({ error: result.error });
    }

    const id = await createAppointment({
        client_id,
        barber_id: barberId,
        schedule_id: result.schedule_id,
        date,
        time,
        price: result.price,
    });

    return res.status(201).json({ id });
};

export const updateAppointmentByAdminHandler = async (req: AuthRequest, res: Response) => {
    const appointmentId = parsePositiveIntParam(req.params.id);
    if (appointmentId === null) {
        return res.status(400).json({ error: "Invalid appointment id" });
    }

    const gate = await findActionableAppointment(appointmentId);
    if ("error" in gate) {
        return res.status(gate.status).json({ error: gate.error });
    }
    const appointment = gate.appointment;

    const { barber_id, date, time } = req.body as { barber_id?: number; date?: string; time?: string };
    const targetBarberId = barber_id ?? appointment.barber_id;
    const targetDate = date ?? appointment.date;
    const targetTime = time ?? appointment.time;

    const result = await validateAndBuildAppointment(
        appointment.client_id,
        targetBarberId,
        targetDate,
        targetTime,
        appointmentId,
    );
    if ("error" in result) {
        return res.status(result.status).json({ error: result.error });
    }

    await updateAppointmentByAdmin(appointmentId, {
        barber_id: targetBarberId,
        schedule_id: result.schedule_id,
        date: targetDate,
        time: targetTime,
        price: result.price,
    });

    return res.json({ message: "Appointment updated" });
};

export const cancelAppointmentByAdminHandler = async (req: AuthRequest, res: Response) => {
    const appointmentId = parsePositiveIntParam(req.params.id);
    if (appointmentId === null) {
        return res.status(400).json({ error: "Invalid appointment id" });
    }

    const gate = await findActionableAppointment(appointmentId);
    if ("error" in gate) {
        return res.status(gate.status).json({ error: gate.error });
    }

    await cancelAppointmentById(appointmentId);
    return res.json({ message: "Appointment cancelled" });
};

export const getBarberWeekAppointmentsForAdmin = async (req: AuthRequest, res: Response) => {
    const targetBarberId = parsePositiveIntParam(req.params.barberId);
    if (targetBarberId === null) {
        return res.status(400).json({ error: "Invalid barber id" });
    }

    const { weekStart } = req.params;
    if (!isValidCalendarDate(weekStart)) {
        return res.status(400).json({ error: "Invalid date format. Expected YYYY-MM-DD" });
    }
    const weekEnd = getWeekEnd(weekStart);
    const { page, limit, offset } = getPagination(req);

    const { appointments, total } = await findAppointmentsByBarberAndWeekPaginated(
        targetBarberId,
        weekStart,
        weekEnd,
        limit,
        offset,
    );

    return res.json({
        data: appointments,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    });
};

export const cancelAppointmentHandler = async (req: ClientAuthRequest, res: Response) => {
    const clientId = req.client!.clientId;
    const appointmentId = parsePositiveIntParam(req.params.id);
    if (appointmentId === null) {
        return res.status(400).json({ error: "Invalid appointment id" });
    }

    const gate = await findActionableAppointment(appointmentId, a => a.client_id === clientId);
    if ("error" in gate) {
        return res.status(gate.status).json({ error: gate.error });
    }

    await cancelAppointmentById(appointmentId);
    return res.json({ message: "Appointment cancelled" });
};

export const completeAppointmentHandler = async (req: AuthRequest, res: Response) => {
    const barberId = req.user!.id;
    const appointmentId = parsePositiveIntParam(req.params.id);
    if (appointmentId === null) {
        return res.status(400).json({ error: "Invalid appointment id" });
    }

    const gate = await findActionableAppointment(appointmentId, a => a.barber_id === barberId);
    if ("error" in gate) {
        return res.status(gate.status).json({ error: gate.error });
    }

    await completeAppointmentById(appointmentId);
    return res.json({ message: "Appointment completed" });
};

export const getMyAppointments = async (req: ClientAuthRequest, res: Response) => {
    const clientId = req.client!.clientId;
    const appointments = await findAppointmentsByClient(clientId);
    return res.json(appointments);
};

export const getBarberWeekAppointments = async (req: AuthRequest, res: Response) => {
    const barberId = req.user!.id;
    const { weekStart } = req.params;
    if (!isValidCalendarDate(weekStart)) {
        return res.status(400).json({ error: "Invalid date format. Expected YYYY-MM-DD" });
    }
    const weekEnd = getWeekEnd(weekStart);
    const { page, limit, offset } = getPagination(req);

    const { appointments, total } = await findAppointmentsByBarberAndWeekPaginated(
        barberId,
        weekStart,
        weekEnd,
        limit,
        offset,
    );

    return res.json({
        data: appointments,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    });
};

export const cancelAppointmentByBarberHandler = async (req: AuthRequest, res: Response) => {
    const barberId = req.user!.id;
    const appointmentId = parsePositiveIntParam(req.params.id);
    if (appointmentId === null) {
        return res.status(400).json({ error: "Invalid appointment id" });
    }

    const gate = await findActionableAppointment(appointmentId, a => a.barber_id === barberId);
    if ("error" in gate) {
        return res.status(gate.status).json({ error: gate.error });
    }

    await cancelAppointmentById(appointmentId);
    return res.json({ message: "Appointment cancelled" });
};
