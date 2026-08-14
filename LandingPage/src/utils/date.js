// work_days llega como CSV en español sin tildes (ej: "lunes,martes"), indexado por Date.getDay() (0=domingo).
export const DAY_NAMES = ["domingo", "lunes", "martes", "miercoles", "jueves", "viernes", "sabado"];

const DAY_LABELS_SHORT = {
    lunes: "Lun",
    martes: "Mar",
    miercoles: "Mié",
    jueves: "Jue",
    viernes: "Vie",
    sabado: "Sáb",
    domingo: "Dom",
};

const MONTH_LABELS = [
    "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

export function toISODate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

export function getMonday(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    d.setHours(0, 0, 0, 0);
    return d;
}

export function addDays(date, amount) {
    const d = new Date(date);
    d.setDate(d.getDate() + amount);
    return d;
}

export function getWeekDays(weekStartDate) {
    return Array.from({ length: 7 }, (_, i) => {
        const d = addDays(weekStartDate, i);
        return {
            date: d,
            iso: toISODate(d),
            dayName: DAY_NAMES[d.getDay()],
            label: DAY_LABELS_SHORT[DAY_NAMES[d.getDay()]],
            dayNumber: d.getDate(),
        };
    });
}

export function parseWorkDays(workDaysString) {
    if (!workDaysString) return [];
    return workDaysString.split(",").map((d) => d.trim().toLowerCase());
}

export function isWorkDay(date, workDaysCsv) {
    return parseWorkDays(workDaysCsv).includes(DAY_NAMES[date.getDay()]);
}

export function isSameDate(a, b) {
    return toISODate(a) === toISODate(b);
}

export function isToday(date) {
    return isSameDate(date, new Date());
}

export function isPastDay(date) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
}

export function formatDayMonth(date) {
    return `${date.getDate()} de ${MONTH_LABELS[date.getMonth()]}`;
}

export function formatFullDate(date) {
    return date.toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" });
}

// Parsea "YYYY-MM-DD" (tal como lo devuelve el backend) como fecha local,
// evitando el corrimiento de un día que produce `new Date("YYYY-MM-DD")` (UTC).
export function parseISODateOnly(isoString) {
    const [year, month, day] = isoString.slice(0, 10).split("-").map(Number);
    return new Date(year, month - 1, day);
}
