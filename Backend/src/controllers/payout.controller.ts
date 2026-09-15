import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import {
    createAdvance,
    createPayoutTx,
    deletePayout,
    deletePendingAdvance,
    findAdvanceById,
    findPayoutById,
    findPayoutItems,
    findPendingDetail,
    findPendingPayouts,
    findStaffBarber,
    listAdvances,
    listPayouts,
} from "../models/payout.model";
import { parseDateRange, roundMoney, todayIso } from "../utils/dateRange";
import { isValidCalendarDate, parsePositiveIntParam } from "../utils/validators";

const parseUpTo = (raw: unknown): string | null => {
    if (raw === undefined) return todayIso();
    return typeof raw === "string" && isValidCalendarDate(raw) ? raw : null;
};

export const getPendingPayouts = async (req: AuthRequest, res: Response) => {
    const upTo = parseUpTo(req.query.up_to);
    if (!upTo) {
        return res.status(400).json({ error: "Invalid up_to date. Expected YYYY-MM-DD" });
    }
    const barbers = await findPendingPayouts(upTo);
    const totals = barbers.reduce(
        (acc, b) => ({
            services_count: acc.services_count + b.services_count,
            services_earnings: roundMoney(acc.services_earnings + b.services_earnings),
            commissions_amount: roundMoney(acc.commissions_amount + b.commissions_amount),
            advances_amount: roundMoney(acc.advances_amount + b.advances_amount),
            net_amount: roundMoney(acc.net_amount + Math.max(0, b.net_amount)),
        }),
        { services_count: 0, services_earnings: 0, commissions_amount: 0, advances_amount: 0, net_amount: 0 },
    );
    return res.json({ up_to: upTo, barbers, totals });
};

export const getPendingPayoutDetail = async (req: AuthRequest, res: Response) => {
    const barberId = parsePositiveIntParam(req.params.barberId);
    if (barberId === null) {
        return res.status(400).json({ error: "Invalid barber id" });
    }
    const upTo = parseUpTo(req.query.up_to);
    if (!upTo) {
        return res.status(400).json({ error: "Invalid up_to date. Expected YYYY-MM-DD" });
    }
    const barber = await findStaffBarber(barberId);
    if (!barber) {
        return res.status(404).json({ error: "Barber not found" });
    }

    const detail = await findPendingDetail(barberId, upTo);
    const servicesEarnings = roundMoney(detail.appointments.reduce((sum, a: any) => sum + a.earnings, 0));
    const servicesRevenue = roundMoney(detail.appointments.reduce((sum, a: any) => sum + a.price, 0));
    const commissions = roundMoney(detail.sales.reduce((sum, s: any) => sum + s.commission_amount, 0));
    const advances = roundMoney(detail.advances.reduce((sum, a: any) => sum + a.amount, 0));

    return res.json({
        barber,
        up_to: upTo,
        ...detail,
        totals: {
            services_count: detail.appointments.length,
            services_revenue: servicesRevenue,
            services_earnings: servicesEarnings,
            sales_count: detail.sales.length,
            commissions_amount: commissions,
            advances_amount: advances,
            net_amount: roundMoney(servicesEarnings + commissions - advances),
        },
    });
};

export const createPayout = async (req: AuthRequest, res: Response) => {
    const { barber_id, up_to, payment_method, note } = req.body;
    if (up_to > todayIso()) {
        return res.status(400).json({ error: "Cannot pay work dated in the future" });
    }
    const barber = await findStaffBarber(barber_id);
    if (!barber) {
        return res.status(404).json({ error: "Barber not found" });
    }

    const result = await createPayoutTx({ barber_id, up_to, payment_method, note, created_by: req.user!.id });
    if (!result.ok) {
        return res.status(result.status).json({ error: result.error });
    }
    const payout = await findPayoutById(result.value);
    return res.status(201).json(payout);
};

export const getPayouts = async (req: AuthRequest, res: Response) => {
    const range = parseDateRange(req.query.from, req.query.to);
    if ("error" in range) {
        return res.status(400).json({ error: range.error });
    }
    const barberId = req.query.barber_id ? parsePositiveIntParam(req.query.barber_id as string) : undefined;
    if (barberId === null) {
        return res.status(400).json({ error: "Invalid barber id" });
    }
    const payouts = await listPayouts({ ...range, barberId });
    return res.json(payouts);
};

export const getPayout = async (req: AuthRequest, res: Response) => {
    const id = parsePositiveIntParam(req.params.id);
    if (id === null) {
        return res.status(400).json({ error: "Invalid payout id" });
    }
    const payout = await findPayoutById(id);
    if (!payout) {
        return res.status(404).json({ error: "Payout not found" });
    }
    const items = await findPayoutItems(id);
    return res.json({ ...payout, ...items });
};

export const removePayout = async (req: AuthRequest, res: Response) => {
    const id = parsePositiveIntParam(req.params.id);
    if (id === null) {
        return res.status(400).json({ error: "Invalid payout id" });
    }
    const deleted = await deletePayout(id);
    if (!deleted) {
        return res.status(404).json({ error: "Payout not found" });
    }
    return res.json({ message: "Payout voided" });
};

export const createAdvanceHandler = async (req: AuthRequest, res: Response) => {
    const { barber_id, amount, payment_method, given_on, note } = req.body;
    if (given_on > todayIso()) {
        return res.status(400).json({ error: "An advance cannot be dated in the future" });
    }
    const barber = await findStaffBarber(barber_id);
    if (!barber) {
        return res.status(404).json({ error: "Barber not found" });
    }
    const id = await createAdvance({ barber_id, amount, payment_method, given_on, note, created_by: req.user!.id });
    const advance = await findAdvanceById(id);
    return res.status(201).json(advance);
};

export const getAdvances = async (req: AuthRequest, res: Response) => {
    const barberId = req.query.barber_id ? parsePositiveIntParam(req.query.barber_id as string) : undefined;
    if (barberId === null) {
        return res.status(400).json({ error: "Invalid barber id" });
    }
    const advances = await listAdvances({ barberId, pendingOnly: req.query.status !== "all" });
    return res.json(advances);
};

export const removeAdvance = async (req: AuthRequest, res: Response) => {
    const id = parsePositiveIntParam(req.params.id);
    if (id === null) {
        return res.status(400).json({ error: "Invalid advance id" });
    }
    const advance = await findAdvanceById(id);
    if (!advance) {
        return res.status(404).json({ error: "Advance not found" });
    }
    const deleted = await deletePendingAdvance(id);
    if (!deleted) {
        return res.status(409).json({ error: "This advance was already deducted in a payout" });
    }
    return res.json({ message: "Advance deleted" });
};
