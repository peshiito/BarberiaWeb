import bcrypt from "bcrypt";
import { Request, Response } from "express";
import { RowDataPacket } from "mysql2";
import pool from "../config/db";
import { AuthRequest } from "../middlewares/auth.middleware";
import { createUser, findByEmail, listUsersPaginated } from "../models/user.model";
import { getPagination } from "../utils/pagination";
import { isValidCalendarDate } from "../utils/validators";

const parseDateRange = (from: unknown, to: unknown): { error: string } | { from: string; to: string } => {
    if (!from || !to) {
        return { error: "Missing from/to date range" };
    }
    if (typeof from !== "string" || typeof to !== "string" || !isValidCalendarDate(from) || !isValidCalendarDate(to)) {
        return { error: "Invalid date format. Expected YYYY-MM-DD" };
    }
    if (from > to) {
        return { error: "'from' date must not be after 'to' date" };
    }
    return { from, to };
};

const FINANCE_BUCKETS = ["day", "week", "month"] as const;
type FinanceBucket = (typeof FINANCE_BUCKETS)[number];

const isFinanceBucket = (value: unknown): value is FinanceBucket =>
    typeof value === "string" && (FINANCE_BUCKETS as readonly string[]).includes(value);

export const createBarber = async (req: AuthRequest, res: Response) => {
    const { first_name, last_name, email, password, role, bio, service_price, earnings_split_percentage } = req.body;

    if (role !== "barber" && req.user!.role !== "admin") {
        return res.status(403).json({ error: "Only admins can create admin or admin_barber accounts" });
    }

    const existing = await findByEmail(email);
    if (existing) {
        return res.status(409).json({ error: "Email already registered" });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const id = await createUser({
        first_name,
        last_name,
        email,
        password_hash,
        role,
        bio,
        service_price,
        earnings_split_percentage,
    });

    return res.status(201).json({ id });
};

export const getAllUsers = async (req: Request, res: Response) => {
    const { page, limit, offset } = getPagination(req);
    const { users, total } = await listUsersPaginated(limit, offset);
    const sanitized = users.map(({ password_hash, ...rest }) => rest);

    return res.json({
        data: sanitized,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    });
};

export const getFinancialSummary = async (req: Request, res: Response) => {
    const range = parseDateRange(req.query.from, req.query.to);
    if ("error" in range) {
        return res.status(400).json({ error: range.error });
    }
    const { from, to } = range;

    const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT
      u.id as barber_id,
      u.first_name,
      u.last_name,
      u.earnings_split_percentage,
      COUNT(a.id) as total_appointments,
      COALESCE(SUM(a.price), 0) as total_revenue
     FROM users u
     LEFT JOIN appointments a
       ON a.barber_id = u.id
       AND a.status = 'completed'
       AND a.date BETWEEN ? AND ?
     WHERE u.role IN ('barber', 'admin_barber')
     GROUP BY u.id`,
        [from, to],
    );

    const summary = rows.map((r: any) => {
        const barberEarnings = (r.total_revenue * r.earnings_split_percentage) / 100;
        const shopEarnings = r.total_revenue - barberEarnings;
        return {
            barber_id: r.barber_id,
            name: `${r.first_name} ${r.last_name}`,
            total_appointments: r.total_appointments,
            total_revenue: r.total_revenue,
            barber_earnings: barberEarnings,
            shop_earnings: shopEarnings,
        };
    });

    return res.json(summary);
};

export const getFinancialPeriod = async (req: Request, res: Response) => {
    const range = parseDateRange(req.query.from, req.query.to);
    if ("error" in range) {
        return res.status(400).json({ error: range.error });
    }
    const { from, to } = range;

    const [rows] = await pool.query<RowDataPacket[]>(
        `WITH barber_earnings AS (
      SELECT
        u.id as barber_id,
        u.earnings_split_percentage,
        COUNT(a.id) as total_appointments,
        COALESCE(SUM(a.price), 0) as total_revenue,
        COALESCE(SUM(a.price), 0) * u.earnings_split_percentage / 100 as barber_earnings,
        COALESCE(SUM(a.price), 0) - (COALESCE(SUM(a.price), 0) * u.earnings_split_percentage / 100) as shop_earnings
      FROM users u
      LEFT JOIN appointments a
        ON a.barber_id = u.id
        AND a.status = 'completed'
        AND a.date BETWEEN ? AND ?
      WHERE u.role IN ('barber', 'admin_barber')
      GROUP BY u.id
    )
    SELECT
      COALESCE(SUM(be.total_revenue), 0) as total_revenue,
      COALESCE(SUM(be.barber_earnings), 0) as total_barber_earnings,
      COALESCE(SUM(be.shop_earnings), 0) as total_shop_earnings,
      COUNT(DISTINCT CASE WHEN be.total_appointments > 0 THEN be.barber_id END) as active_barbers,
      COALESCE(SUM(be.total_appointments), 0) as total_appointments
    FROM barber_earnings be`,
        [from, to],
    );

    const periodData = {
        from,
        to,
        total_revenue: rows[0]?.total_revenue || 0,
        total_barber_earnings: rows[0]?.total_barber_earnings || 0,
        total_shop_earnings: rows[0]?.total_shop_earnings || 0,
        active_barbers: rows[0]?.active_barbers || 0,
        total_appointments: rows[0]?.total_appointments || 0,
    };

    return res.json(periodData);
};

// Serie temporal agregada en una sola query, en vez de que el frontend arme
// el gráfico de evolución pidiendo /finance/period una vez por día/semana/mes
// del rango (hasta ~17 requests en paralelo por carga de Finanzas, lo que
// puede disparar `staffActionsRateLimit` con uso normal-intensivo). El
// bucket_key coincide con la convención de semana/mes ya usada en el resto
// del backend y del frontend (semana = lunes a domingo vía WEEKDAY(), que es
// 0 para lunes; mes = calendario). Solo devuelve buckets con al menos un
// turno completado — el frontend rellena los huecos con cero para no perder
// continuidad en el gráfico.
export const getFinancialSeries = async (req: Request, res: Response) => {
    const range = parseDateRange(req.query.from, req.query.to);
    if ("error" in range) {
        return res.status(400).json({ error: range.error });
    }
    const { from, to } = range;

    const bucket = req.query.bucket;
    if (!isFinanceBucket(bucket)) {
        return res.status(400).json({ error: "Invalid bucket. Expected one of: day, week, month" });
    }

    const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT
      bucket_key,
      COALESCE(SUM(revenue), 0) as total_revenue,
      COALESCE(SUM(barber_earnings), 0) as total_barber_earnings,
      COALESCE(SUM(revenue) - SUM(barber_earnings), 0) as total_shop_earnings,
      COUNT(*) as total_appointments
     FROM (
       SELECT
         a.price as revenue,
         (a.price * u.earnings_split_percentage / 100) as barber_earnings,
         CASE
           WHEN ? = 'day' THEN DATE(a.date)
           WHEN ? = 'week' THEN DATE_SUB(a.date, INTERVAL WEEKDAY(a.date) DAY)
           ELSE DATE_FORMAT(a.date, '%Y-%m-01')
         END as bucket_key
       FROM appointments a
       JOIN users u ON u.id = a.barber_id
       WHERE a.status = 'completed' AND a.date BETWEEN ? AND ?
     ) bucketed
     GROUP BY bucket_key
     ORDER BY bucket_key`,
        [bucket, bucket, from, to],
    );

    const data = rows.map((r: any) => ({
        bucket_start: typeof r.bucket_key === "string" ? r.bucket_key : r.bucket_key.toISOString().slice(0, 10),
        total_revenue: r.total_revenue,
        total_barber_earnings: r.total_barber_earnings,
        total_shop_earnings: r.total_shop_earnings,
        total_appointments: r.total_appointments,
    }));

    return res.json({ from, to, bucket, data });
};