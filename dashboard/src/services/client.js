import api from "./api";

export const registerOrLoginClient = async credentials => {
    const { data } = await api.post("/clients/register", credentials);
    if (data.token) {
        localStorage.setItem("barberia_client_token", data.token);
        localStorage.setItem("barberia_client", JSON.stringify(data.client));
    }
    return data.client;
};

export const logoutClient = () => {
    localStorage.removeItem("barberia_client_token");
    localStorage.removeItem("barberia_client");
};

export const getStoredClient = () => {
    const raw = localStorage.getItem("barberia_client");
    return raw ? JSON.parse(raw) : null;
};

export const isClientAuthenticated = () => {
    return Boolean(localStorage.getItem("barberia_client_token"));
};