const DATE_ONLY_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const MYSQL_INT_MAX = 2147483647;

export const parsePositiveIntParam = (raw: string | undefined): number | null => {
    if (!raw || !/^\d+$/.test(raw)) {
        return null;
    }
    const value = Number(raw);
    return value > 0 && value <= MYSQL_INT_MAX ? value : null;
};

export const isValidCalendarDate = (raw: string): boolean => {
    if (!DATE_ONLY_REGEX.test(raw)) {
        return false;
    }
    const [year, month, day] = raw.split("-").map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
};
