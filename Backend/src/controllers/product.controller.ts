import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import {
    createProduct,
    createSaleTx,
    deleteSaleTx,
    findProductById,
    findSaleById,
    listProducts,
    listSales,
    updateProduct,
} from "../models/product.model";
import { getPagination } from "../utils/pagination";
import { parseDateRange, todayIso } from "../utils/dateRange";
import { parsePositiveIntParam } from "../utils/validators";

const isManager = (req: AuthRequest) => req.user?.role === "admin" || req.user?.role === "admin_barber";

export const getProducts = async (req: AuthRequest, res: Response) => {
    // Un barbero solo necesita los productos activos para registrar ventas.
    const includeInactive = isManager(req) && req.query.include_inactive === "true";
    const products = await listProducts(includeInactive);
    return res.json(products);
};

export const createProductHandler = async (req: AuthRequest, res: Response) => {
    const id = await createProduct(req.body);
    const product = await findProductById(id);
    return res.status(201).json(product);
};

export const updateProductHandler = async (req: AuthRequest, res: Response) => {
    const id = parsePositiveIntParam(req.params.id);
    if (id === null) {
        return res.status(400).json({ error: "Invalid product id" });
    }
    const existing = await findProductById(id);
    if (!existing) {
        return res.status(404).json({ error: "Product not found" });
    }
    await updateProduct(id, req.body);
    const product = await findProductById(id);
    return res.json(product);
};

export const createSaleHandler = async (req: AuthRequest, res: Response) => {
    const { product_id, quantity, payment_method } = req.body;
    const soldOn: string = req.body.sold_on || todayIso();
    if (soldOn > todayIso()) {
        return res.status(400).json({ error: "A sale cannot be dated in the future" });
    }

    // Un barbero registra sus propias ventas; el admin puede indicar quién vendió
    // (o dejarlo vacío si vendió el local, sin comisión).
    const sellerId = req.user!.role === "barber" ? req.user!.id : (req.body.seller_id ?? null);

    const result = await createSaleTx({
        product_id,
        quantity,
        seller_id: sellerId,
        payment_method,
        sold_on: soldOn,
        created_by: req.user!.id,
    });
    if (!result.ok) {
        return res.status(result.status).json({ error: result.error });
    }
    const sale = await findSaleById(result.value);
    return res.status(201).json(sale);
};

export const getSales = async (req: AuthRequest, res: Response) => {
    const range = parseDateRange(req.query.from, req.query.to);
    if ("error" in range) {
        return res.status(400).json({ error: range.error });
    }
    const { page, limit, offset } = getPagination(req);
    const { sales, total, revenue, units } = await listSales({ ...range, limit, offset });
    return res.json({
        data: sales,
        totals: { revenue, units, count: total },
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
};

export const removeSale = async (req: AuthRequest, res: Response) => {
    const id = parsePositiveIntParam(req.params.id);
    if (id === null) {
        return res.status(400).json({ error: "Invalid sale id" });
    }
    const result = await deleteSaleTx(id);
    if (!result.ok) {
        return res.status(result.status).json({ error: result.error });
    }
    return res.json({ message: "Sale voided" });
};
