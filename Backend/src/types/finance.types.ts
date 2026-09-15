export const PAYMENT_METHODS = ["cash", "transfer"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const CASH_IN_CATEGORIES = ["opening_balance", "other_income"] as const;
export const CASH_OUT_CATEGORIES = ["supplies", "equipment", "product_restock", "rent_services", "other_expense"] as const;
export type CashCategory = (typeof CASH_IN_CATEGORIES)[number] | (typeof CASH_OUT_CATEGORIES)[number];
export type CashDirection = "in" | "out";

export interface Product {
    id: number;
    name: string;
    description: string | null;
    sale_price: number;
    cost_price: number | null;
    stock: number;
    min_stock: number;
    barber_commission_percentage: number;
    active: number;
    created_at: Date;
}

export interface ProductInput {
    name: string;
    description?: string;
    sale_price: number;
    cost_price?: number;
    stock?: number;
    min_stock?: number;
    barber_commission_percentage?: number;
}

export type ProductUpdateInput = Partial<Omit<ProductInput, "cost_price">> & {
    cost_price?: number | null;
    active?: boolean;
};

export interface SaleInput {
    product_id: number;
    quantity: number;
    seller_id: number | null;
    payment_method: PaymentMethod;
    sold_on: string;
    created_by: number;
}

export interface CashMovementInput {
    direction: CashDirection;
    category: CashCategory;
    description: string;
    amount: number;
    payment_method: PaymentMethod;
    occurred_on: string;
    product_id?: number;
    quantity?: number;
    created_by: number;
}

export interface AdvanceInput {
    barber_id: number;
    amount: number;
    payment_method: PaymentMethod;
    given_on: string;
    note?: string;
    created_by: number;
}

export interface PayoutInput {
    barber_id: number;
    up_to: string;
    payment_method: PaymentMethod;
    note?: string;
    created_by: number;
}

export type TxResult<T> = { ok: true; value: T } | { ok: false; status: number; error: string };
