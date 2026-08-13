import api from "./api";

export const getAllUsers = async (page = 1, limit = 10) => {
    const { data } = await api.get("/admin/users", {
        params: { page, limit },
    });
    return data;
};

export const createBarber = async payload => {
    const { data } = await api.post("/admin/barbers", payload);
    return data;
};

export const getFinancialSummary = async (from, to) => {
    const { data } = await api.get("/admin/finance/summary", { params: { from, to } });
    return data;
};

export const getFinancialPeriod = async (from, to) => {
    const { data } = await api.get("/admin/finance/period", { params: { from, to } });
    return data;
};

export const getFinancialSeries = async (from, to, bucket) => {
    const { data } = await api.get("/admin/finance/series", { params: { from, to, bucket } });
    return data;
};