import { isValidCalendarDate } from "./validators";

export const parseDateRange = (from: unknown, to: unknown): { error: string } | { from: string; to: string } => {
    if (!from || !to) {
        return { error: "Missing from/to date range" };
    }
    if (typeof from !== "string" || typeof to !== "string" || !isValidCalendarDate(from) || !isValidCalendarDate(to)) {
        return { error: "Invalid date format. Expected YYYY-MM-DD" };
    }
    if (from > to) {
        return { error: "'from' date must not be after 'to' date" };
    }
    return { from, to };
};

// Fecha local del servidor en YYYY-MM-DD (no toISOString, que usa UTC y en
// Argentina a la noche ya devuelve el día siguiente).
export const todayIso = (): string => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
};

export const roundMoney = (value: number): number => Math.round(value * 100) / 100;
