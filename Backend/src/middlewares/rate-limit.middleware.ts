import rateLimit from "express-rate-limit";

export const appointmentsRateLimit = rateLimit({
    windowMs: 60 * 1000,
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

// Separate instance (own counter) from authRateLimit so that staff login
// attempts and client self-registration/login don't share the same bucket
// and lock each other out.
export const clientRegisterRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    message: { error: "Too many attempts, try again later" },
    standardHeaders: true,
    legacyHeaders: false,
});

// Propio contador, separado de clientRegisterRateLimit y de authRateLimit:
// login/claim de cliente ahora comparan contraseña (bcrypt), así que
// necesitan su propio backstop contra fuerza bruta sin compartir cupo con el
// registro ni con el login de staff.
export const clientLoginRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    message: { error: "Too many attempts, try again later" },
    standardHeaders: true,
    legacyHeaders: false,
});

export const staffActionsRateLimit = rateLimit({
    windowMs: 60 * 1000,
    limit: 60,
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
