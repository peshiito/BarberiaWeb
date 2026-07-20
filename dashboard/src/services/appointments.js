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
