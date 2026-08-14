/*
  Traduce errores reales del backend (siempre { error: string }, a veces
  { error, details } en validaciones Zod) a mensajes en español para el usuario.
  Nunca se debe mostrar el mensaje técnico crudo (AxiosError, códigos SQL, etc).
*/

const KNOWN_MESSAGES = {
    "No token provided": "Tu sesión expiró. Iniciá sesión de nuevo para continuar.",
    "Invalid or expired token": "Tu sesión expiró. Iniciá sesión de nuevo para continuar.",
    "Invalid token type": "Tu sesión no es válida para esta acción. Iniciá sesión de nuevo.",
    "Forbidden": "No tenés permiso para realizar esta acción.",
    "Client not found": "No encontramos tu cuenta. Intentá iniciar sesión de nuevo.",
    "Appointment not found": "No encontramos ese turno.",
    "Barber not found": "No encontramos ese barbero.",
    "Schedule not found for that week": "El barbero todavía no tiene agenda cargada para esa semana. Probá con otra fecha.",
    "Slot already taken": "Ese horario ya fue reservado por otra persona. Elegí otro horario.",
    "Weekly appointment limit reached": "Ya alcanzaste el máximo de turnos permitidos para esta semana.",
    "Client already has an appointment that day": "Ya tenés un turno reservado ese día.",
    "Invalid time slot": "Ese horario no está disponible. Elegí otro de la lista.",
    "Appointment is not active": "Ese turno ya fue cancelado o completado.",
    "Too many requests, slow down": "Estás haciendo demasiadas solicitudes. Esperá un momento e intentá de nuevo.",
    "Too many attempts, try again later": "Demasiados intentos. Esperá unos minutos e intentá de nuevo.",
    "Validation failed": "Revisá los datos ingresados.",
    "Not found": "No encontramos lo que buscabas.",
    "Internal server error": "Ocurrió un error inesperado. Intentá de nuevo en unos minutos.",
    "Payload too large": "El archivo o los datos enviados son demasiado grandes.",
};

export function getErrorMessage(error, fallback = "Ocurrió un error inesperado. Intentá de nuevo.") {
    if (!error?.response) {
        return "No pudimos conectar con el servidor. Revisá tu conexión e intentá de nuevo.";
    }

    const { status, data } = error.response;
    const raw = data?.error;

    if (raw && KNOWN_MESSAGES[raw]) {
        return KNOWN_MESSAGES[raw];
    }

    if (status === 429) {
        return KNOWN_MESSAGES["Too many requests, slow down"];
    }

    if (status === 401) {
        return KNOWN_MESSAGES["Invalid or expired token"];
    }

    if (status === 409) {
        return raw ? KNOWN_MESSAGES[raw] || "Ese recurso ya existe o está en conflicto con otro." : "Conflicto con el estado actual. Actualizá la página e intentá de nuevo.";
    }

    if (status >= 500) {
        return KNOWN_MESSAGES["Internal server error"];
    }

    if (data?.details?.length) {
        return data.details.map((d) => d.message).join(". ");
    }

    return fallback;
}

export function isConflict(error) {
    return error?.response?.status === 409;
}

export function isNotFound(error) {
    return error?.response?.status === 404;
}
