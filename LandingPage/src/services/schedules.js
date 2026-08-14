import api from "./api";

// GET /api/schedules/:barberId/:weekStart/slots -> { has_schedule, work_days, slots }
// weekStart debe ser el lunes (YYYY-MM-DD) de la semana que se consulta.
// No descuenta turnos ya reservados (ver NECESIDADES_FRONTEND.md) — el filtrado
// real de disponibilidad ocurre al confirmar la reserva (409 si ya está tomado).
export async function fetchWeekSlots(barberId, weekStart, signal) {
    const { data } = await api.get(`/schedules/${barberId}/${weekStart}/slots`, { signal });
    return data;
}
