import bcrypt from "bcrypt";
import { Request, Response } from "express";
import jwt, { SignOptions } from "jsonwebtoken";
import { findByEmail } from "../models/user.model";
import { JwtPayload, LoginInput } from "../types/auth.types";

const JWT_SECRET = process.env.JWT_SECRET as string;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body as LoginInput;

    if (!email || !password) {
        return res.status(400).json({ error: "Missing email or password" });
    }

    const user = await findByEmail(email);
    if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
        return res.status(401).json({ error: "Invalid credentials" });
    }

    const payload: JwtPayload = { id: user.id, role: user.role };
    const options: SignOptions = { expiresIn: JWT_EXPIRES_IN as any };
    const token = jwt.sign(payload, JWT_SECRET, options);

    return res.json({
        token,
        user: {
            id: user.id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            role: user.role,
        },
    });
};
