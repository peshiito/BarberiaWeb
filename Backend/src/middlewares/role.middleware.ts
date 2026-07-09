import { NextFunction, Response } from "express";
import { Role } from "../types/user.types";
import { AuthRequest } from "./auth.middleware";

export const authorize = (...roles: Role[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ error: "Forbidden" });
        }
        next();
    };
};
