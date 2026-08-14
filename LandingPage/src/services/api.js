import axios from "axios";

export const API_ORIGIN = import.meta.env.VITE_API_URL || "http://localhost:4000";

const CLIENT_TOKEN_KEY = "barberia_client_token";
const CLIENT_KEY = "barberia_client";

const api = axios.create({ baseURL: `${API_ORIGIN}/api`, timeout: 15000 });

export const CLIENT_SESSION_EXPIRED_EVENT = "barberia:client-session-expired";

api.interceptors.request.use((config) => {
    const token = localStorage.getItem(CLIENT_TOKEN_KEY);
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const isAuthRequest = error.config?.url?.includes("/clients/register");
        if (error.response?.status === 401 && !isAuthRequest) {
            localStorage.removeItem(CLIENT_TOKEN_KEY);
            localStorage.removeItem(CLIENT_KEY);
            window.dispatchEvent(new Event(CLIENT_SESSION_EXPIRED_EVENT));
        }
        return Promise.reject(error);
    },
);

export function buildAssetUrl(relativeUrl) {
    if (!relativeUrl) return null;
    return `${API_ORIGIN}${relativeUrl}`;
}

export { CLIENT_TOKEN_KEY, CLIENT_KEY };
export default api;
