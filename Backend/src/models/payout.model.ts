import { ResultSetHeader, RowDataPacket } from "mysql2";
import pool from "../config/db";
import { AdvanceInput, PayoutInput, TxResult } from "../types/finance.types";
import { roundMoney } from "../utils/dateRange";

// Turnos viejos (anteriores a congelar el porcentaje) usan el actual del barbero.
const SPLIT = "COALESCE(a.barber_split_percentage, u.earnings_split_percentage)";

export const findStaffBarber = async (id: number) => {
    const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT id, first_name, last_name, role, earnings_split_percentage
     FROM users WHERE id = ? AND role IN ('barber', 'admin_barber')`,
        [id],
    );
    return rows[0] || null;
};

// Lo que se le debe a cada barbero hasta `upTo`: turnos completados y
// comisiones de ventas todavía no liquidados, menos adelantos pendientes.
export const findPendingPayouts = async (upTo: string) => {
    const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT u.id AS barber_id, u.first_name, u.last_name, u.earnings_split_percentage,
       COALESCE(ap.services_count, 0) AS services_count,
       COALESCE(ap.services_revenue, 0) AS services_revenue,
       COALESCE(ap.services_earnings, 0) AS services_earnings,
       ap.oldest_date,
       COALESCE(ps.sales_count, 0) AS sales_count,
       COALESCE(ps.commissions_amount, 0) AS commissions_amount,
       COALESCE(ad.advances_count, 0) AS advances_count,
       COALESCE(ad.advances_amount, 0) AS advances_amount,
       lp.last_paid_at, lp.last_period_to
     FROM users u
     LEFT JOIN (
       SELECT a.barber_id, COUNT(*) AS services_count, SUM(a.price) AS services_revenue,
         SUM(ROUND(a.price * ${SPLIT} / 100, 2)) AS services_earnings, MIN(a.date) AS oldest_date
       FROM appointments a JOIN users u ON u.id = a.barber_id
       WHERE a.status = 'completed' AND a.payout_id IS NULL AND a.date <= ?
       GROUP BY a.barber_id
     ) ap ON ap.barber_id = u.id
     LEFT JOIN (
       SELECT seller_id, COUNT(*) AS sales_count, SUM(commission_amount) AS commissions_amount
       FROM product_sales
       WHERE payout_id IS NULL AND seller_id IS NOT NULL AND commission_amount > 0 AND sold_on <= ?
       GROUP BY seller_id
     ) ps ON ps.seller_id = u.id
     LEFT JOIN (
       SELECT barber_id, COUNT(*) AS advances_count, SUM(amount) AS advances_amount
       FROM barber_advances WHERE payout_id IS NULL GROUP BY barber_id
     ) ad ON ad.barber_id = u.id
     LEFT JOIN (
       SELECT barber_id, MAX(paid_at) AS last_paid_at, MAX(period_to) AS last_period_to
       FROM barber_payouts GROUP BY barber_id
     ) lp ON lp.barber_id = u.id
     WHERE u.role IN ('barber', 'admin_barber')
     ORDER BY u.first_name, u.last_name`,
        [upTo, upTo],
    );

    return rows.map((r: any) => ({
        ...r,
        net_amount: roundMoney(r.services_earnings + r.commissions_amount - r.advances_amount),
    }));
};

export const findPendingDetail = async (barberId: number, upTo: string) => {
    const [appointments] = await pool.query<RowDataPacket[]>(
        `SELECT a.id, a.date, a.time, a.price, a.payment_method,
       ${SPLIT} AS split_percentage, ROUND(a.price * ${SPLIT} / 100, 2) AS earnings,
       s.name AS service_name, c.first_name AS client_first_name, c.last_name AS client_last_name
     FROM appointments a
     JOIN users u ON u.id = a.barber_id
     LEFT JOIN services s ON s.id = a.service_id
     LEFT JOIN clients c ON c.id = a.client_id
     WHERE a.barber_id = ? AND a.status = 'completed' AND a.payout_id IS NULL AND a.date <= ?
     ORDER BY a.date, a.time`,
        [barberId, upTo],
    );
    const [sales] = await pool.query<RowDataPacket[]>(
        `SELECT ps.id, ps.sold_on, ps.quantity, ps.total, ps.commission_percentage, ps.commission_amount,
       p.name AS product_name
     FROM product_sales ps JOIN products p ON p.id = ps.product_id
     WHERE ps.seller_id = ? AND ps.payout_id IS NULL AND ps.commission_amount > 0 AND ps.sold_on <= ?
     ORDER BY ps.sold_on, ps.id`,
        [barberId, upTo],
    );
    const [advances] = await pool.query<RowDataPacket[]>(
        `SELECT ad.id, ad.amount, ad.payment_method, ad.given_on, ad.note, cb.first_name AS created_by_first_name
     FROM barber_advances ad LEFT JOIN users cb ON cb.id = ad.created_by
     WHERE ad.barber_id = ? AND ad.payout_id IS NULL
     ORDER BY ad.given_on, ad.id`,
        [barberId],
    );
    return { appointments, sales, advances };
};

