import { NextFunction, Request, Response } from "express";
import { createRateLimiter } from "../config/rateLimit";

export const rateLimitMiddleware = (windowMs?: number, max?: number) => {
    const limiter = createRateLimiter(windowMs, max);
    return (req: Request, res: Response, next: NextFunction) => {
        return limiter(req, res, next);
    };
};
