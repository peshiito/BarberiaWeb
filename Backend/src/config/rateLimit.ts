// backend/src/config/rateLimit.ts
import rateLimit from "express-rate-limit";
import { env } from "./env";

export const createRateLimiter = (
    windowMs: number = env.RATE_LIMIT_WINDOW * 60 * 1000,
    max: number = env.RATE_LIMIT_MAX,
) => {
    return rateLimit({
        windowMs,
        max,
        message: {
            error: "Demasiadas peticiones, intenta más tarde",
            retryAfter: Math.ceil(windowMs / 60000),
        },
        standardHeaders: true,
        legacyHeaders: false,
        skip: req => req.ip === "127.0.0.1",
    });
};

export const authRateLimiter = createRateLimiter(15 * 60 * 1000, 5);
export const appointmentRateLimiter = createRateLimiter(60 * 60 * 1000, 10);
export const apiRateLimiter = createRateLimiter(15 * 60 * 1000, 100);
