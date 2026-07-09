import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { createClient, findClientByPhone } from "../models/client.model";
import { ClientInput, ClientJwtPayload } from "../types/client.types";

const JWT_SECRET = process.env.JWT_SECRET as string;

export const registerOrLoginClient = async (req: Request, res: Response) => {
    const { first_name, last_name, phone } = req.body as ClientInput;

    if (!first_name || !last_name || !phone) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    let client = await findClientByPhone(phone);

    if (!client) {
        const id = await createClient({ first_name, last_name, phone });
        client = { id, first_name, last_name, phone, created_at: new Date() };
    }

    const payload: ClientJwtPayload = { clientId: client.id, type: "client" };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "30d" });

    return res.json({ token, client });
};
