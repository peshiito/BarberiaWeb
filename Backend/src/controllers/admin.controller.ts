import bcrypt from "bcrypt";
import { Request, Response } from "express";
import { RowDataPacket } from "mysql2";
import pool from "../config/db";
import { createUser, findByEmail, listUsers } from "../models/user.model";

export const createBarber = async (req: Request, res: Response) => {
    const { first_name, last_name, email, password, role, bio, service_price, earnings_split_percentage } = req.body;

    if (!first_name || !last_name || !email || !password || !role) {
        return res.status(400).json({ error: "Missing required fields" });
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

export const getAllUsers = async (_req: Request, res: Response) => {
    const users = await listUsers();
    const sanitized = users.map(({ password_hash, ...rest }) => rest);
    return res.json(sanitized);
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