// Marca todo lo pendiente con el id de la liquidación dentro de una
// transacción: si dos personas pagan a la vez, el segundo UPDATE no
// encuentra filas y la liquidación se descarta por "nada para pagar".
export const createPayoutTx = async (input: PayoutInput): Promise<TxResult<number>> => {
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();

        const [inserted] = await conn.query<ResultSetHeader>(
            `INSERT INTO barber_payouts (barber_id, period_from, period_to, net_amount, payment_method, note, created_by)
       VALUES (?, ?, ?, 0, ?, ?, ?)`,
            [input.barber_id, input.up_to, input.up_to, input.payment_method, input.note || null, input.created_by],
        );
        const payoutId = inserted.insertId;

        await conn.query(
            `UPDATE appointments SET payout_id = ?
       WHERE barber_id = ? AND status = 'completed' AND payout_id IS NULL AND date <= ?`,
            [payoutId, input.barber_id, input.up_to],
        );
        await conn.query(
            `UPDATE product_sales SET payout_id = ?
       WHERE seller_id = ? AND payout_id IS NULL AND commission_amount > 0 AND sold_on <= ?`,
            [payoutId, input.barber_id, input.up_to],
        );
        await conn.query(`UPDATE barber_advances SET payout_id = ? WHERE barber_id = ? AND payout_id IS NULL`, [
            payoutId,
            input.barber_id,
        ]);

        const [serviceRows] = await conn.query<RowDataPacket[]>(
            `SELECT COUNT(*) AS count, COALESCE(SUM(a.price), 0) AS revenue,
         COALESCE(SUM(ROUND(a.price * ${SPLIT} / 100, 2)), 0) AS earnings, MIN(a.date) AS first_date
       FROM appointments a JOIN users u ON u.id = a.barber_id WHERE a.payout_id = ?`,
            [payoutId],
        );
        const [saleRows] = await conn.query<RowDataPacket[]>(
            `SELECT COUNT(*) AS count, COALESCE(SUM(commission_amount), 0) AS commissions, MIN(sold_on) AS first_date
       FROM product_sales WHERE payout_id = ?`,
            [payoutId],
        );
        const [advanceRows] = await conn.query<RowDataPacket[]>(
            `SELECT COUNT(*) AS count, COALESCE(SUM(amount), 0) AS amount FROM barber_advances WHERE payout_id = ?`,
            [payoutId],
        );

        const services = serviceRows[0];
        const sales = saleRows[0];
        const advances = advanceRows[0];

        if (services.count === 0 && sales.count === 0) {
            await conn.rollback();
            return { ok: false, status: 409, error: "Nothing to pay for this barber up to that date" };
        }

        const net = roundMoney(services.earnings + sales.commissions - advances.amount);
        if (net < 0) {
            await conn.rollback();
            return { ok: false, status: 409, error: "Pending advances exceed the amount owed" };
        }

        const firstDates = [services.first_date, sales.first_date].filter(Boolean) as string[];
        const periodFrom = firstDates.length ? firstDates.sort()[0] : input.up_to;

        await conn.query(
            `UPDATE barber_payouts SET period_from = ?, services_count = ?, services_revenue = ?, services_earnings = ?,
         sales_count = ?, commissions_amount = ?, advances_amount = ?, net_amount = ?
       WHERE id = ?`,
            [
                periodFrom,
                services.count,
                services.revenue,
                services.earnings,
                sales.count,
                sales.commissions,
                advances.amount,
                net,
                payoutId,
            ],
        );

        await conn.commit();
        return { ok: true, value: payoutId };
    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        conn.release();
    }
};

const PAYOUT_SELECT = `SELECT p.*, u.first_name AS barber_first_name, u.last_name AS barber_last_name,
   cb.first_name AS created_by_first_name, cb.last_name AS created_by_last_name
 FROM barber_payouts p
 JOIN users u ON u.id = p.barber_id
 LEFT JOIN users cb ON cb.id = p.created_by`;

