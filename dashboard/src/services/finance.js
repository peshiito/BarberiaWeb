import api from "./api";

// Liquidaciones
export const getPendingPayouts = async upTo => {
    const { data } = await api.get("/finance/payouts/pending", { params: { up_to: upTo } });
    return data;
};

export const getPendingPayoutDetail = async (barberId, upTo) => {
    const { data } = await api.get(`/finance/payouts/pending/${barberId}`, { params: { up_to: upTo } });
    return data;
};

export const createPayout = async payload => {
    const { data } = await api.post("/finance/payouts", payload);
    return data;
};

export const getPayouts = async (from, to) => {
    const { data } = await api.get("/finance/payouts", { params: { from, to } });
    return data;
};

export const getPayout = async id => {
    const { data } = await api.get(`/finance/payouts/${id}`);
    return data;
};

export const deletePayout = async id => {
    const { data } = await api.delete(`/finance/payouts/${id}`);
    return data;
};

// Adelantos
export const createAdvance = async payload => {
    const { data } = await api.post("/finance/advances", payload);
    return data;
};

export const deleteAdvance = async id => {
    const { data } = await api.delete(`/finance/advances/${id}`);
    return data;
};

// Productos y ventas
export const getProducts = async (includeInactive = false) => {
    const { data } = await api.get("/finance/products", { params: { include_inactive: includeInactive } });
    return data;
};

export const createProduct = async payload => {
    const { data } = await api.post("/finance/products", payload);
    return data;
};

export const updateProduct = async (id, payload) => {
    const { data } = await api.patch(`/finance/products/${id}`, payload);
    return data;
};

export const getSales = async ({ from, to, page = 1, limit = 10 }) => {
    const { data } = await api.get("/finance/sales", { params: { from, to, page, limit } });
    return data;
};

export const createSale = async payload => {
    const { data } = await api.post("/finance/sales", payload);
    return data;
};

export const deleteSale = async id => {
    const { data } = await api.delete(`/finance/sales/${id}`);
    return data;
};

// Caja
export const getCashSummary = async (from, to) => {
    const { data } = await api.get("/finance/cash/summary", { params: { from, to } });
    return data;
};

export const getCashLedger = async ({ from, to, direction, method, page = 1, limit = 10 }) => {
    const { data } = await api.get("/finance/cash/ledger", {
        params: { from, to, page, limit, ...(direction && { direction }), ...(method && { method }) },
    });
    return data;
};

export const createCashMovement = async payload => {
    const { data } = await api.post("/finance/cash/movements", payload);
    return data;
};

export const deleteCashMovement = async id => {
    const { data } = await api.delete(`/finance/cash/movements/${id}`);
    return data;
};
