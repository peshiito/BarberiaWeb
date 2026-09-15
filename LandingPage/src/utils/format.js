export function formatPrice(value) {
    return `$${Number(value || 0).toLocaleString("es-AR")}`;
}

export function formatDuration(minutes) {
    return `${Number(minutes)} min`;
}

export function initialsOf(person) {
    return `${person?.first_name?.[0] || ""}${person?.last_name?.[0] || ""}`.toUpperCase();
}

export function fullName(person) {
    return [person?.first_name, person?.last_name].filter(Boolean).join(" ");
}

// "HH:mm" + minutos -> "HH:mm"
export function addMinutesToTime(time, minutes) {
    const [h, m] = time.split(":").map(Number);
    const total = h * 60 + m + Number(minutes || 0);
    return `${String(Math.floor(total / 60) % 24).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

export function timeToMinutes(time) {
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
}
