import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { AuthRequest } from "../middlewares/auth.middleware";
import { findAppointmentsByClient, findAppointmentsByClientAndBarber } from "../models/appointment.model";
import {
    findClientById,
    findOrCreateClient,
    listClientsPaginated,
    searchClientsPaginated,
    updateClient,
} from "../models/client.model";
import { getPagination } from "../utils/pagination";
import { parsePositiveIntParam } from "../utils/validators";
import { ClientInput, ClientJwtPayload, ClientUpdateInput } from "../types/client.types";

const JWT_SECRET = process.env.JWT_SECRET as string;

export const registerOrLoginClient = async (req: Request, res: Response) => {
    const { first_name, last_name, phone } = req.body as ClientInput;

    const { client, created } = await findOrCreateClient({ first_name, last_name, phone });

    const payload: ClientJwtPayload = { clientId: client.id, type: "client" };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "30d" });

    return res.status(created ? 201 : 200).json({ token, client });
};

export const listClients = async (req: Request, res: Response) => {
    const { page, limit, offset } = getPagination(req);
    const { clients, total } = await listClientsPaginated(limit, offset);

    return res.json({
        data: clients,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
};

export const searchClients = async (req: Request, res: Response) => {
    const q = ((req.query.q as string) || "").trim();
    if (!q) {
        return res.status(400).json({ error: "Missing search query" });
    }

    const { page, limit, offset } = getPagination(req);
    const { clients, total } = await searchClientsPaginated(q, limit, offset);

    return res.json({
        data: clients,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
};

export const getClientByIdHandler = async (req: Request, res: Response) => {
    const clientId = parsePositiveIntParam(req.params.id);
    if (clientId === null) {
        return res.status(400).json({ error: "Invalid client id" });
    }

    const client = await findClientById(clientId);
    if (!client) {
        return res.status(404).json({ error: "Client not found" });
    }

    return res.json(client);
};

export const createClientByStaff = async (req: Request, res: Response) => {
    const { first_name, last_name, phone } = req.body as ClientInput;
    const { client, created } = await findOrCreateClient({ first_name, last_name, phone });

    return res.status(created ? 201 : 200).json({ client, created });
};

export const updateClientByStaff = async (req: AuthRequest, res: Response) => {
    const clientId = parsePositiveIntParam(req.params.id);
    if (clientId === null) {
        return res.status(400).json({ error: "Invalid client id" });
    }

    const data = req.body as ClientUpdateInput;

    if (req.user!.role === "barber" && data.phone !== undefined) {
        return res.status(403).json({ error: "Barbers cannot modify a client's phone number" });
    }

    const existing = await findClientById(clientId);
    if (!existing) {
        return res.status(404).json({ error: "Client not found" });
    }

    await updateClient(clientId, data);
    const updated = await findClientById(clientId);
    return res.json(updated);
};

export const getClientHistory = async (req: AuthRequest, res: Response) => {
    const clientId = parsePositiveIntParam(req.params.id);
    if (clientId === null) {
        return res.status(400).json({ error: "Invalid client id" });
    }

    const client = await findClientById(clientId);
    if (!client) {
        return res.status(404).json({ error: "Client not found" });
    }

    const appointments =
        req.user!.role === "barber"
            ? await findAppointmentsByClientAndBarber(clientId, req.user!.id)
            : await findAppointmentsByClient(clientId);

    return res.json(appointments);
};
