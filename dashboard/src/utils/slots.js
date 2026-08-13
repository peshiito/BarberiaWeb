import { toISODate } from "./date";

export const generateSlots = (startTime, endTime, durationMinutes) => {
    if (!startTime || !endTime || !durationMinutes) return [];

    const slots = [];
    const [startH, startM] = startTime.split(":").map(Number);
    const [endH, endM] = endTime.split(":").map(Number);

    let current = startH * 60 + startM;
    const end = endH * 60 + endM;

    while (current + durationMinutes <= end) {
        const h = String(Math.floor(current / 60)).padStart(2, "0");
        const m = String(current % 60).padStart(2, "0");
        slots.push(`${h}:${m}`);
        current += durationMinutes;
    }

    return slots;
};

export const getAvailableSlots = (slots, appointments, dateIso) => {
    const occupied = new Set(
        appointments.filter(a => a.date.slice(0, 10) === dateIso).map(a => a.time.slice(0, 5)),
    );

    const now = new Date();
    const isToday = dateIso === toISODate(now);
    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    return slots.filter(slot => {
        if (occupied.has(slot)) return false;
        if (!isToday) return true;
        const [h, m] = slot.split(":").map(Number);
        return h * 60 + m > nowMinutes;
    });
};
