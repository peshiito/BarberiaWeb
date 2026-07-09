import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JwtPayload } from "../types/auth.types";

const JWT_SECRET = process.env.JWT_SECRET as string;

export interface AuthRequest extends Request {
    user?: JwtPayload;
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
        return res.status(401).json({ error: "No token provided" });
    }

    const token = header.split(" ")[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
        req.user = decoded;
        next();
    } catch {
        return res.status(401).json({ error: "Invalid or expired token" });
    }
};
