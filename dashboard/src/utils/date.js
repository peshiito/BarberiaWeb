const DAY_NAMES = ["domingo", "lunes", "martes", "miercoles", "jueves", "viernes", "sabado"];

const DAY_LABELS_SHORT = {
    lunes: "Lun",
    martes: "Mar",
    miercoles: "Mié",
    jueves: "Jue",
    viernes: "Vie",
    sabado: "Sáb",
    domingo: "Dom",
};

export const toISODate = date => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

export const getMonday = date => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    d.setHours(0, 0, 0, 0);
    return d;
};

export const addDays = (date, amount) => {
    const d = new Date(date);
    d.setDate(d.getDate() + amount);
    return d;
};

export const getWeekDays = weekStartDate => {
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
};

export const isSameDate = (a, b) => toISODate(a) === toISODate(b);

export const isToday = date => isSameDate(date, new Date());

export const formatWeekRange = weekStartDate => {
    const end = addDays(weekStartDate, 6);
    const startLabel = weekStartDate.toLocaleDateString("es-AR", {
        day: "numeric",
        month: "short",
    });
    const endLabel = end.toLocaleDateString("es-AR", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
    return `${startLabel} — ${endLabel}`;
};

export const parseWorkDays = workDaysString => {
    return workDaysString.split(",").map(d => d.trim().toLowerCase());
};

export const parseDateOnly = isoString => {
    const datePart = isoString.slice(0, 10);
    const [year, month, day] = datePart.split("-").map(Number);
    return new Date(year, month - 1, day);
};
