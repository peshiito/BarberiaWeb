import bcrypt from "bcrypt";
import { Request, Response } from "express";
import jwt, { SignOptions } from "jsonwebtoken";
import { findByEmail } from "../models/user.model";
import { JwtPayload, LoginInput } from "../types/auth.types";

const JWT_SECRET = process.env.JWT_SECRET as string;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

// Valid bcrypt hash of a random value, used only to keep the timing of a
// failed login constant whether or not the email exists (avoids user
// enumeration via response-time side channel).
const DUMMY_HASH = "$2b$10$CwTycUXWue0Thq9StjUM0uJ8p4a1uy9C8jXO5C0dqO4E7T5vw9F.G";

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body as LoginInput;

    const user = await findByEmail(email);
    const valid = await bcrypt.compare(password, user?.password_hash || DUMMY_HASH);
    if (!user || !valid) {
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
