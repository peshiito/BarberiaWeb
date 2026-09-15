import api from "./api";

// POST /api/appointments (público, sin cuenta) { first_name, last_name, phone, barber_id, service_id, date, time, note? } -> 201 { id }
export async function createAppointment({ firstName, lastName, phone, barberId, serviceId, date, time, note }) {
    const { data } = await api.post("/appointments", {
        first_name: firstName,
        last_name: lastName,
        phone,
        barber_id: barberId,
        service_id: serviceId,
        date,
        time,
        note: note?.trim() || undefined,
    });
    return data;
}
