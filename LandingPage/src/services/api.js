import axios from "axios";

export const API_ORIGIN = import.meta.env.VITE_API_URL || "http://localhost:4000";

const api = axios.create({ baseURL: `${API_ORIGIN}/api`, timeout: 15000 });

export function buildAssetUrl(relativeUrl) {
    if (!relativeUrl) return null;
    return `${API_ORIGIN}${relativeUrl}`;
}

export default api;
