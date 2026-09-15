import { ResultSetHeader, RowDataPacket } from "mysql2";
import pool from "../config/db";
import { ProductInput, ProductUpdateInput, SaleInput, TxResult } from "../types/finance.types";
import { roundMoney } from "../utils/dateRange";

const PRODUCT_SELECT = `SELECT p.id, p.name, p.description, p.sale_price, p.cost_price, p.stock, p.min_stock,
   p.barber_commission_percentage, p.active, p.created_at,
   (p.stock <= p.min_stock) AS low_stock,
   COALESCE(recent.units_sold, 0) AS units_sold_30d,
   COALESCE(recent.revenue, 0) AS revenue_30d
 FROM products p
 LEFT JOIN (
   SELECT product_id, SUM(quantity) AS units_sold, SUM(total) AS revenue
   FROM product_sales WHERE sold_on >= CURDATE() - INTERVAL 30 DAY
   GROUP BY product_id
 ) recent ON recent.product_id = p.id`;

export const listProducts = async (includeInactive: boolean) => {
    const [rows] = await pool.query<RowDataPacket[]>(
        `${PRODUCT_SELECT} ${includeInactive ? "" : "WHERE p.active = TRUE"} ORDER BY p.active DESC, p.name`,
    );
    return rows;
};

export const findProductById = async (id: number) => {
    const [rows] = await pool.query<RowDataPacket[]>(`${PRODUCT_SELECT} WHERE p.id = ?`, [id]);
    return rows[0] || null;
};

export const createProduct = async (data: ProductInput): Promise<number> => {
    const [result] = await pool.query<ResultSetHeader>(
        `INSERT INTO products (name, description, sale_price, cost_price, stock, min_stock, barber_commission_percentage)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
            data.name,
            data.description || null,
            data.sale_price,
            data.cost_price ?? null,
            data.stock ?? 0,
            data.min_stock ?? 0,
            data.barber_commission_percentage ?? 0,
        ],
    );
    return result.insertId;
};

const UPDATABLE_PRODUCT_FIELDS = [
    "name",
    "description",
    "sale_price",
    "cost_price",
    "stock",
    "min_stock",
    "barber_commission_percentage",
    "active",
] as const;

export const updateProduct = async (id: number, data: ProductUpdateInput): Promise<void> => {
    const fields: string[] = [];
    const values: unknown[] = [];
    for (const key of UPDATABLE_PRODUCT_FIELDS) {
        if (data[key] !== undefined) {
            fields.push(`${key} = ?`);
            values.push(key === "description" ? data.description || null : data[key]);
        }
    }
    if (!fields.length) return;
    values.push(id);
    await pool.query(`UPDATE products SET ${fields.join(", ")} WHERE id = ?`, values);
};

// Bloquea el producto para que dos ventas simultáneas no dejen stock negativo.
// Precio y comisión se congelan en la venta.
export const createSaleTx = async (input: SaleInput): Promise<TxResult<number>> => {
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();

        const [productRows] = await conn.query<RowDataPacket[]>(`SELECT * FROM products WHERE id = ? FOR UPDATE`, [
            input.product_id,
        ]);
        const product = productRows[0];
        if (!product) {
            await conn.rollback();
            return { ok: false, status: 404, error: "Product not found" };
        }
        if (!product.active) {
            await conn.rollback();
            return { ok: false, status: 409, error: "Product is not active" };
        }
        if (product.stock < input.quantity) {
            await conn.rollback();
            return { ok: false, status: 409, error: `Not enough stock (available: ${product.stock})` };
        }

        let commissionPercentage = 0;
        if (input.seller_id) {
            const [sellerRows] = await conn.query<RowDataPacket[]>(
                `SELECT id FROM users WHERE id = ? AND role IN ('barber', 'admin_barber')`,
                [input.seller_id],
            );
            if (!sellerRows.length) {
                await conn.rollback();
                return { ok: false, status: 400, error: "Seller must be a barber" };
            }
            commissionPercentage = product.barber_commission_percentage;
        }

        const total = roundMoney(product.sale_price * input.quantity);
        const commissionAmount = roundMoney((total * commissionPercentage) / 100);

        const [inserted] = await conn.query<ResultSetHeader>(
            `INSERT INTO product_sales
         (product_id, quantity, unit_price, total, seller_id, commission_percentage, commission_amount,
          payment_method, sold_on, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                input.product_id,
                input.quantity,
                product.sale_price,
                total,
                input.seller_id,
                commissionPercentage,
                commissionAmount,
                input.payment_method,
                input.sold_on,
                input.created_by,
            ],
        );
        await conn.query(`UPDATE products SET stock = stock - ? WHERE id = ?`, [input.quantity, input.product_id]);

        await conn.commit();
        return { ok: true, value: inserted.insertId };
    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        conn.release();
    }
};

const SALE_SELECT = `SELECT ps.*, p.name AS product_name,
   s.first_name AS seller_first_name, s.last_name AS seller_last_name
 FROM product_sales ps
 JOIN products p ON p.id = ps.product_id
 LEFT JOIN users s ON s.id = ps.seller_id`;

export const findSaleById = async (id: number) => {
    const [rows] = await pool.query<RowDataPacket[]>(`${SALE_SELECT} WHERE ps.id = ?`, [id]);
    return rows[0] || null;
};

export const listSales = async (filters: { from: string; to: string; limit: number; offset: number }) => {
    const [rows] = await pool.query<RowDataPacket[]>(
        `${SALE_SELECT} WHERE ps.sold_on BETWEEN ? AND ? ORDER BY ps.sold_on DESC, ps.id DESC LIMIT ? OFFSET ?`,
        [filters.from, filters.to, filters.limit, filters.offset],
    );
    const [countRows] = await pool.query<RowDataPacket[]>(
        `SELECT COUNT(*) AS total, COALESCE(SUM(total), 0) AS revenue, COALESCE(SUM(quantity), 0) AS units
     FROM product_sales WHERE sold_on BETWEEN ? AND ?`,
        [filters.from, filters.to],
    );
    return { sales: rows, total: countRows[0].total, revenue: countRows[0].revenue, units: countRows[0].units };
};

// Anular una venta devuelve el stock. No se puede si la comisión ya se pagó.
export const deleteSaleTx = async (id: number): Promise<TxResult<null>> => {
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();
        const [rows] = await conn.query<RowDataPacket[]>(`SELECT * FROM product_sales WHERE id = ? FOR UPDATE`, [id]);
        const sale = rows[0];
        if (!sale) {
            await conn.rollback();
            return { ok: false, status: 404, error: "Sale not found" };
        }
        if (sale.payout_id) {
            await conn.rollback();
            return { ok: false, status: 409, error: "This sale was already included in a barber payout" };
        }
        await conn.query(`UPDATE products SET stock = stock + ? WHERE id = ?`, [sale.quantity, sale.product_id]);
        await conn.query(`DELETE FROM product_sales WHERE id = ?`, [id]);
        await conn.commit();
        return { ok: true, value: null };
    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        conn.release();
    }
};
