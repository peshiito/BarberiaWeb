import { Request, Response } from "express";
import { findPublicBarbers } from "../models/public.model";
import { findActiveServices } from "../models/service.model";

export const getPublicBarbers = async (_req: Request, res: Response) => {
    const barbers = await findPublicBarbers();
    return res.json(barbers);
};

export const getPublicServices = async (_req: Request, res: Response) => {
    const services = await findActiveServices();
    return res.json(services);
};
