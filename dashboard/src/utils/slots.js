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
