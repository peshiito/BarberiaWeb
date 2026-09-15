import { ResultSetHeader, RowDataPacket } from "mysql2";
import pool from "../config/db";
import { CashMovementInput, TxResult } from "../types/finance.types";
import { roundMoney } from "../utils/dateRange";

// Una reposición de producto suma stock en la misma transacción que el egreso.
export const createMovementTx = async (input: CashMovementInput): Promise<TxResult<number>> => {
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();

        const isRestock = input.direction === "out" && input.category === "product_restock";
        if (isRestock) {
            const [productRows] = await conn.query<RowDataPacket[]>(`SELECT id FROM products WHERE id = ? FOR UPDATE`, [
                input.product_id,
            ]);
            if (!productRows.length) {
                await conn.rollback();
                return { ok: false, status: 404, error: "Product not found" };
            }
            await conn.query(`UPDATE products SET stock = stock + ? WHERE id = ?`, [input.quantity, input.product_id]);
        }

        const [inserted] = await conn.query<ResultSetHeader>(
            `INSERT INTO cash_movements
         (direction, category, description, amount, payment_method, occurred_on, product_id, quantity, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                input.direction,
                input.category,
                input.description,
                input.amount,
                input.payment_method,
                input.occurred_on,
                isRestock ? input.product_id : null,
                isRestock ? input.quantity : null,
                input.created_by,
            ],
        );

        await conn.commit();
        return { ok: true, value: inserted.insertId };
    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        conn.release();
    }
};

export const findMovementById = async (id: number) => {
    const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT m.*, p.name AS product_name FROM cash_movements m LEFT JOIN products p ON p.id = m.product_id WHERE m.id = ?`,
        [id],
    );
    return rows[0] || null;
};

// Borrar una reposición descuenta el stock que había sumado; si ese stock ya
// se vendió, no se puede.
export const deleteMovementTx = async (id: number): Promise<TxResult<null>> => {
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();
        const [rows] = await conn.query<RowDataPacket[]>(`SELECT * FROM cash_movements WHERE id = ? FOR UPDATE`, [id]);
        const movement = rows[0];
        if (!movement) {
            await conn.rollback();
            return { ok: false, status: 404, error: "Cash movement not found" };
        }
        if (movement.category === "product_restock" && movement.product_id && movement.quantity) {
            const [productRows] = await conn.query<RowDataPacket[]>(`SELECT stock FROM products WHERE id = ? FOR UPDATE`, [
                movement.product_id,
            ]);
            if (productRows.length) {
                if (productRows[0].stock < movement.quantity) {
                    await conn.rollback();
                    return { ok: false, status: 409, error: "The restocked units were already sold" };
                }
                await conn.query(`UPDATE products SET stock = stock - ? WHERE id = ?`, [
                    movement.quantity,
                    movement.product_id,
                ]);
            }
        }
        await conn.query(`DELETE FROM cash_movements WHERE id = ?`, [id]);
        await conn.commit();
        return { ok: true, value: null };
    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        conn.release();
    }
};

type MethodTotals = { cash: number; transfer: number; unspecified: number; total: number };

const emptyTotals = (): MethodTotals => ({ cash: 0, transfer: 0, unspecified: 0, total: 0 });

const addToTotals = (totals: MethodTotals, method: string | null, amount: number) => {
    const key = method === "cash" || method === "transfer" ? method : "unspecified";
    totals[key] = roundMoney(totals[key] + amount);
    totals.total = roundMoney(totals.total + amount);
};

