import { Request, Response } from "express";
import { findPublicBarbers } from "../models/public.model";
export const getPublicBarbers = async (_req: Request, res: Response) => {
    const barbers = await findPublicBarbers();
    return res.json(barbers);
};
