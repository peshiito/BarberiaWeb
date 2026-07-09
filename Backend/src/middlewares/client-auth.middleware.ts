import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { ClientJwtPayload } from "../types/client.types";

const JWT_SECRET = process.env.JWT_SECRET as string;

export interface ClientAuthRequest extends Request {
    client?: ClientJwtPayload;
}

export const authenticateClient = (req: ClientAuthRequest, res: Response, next: NextFunction) => {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
        return res.status(401).json({ error: "No token provided" });
    }

    const token = header.split(" ")[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as ClientJwtPayload;
        if (decoded.type !== "client") {
            return res.status(401).json({ error: "Invalid token type" });
        }
        req.client = decoded;
        next();
    } catch {
        return res.status(401).json({ error: "Invalid or expired token" });
    }
};
