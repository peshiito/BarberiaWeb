import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import {
    createMovementTx,
    deleteMovementTx,
    findMovementById,
    getCashBalance,
    getLedger,
    getPeriodBreakdown,
} from "../models/cash.model";
import { getPagination } from "../utils/pagination";
import { parseDateRange, todayIso } from "../utils/dateRange";
import { parsePositiveIntParam } from "../utils/validators";

export const getCashSummary = async (req: AuthRequest, res: Response) => {
    const range = parseDateRange(req.query.from, req.query.to);
    if ("error" in range) {
        return res.status(400).json({ error: range.error });
    }
    const [balance, period] = await Promise.all([getCashBalance(range.to), getPeriodBreakdown(range.from, range.to)]);
    return res.json({ ...range, balance, period });
};

export const getCashLedger = async (req: AuthRequest, res: Response) => {
    const range = parseDateRange(req.query.from, req.query.to);
    if ("error" in range) {
        return res.status(400).json({ error: range.error });
    }
    const direction = req.query.direction;
    if (direction !== undefined && direction !== "in" && direction !== "out") {
        return res.status(400).json({ error: "Invalid direction. Expected in or out" });
    }
    const method = req.query.method;
    if (method !== undefined && method !== "cash" && method !== "transfer") {
        return res.status(400).json({ error: "Invalid method. Expected cash or transfer" });
    }

    const { page, limit, offset } = getPagination(req);
    const { entries, total } = await getLedger({ ...range, direction, method, limit, offset });
    return res.json({
        data: entries,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
};

export const createMovement = async (req: AuthRequest, res: Response) => {
    if (req.body.occurred_on > todayIso()) {
        return res.status(400).json({ error: "A cash movement cannot be dated in the future" });
    }
    const result = await createMovementTx({ ...req.body, created_by: req.user!.id });
    if (!result.ok) {
        return res.status(result.status).json({ error: result.error });
    }
    const movement = await findMovementById(result.value);
    return res.status(201).json(movement);
};

export const removeMovement = async (req: AuthRequest, res: Response) => {
    const id = parsePositiveIntParam(req.params.id);
    if (id === null) {
        return res.status(400).json({ error: "Invalid cash movement id" });
    }
    const result = await deleteMovementTx(id);
    if (!result.ok) {
        return res.status(result.status).json({ error: result.error });
    }
    return res.json({ message: "Cash movement deleted" });
};
