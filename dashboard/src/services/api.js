import axios from "axios";

export const API_ORIGIN = import.meta.env.VITE_API_URL || "http://localhost:4000";

const api = axios.create({
    baseURL: `${API_ORIGIN}/api`,
});

api.interceptors.request.use(config => {
    const token = localStorage.getItem("barberia_token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    response => response,
    error => {
        // Un 401 en /auth/login es "contraseña incorrecta", no "tu sesión
        // expiró" — no hay token que limpiar y forzar el reload de /login
        // pisaba el error que Login.jsx recién estaba por mostrar (el
        // usuario veía la pantalla "parpadear" sin ningún mensaje).
        const isLoginRequest = error.config?.url?.includes("/auth/login");
        if (error.response?.status === 401 && !isLoginRequest) {
            localStorage.removeItem("barberia_token");
            localStorage.removeItem("barberia_user");
            window.location.href = "/login";
        }
        return Promise.reject(error);
    },
);

export default api;
