import bcrypt from "bcrypt";
import fs from "fs";
import path from "path";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { AuthRequest } from "../middlewares/auth.middleware";
import { ClientAuthRequest } from "../middlewares/client-auth.middleware";
import { findAppointmentsByClient, findAppointmentsByClientAndBarber } from "../models/appointment.model";
import {
    createClient,
    findClientById,
    findClientByPhone,
    findOrCreateClient,
    listClientsPaginated,
    searchClientsPaginated,
    setClientPhoto,
    updateClient,
    updateClientPassword,
} from "../models/client.model";
import { hasValidImageSignature } from "../utils/fileSignature";
import { getPagination } from "../utils/pagination";
import { parsePositiveIntParam } from "../utils/validators";
import { Client, ClientInput, ClientJwtPayload, ClientUpdateInput, SafeClient } from "../types/client.types";

const JWT_SECRET = process.env.JWT_SECRET as string;

// Valid bcrypt hash of a random value, used only to keep the timing of a
// failed client login constant regardless of whether the phone exists or the
// account is a legacy (passwordless) one — same rationale as auth.controller.
const DUMMY_HASH = "$2b$10$CwTycUXWue0Thq9StjUM0uJ8p4a1uy9C8jXO5C0dqO4E7T5vw9F.G";

// Every response that carries a client row must go through this — the model
// layer still does SELECT * (see client.model.ts), so nothing else strips
// password_hash before it reaches JSON.
const sanitizeClient = (client: Client): SafeClient => {
    const { password_hash, ...safe } = client;
    return safe;
};

export const registerClient = async (req: Request, res: Response) => {
    const { first_name, last_name, phone, password } = req.body as ClientInput & { password: string };

    const existing = await findClientByPhone(phone);
    if (existing) {
        return res.status(409).json({ error: "Phone already registered" });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const id = await createClient({ first_name, last_name, phone, password_hash });
    const client = await findClientById(id);

    const payload: ClientJwtPayload = { clientId: client!.id, type: "client" };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "30d" });

    return res.status(201).json({ token, client: sanitizeClient(client!) });
};

export const loginClient = async (req: Request, res: Response) => {
    const { phone, password } = req.body as { phone: string; password: string };

    const client = await findClientByPhone(phone);

    if (client && !client.password_hash) {
        // Cuenta creada antes de que existiera password (o de alta por
        // staff): no hay hash contra el que comparar. Se devuelve un error
        // distinto (no 401 genérico) para que el frontend pueda ofrecer el
        // flujo de reclamo en vez de un simple "credenciales inválidas".
        return res.status(409).json({ error: "legacy_account" });
    }

    const valid = await bcrypt.compare(password, client?.password_hash || DUMMY_HASH);
    if (!client || !valid) {
        return res.status(401).json({ error: "Invalid credentials" });
    }

    const payload: ClientJwtPayload = { clientId: client.id, type: "client" };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "30d" });

    return res.json({ token, client: sanitizeClient(client) });
};

export const claimLegacyClient = async (req: Request, res: Response) => {
    const { first_name, last_name, phone, password } = req.body as {
        first_name: string;
        last_name: string;
        phone: string;
        password: string;
    };

    const client = await findClientByPhone(phone);
    if (
        !client ||
        client.first_name.toLowerCase() !== first_name.toLowerCase() ||
        client.last_name.toLowerCase() !== last_name.toLowerCase()
    ) {
        return res.status(404).json({ error: "Client not found" });
    }

    if (client.password_hash) {
        return res.status(409).json({ error: "Account already claimed" });
    }

    const password_hash = await bcrypt.hash(password, 10);
    await updateClientPassword(client.id, password_hash);

    const payload: ClientJwtPayload = { clientId: client.id, type: "client" };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "30d" });

    return res.json({ token, client: sanitizeClient({ ...client, password_hash }) });
};

export const uploadClientPhoto = async (req: ClientAuthRequest, res: Response) => {
    const clientId = req.client!.clientId;

    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }

    const ext = path.extname(req.file.filename);
    if (!hasValidImageSignature(req.file.path, ext)) {
        fs.unlink(req.file.path, () => {});
        return res.status(400).json({ error: "Invalid file type" });
    }

    const url = `/uploads/${req.file.filename}`;
    await setClientPhoto(clientId, url);

    return res.status(201).json({ url });
};

export const listClients = async (req: Request, res: Response) => {
    const { page, limit, offset } = getPagination(req);
    const { clients, total } = await listClientsPaginated(limit, offset);

    return res.json({
        data: clients.map(sanitizeClient),
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
        data: clients.map(sanitizeClient),
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

    return res.json(sanitizeClient(client));
};

export const createClientByStaff = async (req: Request, res: Response) => {
    const { first_name, last_name, phone } = req.body as ClientInput;
    const { client, created } = await findOrCreateClient({ first_name, last_name, phone });

    return res.status(created ? 201 : 200).json({ client: sanitizeClient(client), created });
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
    return res.json(sanitizeClient(updated!));
};

export const updateMyClientProfile = async (req: ClientAuthRequest, res: Response) => {
    const clientId = req.client!.clientId;
    const data = req.body as ClientUpdateInput;

    const existing = await findClientById(clientId);
    if (!existing) {
        return res.status(404).json({ error: "Client not found" });
    }

    await updateClient(clientId, data);
    const updated = await findClientById(clientId);
    return res.json(sanitizeClient(updated!));
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
