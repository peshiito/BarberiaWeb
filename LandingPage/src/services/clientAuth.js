import api, { CLIENT_KEY, CLIENT_TOKEN_KEY } from "./api";

function persistSession(data) {
    localStorage.setItem(CLIENT_TOKEN_KEY, data.token);
    localStorage.setItem(CLIENT_KEY, JSON.stringify(data.client));
    return data.client;
}

// POST /api/clients/register — crea la cuenta. Falla con 409 si el teléfono
// ya está registrado (con o sin contraseña); en ese caso el flujo correcto
// es loguearse.
export async function registerClient({ firstName, lastName, phone, password }) {
    const { data } = await api.post("/clients/register", {
        first_name: firstName,
        last_name: lastName,
        phone,
        password,
    });
    return persistSession(data);
}

// POST /api/clients/login. Puede devolver 409 { error: "legacy_account" }
// para cuentas creadas antes de que existiera contraseña — ese caso lo debe
// manejar el caller (Login.jsx) redirigiendo al flujo de reclamo.
export async function loginClient({ phone, password }) {
    const { data } = await api.post("/clients/login", { phone, password });
    return persistSession(data);
}

// POST /api/clients/claim — migración one-time de una cuenta legacy: crea
// la contraseña por primera vez, validando los mismos datos que antes se
// usaban para el login passwordless.
export async function claimLegacyClient({ firstName, lastName, phone, password }) {
    const { data } = await api.post("/clients/claim", {
        first_name: firstName,
        last_name: lastName,
        phone,
        password,
    });
    return persistSession(data);
}

export async function updateMyClientProfile(payload) {
    const { data } = await api.patch("/clients/me", payload);
    localStorage.setItem(CLIENT_KEY, JSON.stringify(data));
    return data;
}

export async function uploadClientPhoto(file) {
    const formData = new FormData();
    formData.append("photo", file);
    const { data } = await api.post("/clients/me/photo", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return data.url;
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
