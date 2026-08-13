import api from "./api";

export const getClients = async (page = 1, limit = 10) => {
    const { data } = await api.get("/clients", { params: { page, limit } });
    return data;
};

export const searchClients = async (q, page = 1, limit = 10) => {
    const { data } = await api.get("/clients/search", { params: { q, page, limit } });
    return data;
};

export const getClient = async id => {
    const { data } = await api.get(`/clients/${id}`);
    return data;
};

export const createClient = async payload => {
    const { data } = await api.post("/clients", payload);
    return data;
};

export const updateClient = async (id, payload) => {
    const { data } = await api.patch(`/clients/${id}`, payload);
    return data;
};

export const getClientHistory = async id => {
    const { data } = await api.get(`/clients/${id}/history`);
    return data;
};
