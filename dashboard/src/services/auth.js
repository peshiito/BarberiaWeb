import api from "./api";

export const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem("barberia_token", data.token);
    localStorage.setItem("barberia_user", JSON.stringify(data.user));
    return data.user;
};

export const logout = () => {
    localStorage.removeItem("barberia_token");
    localStorage.removeItem("barberia_user");
};

export const getStoredUser = () => {
    const raw = localStorage.getItem("barberia_user");
    return raw ? JSON.parse(raw) : null;
};

export const isAuthenticated = () => {
    return Boolean(localStorage.getItem("barberia_token"));
};
