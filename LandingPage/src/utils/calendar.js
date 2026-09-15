// Buenos Aires es UTC-3 todo el año (sin horario de verano), así que la hora
// local del turno se pasa a UTC sumando 3 horas. Evita depender de VTIMEZONE.
const BUENOS_AIRES_OFFSET_HOURS = 3;

function toUtcStamp(dateIso, time) {
    const [year, month, day] = dateIso.split("-").map(Number);
    const [hours, minutes] = time.split(":").map(Number);
    const date = new Date(Date.UTC(year, month - 1, day, hours + BUENOS_AIRES_OFFSET_HOURS, minutes));
    return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

export function googleCalendarUrl({ title, dateIso, time, endTime, details }) {
    const params = new URLSearchParams({
        action: "TEMPLATE",
        text: title,
        dates: `${toUtcStamp(dateIso, time)}/${toUtcStamp(dateIso, endTime)}`,
        details,
    });
    return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function escapeIcs(value) {
    return String(value).replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

export function buildIcs({ uid, title, dateIso, time, endTime, details }) {
    const now = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
    return [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Oficio Barberia//Turnos//ES",
        "CALSCALE:GREGORIAN",
        "METHOD:PUBLISH",
        "BEGIN:VEVENT",
        `UID:${uid}`,
        `DTSTAMP:${now}`,
        `DTSTART:${toUtcStamp(dateIso, time)}`,
        `DTEND:${toUtcStamp(dateIso, endTime)}`,
        `SUMMARY:${escapeIcs(title)}`,
        `DESCRIPTION:${escapeIcs(details)}`,
        "END:VEVENT",
        "END:VCALENDAR",
    ].join("\r\n");
}

export function downloadFile(content, filename, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}
