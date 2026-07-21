import bcrypt from "bcrypt";
import { Request, Response } from "express";
import { RowDataPacket } from "mysql2";
import pool from "../config/db";
import { createUser, findByEmail, listUsersPaginated } from "../models/user.model";
import { getPagination } from "../utils/pagination";

export const createBarber = async (req: Request, res: Response) => {
    const { first_name, last_name, email, password, role, bio, service_price, earnings_split_percentage } = req.body;

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
    const { from, to } = req.query;

    if (!from || !to) {
        return res.status(400).json({ error: "Missing from/to date range" });
    }

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
    const { from, to } = req.query;

    if (!from || !to) {
        return res.status(400).json({ error: "Missing from/to date range" });
    }

    const [rows] = await pool.query<RowDataPacket[]>(
        `WITH barber_earnings AS (
      SELECT 
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
      GROUP BY u.id
    )
    SELECT 
      COALESCE(SUM(be.total_revenue), 0) as total_revenue,
      COALESCE(SUM(be.barber_earnings), 0) as total_barber_earnings,
      COALESCE(SUM(be.shop_earnings), 0) as total_shop_earnings,
      COALESCE(COUNT(DISTINCT be.barber_id), 0) as active_barbers,
      COALESCE(COUNT(a.id), 0) as total_appointments
    FROM barber_earnings be
    LEFT JOIN appointments a ON a.barber_id = be.barber_id AND a.date BETWEEN ? AND ?`,
        [from, to, from, to],
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