export const findPayoutById = async (id: number) => {
    const [rows] = await pool.query<RowDataPacket[]>(`${PAYOUT_SELECT} WHERE p.id = ?`, [id]);
    return rows[0] || null;
};

export const findPayoutItems = async (payoutId: number) => {
    const [appointments] = await pool.query<RowDataPacket[]>(
        `SELECT a.id, a.date, a.time, a.price, a.payment_method,
       ${SPLIT} AS split_percentage, ROUND(a.price * ${SPLIT} / 100, 2) AS earnings,
       s.name AS service_name, c.first_name AS client_first_name, c.last_name AS client_last_name
     FROM appointments a
     JOIN users u ON u.id = a.barber_id
     LEFT JOIN services s ON s.id = a.service_id
     LEFT JOIN clients c ON c.id = a.client_id
     WHERE a.payout_id = ? ORDER BY a.date, a.time`,
        [payoutId],
    );
    const [sales] = await pool.query<RowDataPacket[]>(
        `SELECT ps.id, ps.sold_on, ps.quantity, ps.total, ps.commission_percentage, ps.commission_amount,
       p.name AS product_name
     FROM product_sales ps JOIN products p ON p.id = ps.product_id
     WHERE ps.payout_id = ? ORDER BY ps.sold_on, ps.id`,
        [payoutId],
    );
    const [advances] = await pool.query<RowDataPacket[]>(
        `SELECT id, amount, payment_method, given_on, note FROM barber_advances WHERE payout_id = ? ORDER BY given_on, id`,
        [payoutId],
    );
    return { appointments, sales, advances };
};

export const listPayouts = async (filters: { from: string; to: string; barberId?: number }) => {
    const params: unknown[] = [filters.from, filters.to];
    let where = "WHERE DATE(p.paid_at) BETWEEN ? AND ?";
    if (filters.barberId) {
        where += " AND p.barber_id = ?";
        params.push(filters.barberId);
    }
    const [rows] = await pool.query<RowDataPacket[]>(`${PAYOUT_SELECT} ${where} ORDER BY p.paid_at DESC, p.id DESC`, params);
    return rows;
};

// Al borrar la liquidación, las FK con ON DELETE SET NULL devuelven sus
// turnos, ventas y adelantos a "pendiente".
export const deletePayout = async (id: number): Promise<boolean> => {
    const [result] = await pool.query<ResultSetHeader>(`DELETE FROM barber_payouts WHERE id = ?`, [id]);
    return result.affectedRows > 0;
};

export const createAdvance = async (input: AdvanceInput): Promise<number> => {
    const [result] = await pool.query<ResultSetHeader>(
        `INSERT INTO barber_advances (barber_id, amount, payment_method, given_on, note, created_by)
     VALUES (?, ?, ?, ?, ?, ?)`,
        [input.barber_id, input.amount, input.payment_method, input.given_on, input.note || null, input.created_by],
    );
    return result.insertId;
};

export const listAdvances = async (filters: { barberId?: number; pendingOnly: boolean }) => {
    const params: unknown[] = [];
    const conditions: string[] = [];
    if (filters.barberId) {
        conditions.push("ad.barber_id = ?");
        params.push(filters.barberId);
    }
    if (filters.pendingOnly) {
        conditions.push("ad.payout_id IS NULL");
    }
    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT ad.*, u.first_name AS barber_first_name, u.last_name AS barber_last_name,
       cb.first_name AS created_by_first_name, cb.last_name AS created_by_last_name
     FROM barber_advances ad
     JOIN users u ON u.id = ad.barber_id
     LEFT JOIN users cb ON cb.id = ad.created_by
     ${where}
     ORDER BY ad.given_on DESC, ad.id DESC
     LIMIT 200`,
        params,
    );
    return rows;
};

export const findAdvanceById = async (id: number) => {
    const [rows] = await pool.query<RowDataPacket[]>(`SELECT * FROM barber_advances WHERE id = ?`, [id]);
    return rows[0] || null;
};

// Solo se puede borrar un adelanto que todavía no se descontó en una liquidación.
export const deletePendingAdvance = async (id: number): Promise<boolean> => {
    const [result] = await pool.query<ResultSetHeader>(`DELETE FROM barber_advances WHERE id = ? AND payout_id IS NULL`, [
        id,
    ]);
    return result.affectedRows > 0;
};
