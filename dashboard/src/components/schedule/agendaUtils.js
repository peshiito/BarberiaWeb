import { timeToMinutes } from "../../utils/format";
import { toISODate } from "../../utils/date";

export const STATUS_LABEL = { active: "Confirmado", completed: "Completado" };

export const deriveSlotDuration = slots => {
    if (!slots || slots.length < 2) return 30;
    return Math.max(5, timeToMinutes(slots[1]) - timeToMinutes(slots[0]));
};

export const appointmentDuration = (appointment, durationsByService, slotDuration) =>
    durationsByService.get(appointment.service_id) || slotDuration;

export const isoWeekNumber = date => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const day = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - day);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
};

export const formatRange = (start, end) => {
    const month = d => d.toLocaleDateString("es-AR", { month: "short" }).replace(".", "");
    return `${start.getDate()} ${month(start)} — ${end.getDate()} ${month(end)} ${end.getFullYear()}`;
};

export const minutesOfDay = date => date.getHours() * 60 + date.getMinutes();

// Próximo turno activo de hoy que todavía no terminó.
export const findNextAppointmentId = (appointments, now, durationsByService, slotDuration) => {
    const todayIso = toISODate(now);
    const nowMinutes = minutesOfDay(now);
    const upcoming = appointments
        .filter(a => a.status === "active" && a.date.slice(0, 10) === todayIso)
        .filter(a => timeToMinutes(a.time) + appointmentDuration(a, durationsByService, slotDuration) > nowMinutes)
        .sort((a, b) => a.time.localeCompare(b.time));
    return upcoming[0]?.id ?? null;
};

export const isPastSlot = (dateIso, slot, now) => {
    const todayIso = toISODate(now);
    if (dateIso < todayIso) return true;
    if (dateIso > todayIso) return false;
    return timeToMinutes(slot) <= minutesOfDay(now);
};
