import api from "./api";

export const getServices = async () => {
    const { data } = await api.get("/services");
    return data;
};

export const createService = async payload => {
    const { data } = await api.post("/services", payload);
    return data;
};

export const updateService = async (id, payload) => {
    const { data } = await api.patch(`/services/${id}`, payload);
    return data;
};

export const getServicesByBarber = async barberId => {
    const { data } = await api.get(`/services/barber/${barberId}`);
    return data;
};
