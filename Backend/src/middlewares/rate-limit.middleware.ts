import rateLimit from "express-rate-limit";

// Único límite de la reserva pública, que no requiere cuenta ni JWT: con
// una ventana de 1 minuto permitía hasta 300 reservas falsas por hora desde
// una misma IP. Un cliente real reserva una vez; 5 cada 15 minutos le deja
// margen para reintentar si le ganaron el horario.
export const appointmentsRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    message: { error: "Too many requests, slow down" },
    standardHeaders: true,
    legacyHeaders: false,
});

export const authRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    message: { error: "Too many attempts, try again later" },
    standardHeaders: true,
    legacyHeaders: false,
});

// Va por IP y todo el personal de una barbería suele salir a internet por la
// misma (mismo WiFi): con 60/min, una sola carga de la agenda (varias semanas
// + horarios + servicios) y dos barberos a la vez ya devolvían 429 y el
// dashboard fallaba al crear turnos. Estas rutas exigen login igual.
export const staffActionsRateLimit = rateLimit({
    windowMs: 60 * 1000,
    limit: 300,
    message: { error: "Too many requests, slow down" },
    standardHeaders: true,
    legacyHeaders: false,
});

// For unauthenticated, publicly reachable GET endpoints (barber listing,
// slot availability) — no auth to key off of, so this is the only backstop
// against scraping/DoS. Higher ceiling than staff limits since real
// anonymous booking-flow traffic (page loads, slot polling) is bursty.
export const publicRateLimit = rateLimit({
    windowMs: 60 * 1000,
    limit: 100,
    message: { error: "Too many requests, slow down" },
    standardHeaders: true,
    legacyHeaders: false,
});
