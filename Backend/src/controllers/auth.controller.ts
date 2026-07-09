import bcrypt from "bcrypt";
import { Request, Response } from "express";
import jwt, { SignOptions } from "jsonwebtoken";
import { createUser, findByEmail } from "../models/user.model";
import { JwtPayload, LoginInput, RegisterInput } from "../types/auth.types";

const JWT_SECRET = process.env.JWT_SECRET as string;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

export const register = async (req: Request, res: Response) => {
    const { first_name, last_name, email, password, role, bio } = req.body as RegisterInput;

    if (!first_name || !last_name || !email || !password || !role) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    const existing = await findByEmail(email);
    if (existing) {
        return res.status(409).json({ error: "Email already registered" });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const userId = await createUser({
        first_name,
        last_name,
        email,
        password_hash,
        role,
        bio,
    });

    return res.status(201).json({ id: userId });
};

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
