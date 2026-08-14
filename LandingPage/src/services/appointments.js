import api from "./api";

// POST /api/appointments (requiere JWT de cliente) { barber_id, date, time } -> 201 { id }
export async function createAppointment({ barberId, date, time }) {
    const { data } = await api.post("/appointments", {
        barber_id: barberId,
        date,
        time,
    });
    return data;
}

// GET /api/appointments/mine (requiere JWT de cliente) -> array plano, sin datos de barbero
export async function fetchMyAppointments(signal) {
    const { data } = await api.get("/appointments/mine", { signal });
    return data;
}

// PATCH /api/appointments/:id/cancel (requiere JWT de cliente)
export async function cancelAppointment(id) {
    const { data } = await api.patch(`/appointments/${id}/cancel`);
    return data;
}
