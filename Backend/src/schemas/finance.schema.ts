import { z } from "zod";
import { CASH_IN_CATEGORIES, CASH_OUT_CATEGORIES, PAYMENT_METHODS } from "../types/finance.types";
import { calendarDateField, requireAtLeastOneField } from "./common";

const MONEY_MAX = 99999999.99;
const money = z.number().positive().max(MONEY_MAX);
const moneyOrZero = z.number().nonnegative().max(MONEY_MAX);
const percentage = z.number().min(0).max(100);
const stockField = z.number().int().min(0).max(1000000);
const paymentMethod = z.enum(PAYMENT_METHODS);
const note = z.string().trim().max(300).optional();
const idField = z.number().int().positive();

export const createPayoutSchema = z.object({
    barber_id: idField,
    up_to: calendarDateField,
    payment_method: paymentMethod,
    note,
});

export const createAdvanceSchema = z.object({
    barber_id: idField,
    amount: money,
    payment_method: paymentMethod,
    given_on: calendarDateField,
    note,
});

export const createProductSchema = z.object({
    name: z.string().trim().min(2).max(100),
    description: z.string().trim().max(255).optional(),
    sale_price: moneyOrZero,
    cost_price: moneyOrZero.optional(),
    stock: stockField.optional(),
    min_stock: stockField.optional(),
    barber_commission_percentage: percentage.optional(),
});

export const updateProductSchema = requireAtLeastOneField(
    z.object({
        name: z.string().trim().min(2).max(100).optional(),
        description: z.string().trim().max(255).optional(),
        sale_price: moneyOrZero.optional(),
        cost_price: moneyOrZero.nullable().optional(),
        stock: stockField.optional(),
        min_stock: stockField.optional(),
        barber_commission_percentage: percentage.optional(),
        active: z.boolean().optional(),
    }),
);

export const createSaleSchema = z.object({
    product_id: idField,
    quantity: z.number().int().positive().max(1000),
    seller_id: idField.nullable().optional(),
    payment_method: paymentMethod,
    sold_on: calendarDateField.optional(),
});

const movementBase = {
    description: z.string().trim().min(2).max(255),
    amount: money,
    payment_method: paymentMethod,
    occurred_on: calendarDateField,
};

export const createCashMovementSchema = z
    .discriminatedUnion("direction", [
        z.object({ direction: z.literal("in"), category: z.enum(CASH_IN_CATEGORIES), ...movementBase }),
        z.object({
            direction: z.literal("out"),
            category: z.enum(CASH_OUT_CATEGORIES),
            ...movementBase,
            product_id: idField.optional(),
            quantity: z.number().int().positive().max(100000).optional(),
        }),
    ])
    .superRefine((data, ctx) => {
        if (data.direction === "out" && data.category === "product_restock" && (!data.product_id || !data.quantity)) {
            ctx.addIssue({
                code: "custom",
                path: ["product_id"],
                message: "A product and a quantity are required for a product restock",
            });
        }
    });
