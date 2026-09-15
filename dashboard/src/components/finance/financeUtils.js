import { addDays, getMonday, parseDateOnly, toISODate } from "../../utils/date";
import { formatMoney } from "../../utils/format";

export const METHOD_META = {
    cash: { label: "Efectivo", icon: "payments" },
    transfer: { label: "Transferencia", icon: "account_balance" },
    unspecified: { label: "Sin especificar", icon: "help" },
};

export const methodMeta = method => METHOD_META[method] || METHOD_META.unspecified;

export const OUT_CATEGORIES = [
    { value: "supplies", label: "Insumos", hint: "Hojas, alcohol, toallas", icon: "sanitizer" },
    { value: "equipment", label: "Equipamiento e inversiones", hint: "Navajas, máquinas, matizadores", icon: "handyman" },
    { value: "product_restock", label: "Reposición de productos", hint: "Mercadería para vender", icon: "inventory_2" },
    { value: "rent_services", label: "Alquiler y servicios", hint: "Luz, internet, expensas", icon: "home_work" },
    { value: "other_expense", label: "Otro gasto", hint: "Cafetería, viáticos, etc.", icon: "more_horiz" },
];

export const IN_CATEGORIES = [
    { value: "opening_balance", label: "Saldo inicial", hint: "Plata con la que arranca la caja", icon: "account_balance_wallet" },
    { value: "other_income", label: "Otro ingreso", hint: "Reintegros, aportes, etc.", icon: "add_card" },
];

export const CATEGORY_LABEL = Object.fromEntries(
    [...OUT_CATEGORIES, ...IN_CATEGORIES].map(category => [category.value, category.label]),
);

export const LEDGER_KIND = {
    service: { label: "Corte", icon: "content_cut" },
    sale: { label: "Venta", icon: "shopping_bag" },
    movement_in: { label: "Ingreso manual", icon: "login" },
    movement_out: { label: "Egreso manual", icon: "logout" },
    payout: { label: "Liquidación", icon: "receipt_long" },
    advance: { label: "Adelanto", icon: "payments" },
};

export const ledgerKind = entry =>
    entry.kind === "movement" ? LEDGER_KIND[`movement_${entry.direction}`] : LEDGER_KIND[entry.kind];

// Montos con signo: "+ $12.500" / "− $18.500".
export const signedMoney = (amount, direction) => `${direction === "out" ? "−" : "+"} ${formatMoney(Math.abs(amount))}`;

export const money = amount => (Number(amount) < 0 ? `−${formatMoney(Math.abs(amount))}` : formatMoney(amount));

const MONTH_SHORT = { month: "short" };

export const formatDay = iso => {
    const date = parseDateOnly(iso);
    return `${date.getDate()} ${date.toLocaleDateString("es-AR", MONTH_SHORT).replace(".", "")}`;
};

export const formatDayYear = iso => `${formatDay(iso)} ${parseDateOnly(iso).getFullYear()}`;

export const formatTimestamp = value => {
    const date = new Date(value);
    const day = `${date.getDate()} ${date.toLocaleDateString("es-AR", MONTH_SHORT).replace(".", "")}`;
    const time = date.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", hour12: false });
    return { day, time, year: date.getFullYear() };
};

export const formatRangeLong = (from, to) => {
    const a = parseDateOnly(from);
    const b = parseDateOnly(to);
    const month = d => d.toLocaleDateString("es-AR", { month: "long" });
    if (from === to) return `${a.getDate()} de ${month(a)} ${a.getFullYear()}`;
    if (a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear()) {
        return `${a.getDate()} al ${b.getDate()} de ${month(b)} ${b.getFullYear()}`;
    }
    return `${a.getDate()} de ${month(a)} al ${b.getDate()} de ${month(b)} ${b.getFullYear()}`;
};

export const daysBetween = (from, to) => Math.round((parseDateOnly(to) - parseDateOnly(from)) / 86400000) + 1;

export const todayIso = () => toISODate(new Date());

// Atajos del selector de período de Caja.
export const PERIOD_PRESETS = [
    { value: "today", label: "Hoy", range: () => ({ from: todayIso(), to: todayIso() }) },
    { value: "week", label: "Esta semana", range: () => ({ from: toISODate(getMonday(new Date())), to: todayIso() }) },
    {
        value: "fortnight",
        label: "Quincena",
        range: () => {
            const now = new Date();
            const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() <= 15 ? 1 : 16);
            return { from: toISODate(start), to: todayIso() };
        },
    },
    {
        value: "month",
        label: "Este mes",
        range: () => {
            const now = new Date();
            return { from: toISODate(new Date(now.getFullYear(), now.getMonth(), 1)), to: todayIso() };
        },
    },
];

// Atajos de "Liquidar hasta".
export const PAYOUT_PRESETS = [
    { value: "today", label: "Hoy", date: () => todayIso() },
    {
        value: "last-sunday",
        label: "Domingo pasado",
        date: () => {
            const now = new Date();
            const back = now.getDay() === 0 ? 7 : now.getDay();
            return toISODate(addDays(now, -back));
        },
    },
    {
        value: "day-15",
        label: "Día 15",
        date: () => {
            const now = new Date();
            const fifteenth =
                now.getDate() >= 15
                    ? new Date(now.getFullYear(), now.getMonth(), 15)
                    : new Date(now.getFullYear(), now.getMonth() - 1, 15);
            return toISODate(fifteenth);
        },
    },
];

const ERROR_MESSAGES = [
    [/Nothing to pay/i, "No hay nada pendiente para pagarle hasta esa fecha."],
    [/advances exceed/i, "Los adelantos superan lo que tiene generado: el pago queda bloqueado."],
    [/already included in a barber payout/i, "Esa venta ya se pagó en una liquidación."],
    [/Not enough stock \(available: (\d+)\)/i, match => `No hay stock suficiente: quedan ${match[1]}.`],
    [/Product is not active/i, "El producto está desactivado."],
    [/already sold/i, "Esas unidades ya se vendieron: no se puede borrar la reposición."],
    [/already deducted/i, "Ese adelanto ya se descontó en una liquidación."],
    [/future/i, "La fecha no puede ser futura."],
    [/Seller must be a barber/i, "El vendedor tiene que ser un barbero."],
    [/not found/i, "No se encontró el registro: puede que ya se haya borrado."],
];

export const financeErrorMessage = (err, fallback) => {
    const raw = err?.response?.data?.error;
    if (!raw) return fallback;
    if (raw === "Validation failed") return "Revisá los datos cargados.";
    for (const [pattern, message] of ERROR_MESSAGES) {
        const match = raw.match(pattern);
        if (match) return typeof message === "function" ? message(match) : message;
    }
    return fallback;
};
