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
