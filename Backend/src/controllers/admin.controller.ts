import bcrypt from "bcrypt";
import { Request, Response } from "express";
import { RowDataPacket } from "mysql2";
import pool from "../config/db";
import { AuthRequest } from "../middlewares/auth.middleware";
import { findAllBarberServiceLinks, replaceBarberServices } from "../models/service.model";
import { createUser, deleteUser, findByEmail, findById, listUsersPaginated, updateBarberByAdmin } from "../models/user.model";
import { parseDateRange } from "../utils/dateRange";
import { getPagination } from "../utils/pagination";
import { parsePositiveIntParam } from "../utils/validators";

// Porcentaje congelado al completar el turno; los turnos viejos usan el actual.
const SPLIT = "COALESCE(a.barber_split_percentage, u.earnings_split_percentage)";

const FINANCE_BUCKETS = ["day", "week", "month"] as const;
type FinanceBucket = (typeof FINANCE_BUCKETS)[number];

const isFinanceBucket = (value: unknown): value is FinanceBucket =>
    typeof value === "string" && (FINANCE_BUCKETS as readonly string[]).includes(value);

export const createBarber = async (req: AuthRequest, res: Response) => {
    const {
        first_name,
        last_name,
        email,
        password,
        role,
        bio,
        earnings_split_percentage,
        service_ids,
        phone,
        social_media,
        birth_date,
        address,
    } = req.body;

    // La ruta ya exige rol admin o admin_barber: los dos administran el equipo
    // por igual (antes solo "admin" podía crear administradores y, como la
    // cuenta principal es admin_barber, nadie podía hacerlo).
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
        earnings_split_percentage,
        phone,
        social_media,
        birth_date,
        address,
    });

    // Sin servicios asignados un barbero no puede recibir turnos (ni desde la
    // reserva pública ni desde el dashboard), así que se asignan en el alta.
    if (role !== "admin" && Array.isArray(service_ids) && service_ids.length > 0) {
        await replaceBarberServices(id, service_ids);
    }

    return res.status(201).json({ id });
};

export const updateBarber = async (req: AuthRequest, res: Response) => {
    const id = parsePositiveIntParam(req.params.id);
    if (id === null) {
        return res.status(400).json({ error: "Invalid barber id" });
    }

    const target = await findById(id);
    if (!target) {
        return res.status(404).json({ error: "User not found" });
    }

    const {
        first_name,
        last_name,
        bio,
        role,
        earnings_split_percentage,
        service_ids,
        phone,
        social_media,
        birth_date,
        address,
    } = req.body;

    // Nadie cambia su propio rol: evita que el último administrador se quite
    // el acceso al panel por error.
    if (id === req.user!.id && role !== undefined && role !== target.role) {
        return res.status(403).json({ error: "You cannot change your own role" });
    }

    await updateBarberByAdmin(id, {
        first_name,
        last_name,
        bio,
        role,
        earnings_split_percentage,
        phone,
        social_media,
        birth_date,
        address,
    });

    if (service_ids !== undefined) {
        await replaceBarberServices(id, service_ids);
    }

    return res.json({ message: "Barber updated" });
};

export const deleteBarber = async (req: AuthRequest, res: Response) => {
    const id = parsePositiveIntParam(req.params.id);
    if (id === null) {
        return res.status(400).json({ error: "Invalid barber id" });
    }

    if (id === req.user!.id) {
        return res.status(400).json({ error: "You cannot delete your own account" });
    }

    const target = await findById(id);
    if (!target) {
        return res.status(404).json({ error: "User not found" });
    }

    // Borrar a alguien del equipo es de alto impacto (se pierden turnos, fotos y
    // horarios en cascada, o el acceso de un administrador), así que siempre se
    // re-pide la contraseña de quien ejecuta el borrado.
    {
        const { password } = req.body as { password?: string };
        if (!password) {
            return res.status(400).json({ error: "Password confirmation required to delete a barber" });
        }
        const actingUser = await findById(req.user!.id);
        const validPassword = actingUser && (await bcrypt.compare(password, actingUser.password_hash));
        if (!validPassword) {
            // 403, no 401: acá el token sigue siendo válido, lo que falló es
            // la confirmación de contraseña. El dashboard trata cualquier 401
            // como "sesión expirada" y desloguea — un 401 acá cerraría la
            // sesión del admin en vez de solo rechazar el borrado.
            return res.status(403).json({ error: "Incorrect password" });
        }
    }

    await deleteUser(id);
    return res.json({ message: "User deleted" });
};

export const getAllUsers = async (req: Request, res: Response) => {
    const { page, limit, offset } = getPagination(req);
    const [{ users, total }, serviceLinks] = await Promise.all([
        listUsersPaginated(limit, offset),
        findAllBarberServiceLinks(),
    ]);
    const serviceIdsByBarber = new Map<number, number[]>();
    for (const { barber_id, service_id } of serviceLinks) {
        const list = serviceIdsByBarber.get(barber_id) || [];
        list.push(service_id);
        serviceIdsByBarber.set(barber_id, list);
    }
    const sanitized = users.map(({ password_hash, ...rest }) => ({
        ...rest,
        service_ids: serviceIdsByBarber.get(rest.id) || [],
    }));

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
      COALESCE(SUM(a.price), 0) as total_revenue,
      COALESCE(SUM(a.price * ${SPLIT} / 100), 0) as barber_earnings
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
        const barberEarnings = Number(r.barber_earnings);
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
        COALESCE(SUM(a.price * ${SPLIT} / 100), 0) as barber_earnings,
        COALESCE(SUM(a.price), 0) - COALESCE(SUM(a.price * ${SPLIT} / 100), 0) as shop_earnings
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
         (a.price * ${SPLIT} / 100) as barber_earnings,
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