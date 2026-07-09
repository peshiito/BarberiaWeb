export const generateSlots = (startTime: string, endTime: string, durationMinutes: number): string[] => {
    const slots: string[] = [];

    const [startH, startM] = startTime.split(":").map(Number);
    const [endH, endM] = endTime.split(":").map(Number);

    let current = startH * 60 + startM;
    const end = endH * 60 + endM;

    while (current + durationMinutes <= end) {
        const h = Math.floor(current / 60)
            .toString()
            .padStart(2, "0");
        const m = (current % 60).toString().padStart(2, "0");
        slots.push(`${h}:${m}`);
        current += durationMinutes;
    }

    return slots;
};
