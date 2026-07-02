import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";

export interface AuthRequest extends Request {
    userId?: number;
    userRole?: string;
    userType?: "admin" | "barber" | "client";
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ error: "Token no proporcionado" });
    }

    try {
        const decoded = jwt.verify(token, env.JWT_SECRET) as any;
        req.userId = decoded.userId;
        req.userRole = decoded.role;
        req.userType = decoded.type;
        next();
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            return res.status(401).json({ error: "Token expirado" });
        }
        return res.status(401).json({ error: "Token inválido" });
    }
};

export const adminOnly = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.userRole !== "admin") {
        return res.status(403).json({ error: "Acceso solo administradores" });
    }
    next();
};

export const barberOnly = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.userRole !== "barber") {
        return res.status(403).json({ error: "Acceso solo barberos" });
    }
    next();
};

export const clientOnly = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.userType !== "client") {
        return res.status(403).json({ error: "Acceso solo clientes" });
    }
    next();
};