// Saldo acumulado de la caja hasta `upTo`, separado por medio de pago. Los
// turnos anteriores a registrar el medio de pago quedan como "sin especificar".
export const getCashBalance = async (upTo: string): Promise<MethodTotals> => {
    const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT method, COALESCE(SUM(amount_in), 0) - COALESCE(SUM(amount_out), 0) AS balance FROM (
       SELECT payment_method AS method, price AS amount_in, 0 AS amount_out
         FROM appointments WHERE status = 'completed' AND date <= ?
       UNION ALL
       SELECT payment_method, total, 0 FROM product_sales WHERE sold_on <= ?
       UNION ALL
       SELECT payment_method,
         CASE WHEN direction = 'in' THEN amount ELSE 0 END,
         CASE WHEN direction = 'out' THEN amount ELSE 0 END
         FROM cash_movements WHERE occurred_on <= ?
       UNION ALL
       SELECT payment_method, 0, net_amount FROM barber_payouts WHERE DATE(paid_at) <= ?
       UNION ALL
       SELECT payment_method, 0, amount FROM barber_advances WHERE given_on <= ?
     ) movements
     GROUP BY method`,
        [upTo, upTo, upTo, upTo, upTo],
    );
    const totals = emptyTotals();
    rows.forEach((r: any) => addToTotals(totals, r.method, Number(r.balance)));
    return totals;
};

export const getPeriodBreakdown = async (from: string, to: string) => {
    const [serviceRows] = await pool.query<RowDataPacket[]>(
        `SELECT payment_method AS method, COUNT(*) AS count, COALESCE(SUM(price), 0) AS amount
     FROM appointments WHERE status = 'completed' AND date BETWEEN ? AND ? GROUP BY payment_method`,
        [from, to],
    );
    const [saleRows] = await pool.query<RowDataPacket[]>(
        `SELECT payment_method AS method, COUNT(*) AS count, COALESCE(SUM(total), 0) AS amount,
       COALESCE(SUM(commission_amount), 0) AS commissions
     FROM product_sales WHERE sold_on BETWEEN ? AND ? GROUP BY payment_method`,
        [from, to],
    );
    const [movementRows] = await pool.query<RowDataPacket[]>(
        `SELECT direction, category, payment_method AS method, COUNT(*) AS count, COALESCE(SUM(amount), 0) AS amount
     FROM cash_movements WHERE occurred_on BETWEEN ? AND ? GROUP BY direction, category, payment_method`,
        [from, to],
    );
    const [payoutRows] = await pool.query<RowDataPacket[]>(
        `SELECT payment_method AS method, COUNT(*) AS count, COALESCE(SUM(net_amount), 0) AS amount
     FROM barber_payouts WHERE DATE(paid_at) BETWEEN ? AND ? GROUP BY payment_method`,
        [from, to],
    );
    const [advanceRows] = await pool.query<RowDataPacket[]>(
        `SELECT payment_method AS method, COUNT(*) AS count, COALESCE(SUM(amount), 0) AS amount
     FROM barber_advances WHERE given_on BETWEEN ? AND ? GROUP BY payment_method`,
        [from, to],
    );

    const services = { ...emptyTotals(), count: 0 };
    serviceRows.forEach((r: any) => {
        addToTotals(services, r.method, r.amount);
        services.count += r.count;
    });

    const products = { ...emptyTotals(), count: 0, commissions: 0 };
    saleRows.forEach((r: any) => {
        addToTotals(products, r.method, r.amount);
        products.count += r.count;
        products.commissions = roundMoney(products.commissions + r.commissions);
    });

    const otherIncome = emptyTotals();
    const expensesByCategory: Record<string, number> = {};
    const expenses = emptyTotals();
    movementRows.forEach((r: any) => {
        if (r.direction === "in") {
            addToTotals(otherIncome, r.method, r.amount);
        } else {
            addToTotals(expenses, r.method, r.amount);
            expensesByCategory[r.category] = roundMoney((expensesByCategory[r.category] || 0) + r.amount);
        }
    });

    const payouts = { ...emptyTotals(), count: 0 };
    payoutRows.forEach((r: any) => {
        addToTotals(payouts, r.method, r.amount);
        payouts.count += r.count;
    });

    const advances = { ...emptyTotals(), count: 0 };
    advanceRows.forEach((r: any) => {
        addToTotals(advances, r.method, r.amount);
        advances.count += r.count;
    });

    const incomeTotal = roundMoney(services.total + products.total + otherIncome.total);
    const outflowTotal = roundMoney(expenses.total + payouts.total + advances.total);

    return {
        income: { services, products, other: otherIncome, total: incomeTotal },
        outflow: { expenses, expenses_by_category: expensesByCategory, payouts, advances, total: outflowTotal },
        net: roundMoney(incomeTotal - outflowTotal),
    };
};

export interface LedgerFilters {
    from: string;
    to: string;
    direction?: "in" | "out";
    method?: "cash" | "transfer";
    limit: number;
    offset: number;
}

// Libro de caja: todos los ingresos y egresos del período en una sola lista.
export const getLedger = async (filters: LedgerFilters) => {
    const sources = [
        {
            sql: `SELECT 'service' AS kind, a.id AS ref_id, a.date AS occurred_on, 'in' AS direction, a.price AS amount,
           a.payment_method, COALESCE(s.name, 'Servicio') AS concept,
           CONCAT_WS(' · ', CONCAT_WS(' ', c.first_name, c.last_name), CONCAT_WS(' ', u.first_name, u.last_name)) AS detail,
           NULL AS category, a.completed_at AS created_at, TIME_FORMAT(a.time, '%H:%i') AS occurred_time
         FROM appointments a
         JOIN users u ON u.id = a.barber_id
         LEFT JOIN services s ON s.id = a.service_id
         LEFT JOIN clients c ON c.id = a.client_id
         WHERE a.status = 'completed' AND a.date BETWEEN ? AND ?`,
            direction: "in",
        },
        {
            sql: `SELECT 'sale' AS kind, ps.id AS ref_id, ps.sold_on AS occurred_on, 'in' AS direction, ps.total AS amount,
           ps.payment_method, CONCAT(p.name, ' x', ps.quantity) AS concept,
           CONCAT_WS(' ', u.first_name, u.last_name) AS detail, NULL AS category, ps.created_at AS created_at,
           DATE_FORMAT(ps.created_at, '%H:%i') AS occurred_time
         FROM product_sales ps
         JOIN products p ON p.id = ps.product_id
         LEFT JOIN users u ON u.id = ps.seller_id
         WHERE ps.sold_on BETWEEN ? AND ?`,
            direction: "in",
        },
        {
            sql: `SELECT 'movement' AS kind, m.id AS ref_id, m.occurred_on AS occurred_on, m.direction AS direction,
           m.amount AS amount, m.payment_method, m.description AS concept, p.name AS detail,
           m.category AS category, m.created_at AS created_at, DATE_FORMAT(m.created_at, '%H:%i') AS occurred_time
         FROM cash_movements m
         LEFT JOIN products p ON p.id = m.product_id
         WHERE m.occurred_on BETWEEN ? AND ?`,
            direction: null,
        },
        {
            sql: `SELECT 'payout' AS kind, bp.id AS ref_id, DATE(bp.paid_at) AS occurred_on, 'out' AS direction,
           bp.net_amount AS amount, bp.payment_method, 'Liquidación' AS concept,
           CONCAT_WS(' ', u.first_name, u.last_name) AS detail, NULL AS category, bp.paid_at AS created_at,
           DATE_FORMAT(bp.paid_at, '%H:%i') AS occurred_time
         FROM barber_payouts bp JOIN users u ON u.id = bp.barber_id
         WHERE DATE(bp.paid_at) BETWEEN ? AND ?`,
            direction: "out",
        },
        {
            sql: `SELECT 'advance' AS kind, ad.id AS ref_id, ad.given_on AS occurred_on, 'out' AS direction,
           ad.amount AS amount, ad.payment_method, 'Adelanto' AS concept,
           CONCAT_WS(' ', u.first_name, u.last_name) AS detail, NULL AS category, ad.created_at AS created_at,
           DATE_FORMAT(ad.created_at, '%H:%i') AS occurred_time
         FROM barber_advances ad JOIN users u ON u.id = ad.barber_id
         WHERE ad.given_on BETWEEN ? AND ?`,
            direction: "out",
        },
    ].filter(source => !filters.direction || source.direction === null || source.direction === filters.direction);

    const params: unknown[] = [];
    sources.forEach(() => params.push(filters.from, filters.to));

    const union = sources.map(source => `(${source.sql})`).join(" UNION ALL ");
    const outerConditions: string[] = [];
    const outerParams: unknown[] = [];
    if (filters.direction) {
        outerConditions.push("direction = ?");
        outerParams.push(filters.direction);
    }
    if (filters.method) {
        outerConditions.push("payment_method = ?");
        outerParams.push(filters.method);
    }
    const where = outerConditions.length ? `WHERE ${outerConditions.join(" AND ")}` : "";

    const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT * FROM (${union}) ledger ${where}
     ORDER BY occurred_on DESC, created_at DESC, ref_id DESC
     LIMIT ? OFFSET ?`,
        [...params, ...outerParams, filters.limit, filters.offset],
    );
    const [countRows] = await pool.query<RowDataPacket[]>(`SELECT COUNT(*) AS total FROM (${union}) ledger ${where}`, [
        ...params,
        ...outerParams,
    ]);

    return { entries: rows, total: countRows[0].total as number };
};
