import api from "./api";

export const getBarberWeekAppointments = async (weekStart, page = 1, limit = 50) => {
    const { data } = await api.get(`/appointments/barber/week/${weekStart}`, {
        params: { page, limit },
    });
    return data;
};

export const completeAppointment = async id => {
    const { data } = await api.patch(`/appointments/${id}/complete`);
    return data;
};

export const cancelAppointmentByBarber = async id => {
    const { data } = await api.patch(`/appointments/${id}/cancel-by-barber`);
    return data;
};

export const getBarberWeekAppointmentsForAdmin = async (barberId, weekStart, page = 1, limit = 50) => {
    const { data } = await api.get(`/appointments/barber/${barberId}/week/${weekStart}`, {
        params: { page, limit },
    });
    return data;
};

export const createAppointmentByAdmin = async payload => {
    const { data } = await api.post("/appointments/by-admin", payload);
    return data;
};

export const createAppointmentByBarber = async payload => {
    const { data } = await api.post("/appointments/by-barber", payload);
    return data;
};

export const updateAppointmentByAdmin = async (id, payload) => {
    const { data } = await api.patch(`/appointments/${id}/admin`, payload);
    return data;
};

export const cancelAppointmentByAdmin = async id => {
    const { data } = await api.patch(`/appointments/${id}/cancel-by-admin`);
    return data;
};
