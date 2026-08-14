import api from "./api";

// GET /api/schedules/:barberId/:weekStart/slots -> { has_schedule, work_days, slots }
// weekStart es el lunes (YYYY-MM-DD) de la semana consultada. No descuenta
// turnos ya reservados: eso se resuelve con el 409 al confirmar.
export async function fetchWeekSlots(barberId, weekStart, signal) {
    const { data } = await api.get(`/schedules/${barberId}/${weekStart}/slots`, { signal });
    return data;
}
