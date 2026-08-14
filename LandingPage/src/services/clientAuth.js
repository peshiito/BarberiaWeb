import api, { CLIENT_KEY, CLIENT_TOKEN_KEY } from "./api";

// POST /api/clients/register — actúa como registro Y login (busca por teléfono).
// Body real: { first_name, last_name, phone }. Sin contraseña ni OTP.
export async function registerOrLoginClient({ firstName, lastName, phone }) {
    const { data } = await api.post("/clients/register", {
        first_name: firstName,
        last_name: lastName,
        phone,
    });
    localStorage.setItem(CLIENT_TOKEN_KEY, data.token);
    localStorage.setItem(CLIENT_KEY, JSON.stringify(data.client));
    return data.client;
}

export function logoutClient() {
    localStorage.removeItem(CLIENT_TOKEN_KEY);
    localStorage.removeItem(CLIENT_KEY);
}

export function getStoredClient() {
    const raw = localStorage.getItem(CLIENT_KEY);
    if (!raw) return null;
    try {
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

export function isClientAuthenticated() {
    return Boolean(localStorage.getItem(CLIENT_TOKEN_KEY));
}
