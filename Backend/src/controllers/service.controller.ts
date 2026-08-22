import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import {
    createService,
    findActiveServicesByBarber,
    findAllServices,
    updateService,
} from "../models/service.model";
import { parsePositiveIntParam } from "../utils/validators";

export const createServiceHandler = async (req: AuthRequest, res: Response) => {
    const { name, description, price, duration_minutes, active } = req.body;
    const id = await createService({ name, description, price, duration_minutes, active });
    return res.status(201).json({ id });
};

export const listServicesAdminHandler = async (_req: AuthRequest, res: Response) => {
    const services = await findAllServices();
    return res.json(services);
};

export const updateServiceHandler = async (req: AuthRequest, res: Response) => {
    const id = parsePositiveIntParam(req.params.id);
    if (id === null) {
        return res.status(400).json({ error: "Invalid service id" });
    }

    await updateService(id, req.body);
    return res.json({ message: "Service updated" });
};

export const listServicesByBarberHandler = async (req: AuthRequest, res: Response) => {
    const barberId = parsePositiveIntParam(req.params.barberId);
    if (barberId === null) {
        return res.status(400).json({ error: "Invalid barber id" });
    }

    const services = await findActiveServicesByBarber(barberId);
    return res.json(services);
};
