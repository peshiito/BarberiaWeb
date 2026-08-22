import { toISODate } from "./date";

export const generateSlots = (startTime, endTime, durationMinutes) => {
    // El valor puede venir como string desde un <select>/<input> sin castear:
    // sumar un string a un número hace concatenación ("600" + "20" = "60020"),
    // no aritmética, y eso rompe la comparación de abajo silenciosamente.
    const duration = Number(durationMinutes);
    if (!startTime || !endTime || !duration || Number.isNaN(duration)) return [];

    const slots = [];
    const [startH, startM] = startTime.split(":").map(Number);
    const [endH, endM] = endTime.split(":").map(Number);

    let current = startH * 60 + startM;
    const end = endH * 60 + endM;

    while (current + duration <= end) {
        const h = String(Math.floor(current / 60)).padStart(2, "0");
        const m = String(current % 60).padStart(2, "0");
        slots.push(`${h}:${m}`);
        current += duration;
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
