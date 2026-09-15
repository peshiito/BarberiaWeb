import { useEffect, useRef, useState } from "react";
import { deleteCashMovement, getCashLedger, getCashSummary } from "../../services/finance";
import { addDays, parseDateOnly, toISODate } from "../../utils/date";
import { formatMoney } from "../../utils/format";
import Button from "../ui/Button";
import ConfirmDialog from "../ui/ConfirmDialog";
import Icon from "../ui/Icon";
import InlineFeedback from "../ui/InlineFeedback";
import SegmentedControl from "../ui/SegmentedControl";
import Select from "../ui/Select";
import Skeleton from "../ui/Skeleton";
import { useToast } from "../ui/Toast";
import {
    CATEGORY_LABEL,
    OUT_CATEGORIES,
    daysBetween,
    financeErrorMessage,
    formatDay,
    formatDayYear,
    formatRangeLong,
    ledgerKind,
    methodMeta,
    money,
    signedMoney,
    todayIso,
} from "./financeUtils";
import "./CashTab.css";

const PAGE_SIZE = 10;

const BALANCE_ITEMS = [
    { key: "cash", label: "Efectivo", hint: "Plata en mano de la caja", icon: "payments", tone: "sage" },
    { key: "transfer", label: "Transferencia", hint: "Cuenta de la barbería", icon: "account_balance", tone: "brass" },
    {
        key: "unspecified",
        label: "Sin especificar",
        hint: "Turnos anteriores a registrar el medio de pago",
        icon: "help",
        tone: "muted",
    },
];

const MethodChip = ({ method }) => {
    const meta = methodMeta(method);
    return (
        <span className={`fin-method ${method ? "" : "is-unspecified"}`}>
            <Icon name={meta.icon} size={15} />
            {meta.label}
        </span>
    );
};

const entryDetail = entry => {
    switch (entry.kind) {
        case "sale":
            return entry.detail ? `Vendedor: ${entry.detail}` : "Venta del local";
        case "movement":
            return `Categoría: ${CATEGORY_LABEL[entry.category] || "Otro"}${entry.detail ? ` · ${entry.detail}` : ""}`;
        case "payout":
        case "advance":
            return `Barbero: ${entry.detail}`;
        default:
            return entry.detail || "—";
    }
};

const dayHeading = iso => {
    const today = todayIso();
    if (iso === today) return "Hoy";
    if (iso === toISODate(addDays(new Date(), -1))) return "Ayer";
    return parseDateOnly(iso).toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" });
};

const CashTab = ({ from, to, refreshKey, onRegisterMovement, onChanged }) => {
    const { showToast } = useToast();
    const [summary, setSummary] = useState(null);
    const [summaryError, setSummaryError] = useState("");
    const [ledger, setLedger] = useState(null);
    const [ledgerLoading, setLedgerLoading] = useState(true);
    const [ledgerError, setLedgerError] = useState("");
    const [direction, setDirection] = useState("");
    const [method, setMethod] = useState("");
    const [page, setPage] = useState(1);
    const [deleting, setDeleting] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const ledgerRequest = useRef(0);

    useEffect(() => {
        setPage(1);
    }, [from, to, direction, method]);

    useEffect(() => {
        let cancelled = false;
        setSummaryError("");
        getCashSummary(from, to)
            .then(data => !cancelled && setSummary(data))
            .catch(() => !cancelled && setSummaryError("No se pudo cargar el resumen de caja."));
        return () => {
            cancelled = true;
        };
    }, [from, to, refreshKey]);

    useEffect(() => {
        const requestId = ++ledgerRequest.current;
        setLedgerLoading(true);
        setLedgerError("");
        getCashLedger({ from, to, direction, method, page, limit: PAGE_SIZE })
            .then(data => requestId === ledgerRequest.current && setLedger(data))
            .catch(() => requestId === ledgerRequest.current && setLedgerError("No se pudo cargar el libro de caja."))
            .finally(() => requestId === ledgerRequest.current && setLedgerLoading(false));
    }, [from, to, direction, method, page, refreshKey]);

    const handleDelete = async () => {
        setDeleteLoading(true);
        try {
            await deleteCashMovement(deleting.ref_id);
            showToast("Movimiento eliminado.");
            setDeleting(null);
            onChanged();
        } catch (err) {
            showToast(financeErrorMessage(err, "No se pudo eliminar el movimiento."), "error");
        } finally {
            setDeleteLoading(false);
        }
    };

    const balance = summary?.balance;
    const period = summary?.period;
    const days = daysBetween(from, to);
    const entries = ledger?.data || [];
    const pagination = ledger?.pagination;

    const groups = entries.reduce((acc, entry) => {
        const last = acc[acc.length - 1];
        if (last && last.day === entry.occurred_on) last.items.push(entry);
        else acc.push({ day: entry.occurred_on, items: [entry] });
        return acc;
    }, []);

    return (
        <div className="cash-tab">
            {summaryError && <InlineFeedback tone="error">{summaryError}</InlineFeedback>}

            <section className="fin-card cash-balance" aria-labelledby="cash-balance-title">
                <div className="cash-balance-top">
                    <div>
                        <span id="cash-balance-title" className="fin-label">
                            Saldo total acumulado
                        </span>
                        {balance ? (
                            <p className={`cash-balance-total ${balance.total < 0 ? "is-negative" : ""}`}>
                                {money(balance.total)}
                                <span className="fin-currency">ARS</span>
                            </p>
                        ) : (
                            <Skeleton height="48px" width="260px" />
                        )}
                    </div>
                    <span className="fin-chip">
                        <Icon name="event" size={16} />
                        Al {formatDayYear(to)}
                    </span>
                </div>
                <div className="cash-balance-grid">
                    {BALANCE_ITEMS.map(item => (
                        <div key={item.key} className={`cash-method-card is-${item.tone}`}>
                            <div className="cash-method-head">
                                <span className="cash-method-label">{item.label}</span>
                                <span className="cash-method-icon">
                                    <Icon name={item.icon} size={20} />
                                </span>
                            </div>
                            {balance ? (
                                <span className={`cash-method-value ${balance[item.key] < 0 ? "is-negative" : ""}`}>
                                    {money(balance[item.key])}
                                </span>
                            ) : (
                                <Skeleton height="28px" width="140px" />
                            )}
                            <span className="cash-method-hint">{item.hint}</span>
                        </div>
                    ))}
                </div>
            </section>

            <section className="cash-period" aria-labelledby="cash-period-title">
                <div className="fin-section-head">
                    <h2 id="cash-period-title" className="fin-section-title">
                        Resumen del período <span className="cash-period-range">({formatRangeLong(from, to)})</span>
                    </h2>
                    <span className="fin-chip">
                        {days} {days === 1 ? "día" : "días"}
                    </span>
                </div>

                {!period ? (
                    <div className="cash-period-grid">
                        <Skeleton height="320px" />
                        <Skeleton height="320px" />
                    </div>
                ) : (
                    <>
                        <div className="cash-period-grid">
                            <div className="cash-flow is-in">
                                <div className="cash-flow-head">
                                    <span className="cash-flow-title">
                                        <span className="cash-flow-dot" aria-hidden="true" />
                                        Ingresos
                                    </span>
                                    <span className="fin-tag is-sage">Entradas</span>
                                </div>
                                <ul className="cash-flow-list">
                                    <li className="cash-flow-item has-breakdown">
                                        <div className="cash-flow-row">
                                            <span className="cash-flow-name">
                                                Servicios de barbería
                                                <span className="cash-flow-meta">
                                                    ({period.income.services.count}{" "}
                                                    {period.income.services.count === 1 ? "corte" : "cortes"})
                                                </span>
                                            </span>
                                            <span className="cash-flow-amount">{formatMoney(period.income.services.total)}</span>
                                        </div>
                                        <div className="cash-flow-breakdown">
                                            {["cash", "transfer", "unspecified"]
                                                .filter(key => key !== "unspecified" || period.income.services.unspecified > 0)
                                                .map(key => (
                                                    <span key={key}>
                                                        <span>{methodMeta(key).label}</span>
                                                        <span>{formatMoney(period.income.services[key])}</span>
                                                    </span>
                                                ))}
                                        </div>
                                    </li>
                                    <li className="cash-flow-item">
                                        <div className="cash-flow-row">
                                            <span className="cash-flow-name">
                                                Venta de productos
                                                <span className="cash-flow-meta">
                                                    ({period.income.products.count}{" "}
                                                    {period.income.products.count === 1 ? "venta" : "ventas"})
                                                </span>
                                            </span>
                                            <span className="cash-flow-amount">{formatMoney(period.income.products.total)}</span>
                                        </div>
                                    </li>
                                    <li className="cash-flow-item">
                                        <div className="cash-flow-row">
                                            <span className="cash-flow-name">
                                                Otros ingresos
                                                <span className="cash-flow-hint">Saldo inicial, reintegros y aportes</span>
                                            </span>
                                            <span className="cash-flow-amount">{formatMoney(period.income.other.total)}</span>
                                        </div>
                                    </li>
                                </ul>
                                <div className="cash-flow-total">
                                    <span>Total de ingresos</span>
                                    <span>
                                        {formatMoney(period.income.total)}
                                        <span className="fin-currency">ARS</span>
                                    </span>
                                </div>
                            </div>

                            <div className="cash-flow is-out">
                                <div className="cash-flow-head">
                                    <span className="cash-flow-title">
                                        <span className="cash-flow-dot" aria-hidden="true" />
                                        Egresos
                                    </span>
                                    <span className="fin-tag is-danger">Salidas</span>
                                </div>
                                <ul className="cash-flow-list">
                                    {OUT_CATEGORIES.map(category => {
                                        const amount = period.outflow.expenses_by_category[category.value] || 0;
                                        return (
                                            <li key={category.value} className={`cash-flow-item ${amount ? "" : "is-zero"}`}>
                                                <div className="cash-flow-row">
                                                    <span className="cash-flow-name">
                                                        {category.label}
                                                        <span className="cash-flow-hint">{category.hint}</span>
                                                    </span>
                                                    <span className="cash-flow-amount">{formatMoney(amount)}</span>
                                                </div>
                                            </li>
                                        );
                                    })}
                                    <li className={`cash-flow-item is-team ${period.outflow.payouts.total ? "" : "is-zero"}`}>
                                        <div className="cash-flow-row">
                                            <span className="cash-flow-name">
                                                Liquidaciones a barberos
                                                <span className="cash-flow-hint">
                                                    {period.outflow.payouts.count}{" "}
                                                    {period.outflow.payouts.count === 1 ? "pago registrado" : "pagos registrados"}
                                                </span>
                                            </span>
                                            <span className="cash-flow-amount">{formatMoney(period.outflow.payouts.total)}</span>
                                        </div>
                                    </li>
                                    <li className={`cash-flow-item is-team ${period.outflow.advances.total ? "" : "is-zero"}`}>
                                        <div className="cash-flow-row">
                                            <span className="cash-flow-name">
                                                Adelantos entregados
                                                <span className="cash-flow-hint">
                                                    {period.outflow.advances.count}{" "}
                                                    {period.outflow.advances.count === 1 ? "adelanto" : "adelantos"}
                                                </span>
                                            </span>
                                            <span className="cash-flow-amount">{formatMoney(period.outflow.advances.total)}</span>
                                        </div>
                                    </li>
                                </ul>
                                <div className="cash-flow-total">
                                    <span>Total de egresos</span>
                                    <span>
                                        {formatMoney(period.outflow.total)}
                                        <span className="fin-currency">ARS</span>
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className={`cash-result ${period.net < 0 ? "is-negative" : "is-positive"}`}>
                            <span className="cash-result-icon">
                                <Icon name="balance" size={24} />
                            </span>
                            <div className="cash-result-text">
                                <span className="fin-label">Resultado del período</span>
                                <span className="cash-result-formula">
                                    Ingresos ({formatMoney(period.income.total)}) − Egresos ({formatMoney(period.outflow.total)})
                                </span>
                            </div>
                            <span className={`fin-tag ${period.net < 0 ? "is-danger" : "is-sage"}`}>
                                {period.net < 0 ? "En contra" : "A favor"}
                            </span>
                            <span className="cash-result-amount">
                                {period.net < 0 ? "−" : "+"} {formatMoney(Math.abs(period.net))}
                                <span className="fin-currency">ARS</span>
                            </span>
                        </div>
                    </>
                )}
            </section>

            <section className="fin-card cash-ledger" aria-labelledby="cash-ledger-title">
                <div className="fin-section-head">
                    <div>
                        <h2 id="cash-ledger-title" className="fin-section-title">
                            Libro de caja
                        </h2>
                        <p className="fin-section-sub">Todos los ingresos y egresos del período, del más reciente al más viejo.</p>
                    </div>
                    <div className="cash-ledger-filters">
                        <SegmentedControl
                            label="Filtrar por tipo"
                            size="sm"
                            value={direction || "all"}
                            onChange={value => setDirection(value === "all" ? "" : value)}
                            options={[
                                { value: "all", label: "Todos" },
                                { value: "in", label: "Ingresos" },
                                { value: "out", label: "Egresos" },
                            ]}
                        />
                        <Select
                            value={method || "all"}
                            onChange={value => setMethod(value === "all" ? "" : value)}
                            options={[
                                { value: "all", label: "Todos los medios" },
                                { value: "cash", label: "Efectivo" },
                                { value: "transfer", label: "Transferencia" },
                            ]}
                            className="cash-method-filter"
                            aria-label="Filtrar por medio de pago"
                        />
                    </div>
                </div>

                {ledgerError ? (
                    <InlineFeedback tone="error">{ledgerError}</InlineFeedback>
                ) : ledgerLoading && !ledger ? (
                    <div className="fin-skeleton">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <Skeleton key={i} height="52px" />
                        ))}
                    </div>
                ) : entries.length === 0 ? (
                    <div className="fin-empty">
                        <Icon name="receipt_long" size={36} />
                        <span className="fin-empty-title">Sin movimientos en este período</span>
                        <p>Probá con otro rango de fechas o registrá un gasto o ingreso manual.</p>
                        <Button variant="secondary" icon="add" onClick={onRegisterMovement}>
                            Registrar movimiento
                        </Button>
                    </div>
                ) : (
                    <div className={`cash-ledger-body ${ledgerLoading ? "is-refreshing" : ""}`} aria-busy={ledgerLoading}>
                        <div className="fin-table-wrap cash-table-wrap">
                            <table className="fin-table cash-table">
                                <thead>
                                    <tr>
                                        <th scope="col">Fecha</th>
                                        <th scope="col">Tipo</th>
                                        <th scope="col">Concepto</th>
                                        <th scope="col">Detalle</th>
                                        <th scope="col">Medio de pago</th>
                                        <th scope="col" className="is-num">
                                            Monto
                                        </th>
                                        <th scope="col" className="is-actions">
                                            <span className="visually-hidden">Acciones</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {entries.map(entry => {
                                        const kind = ledgerKind(entry);
                                        return (
                                            <tr key={`${entry.kind}-${entry.ref_id}`} className={`is-${entry.direction}`}>
                                                <td className="cash-date">
                                                    <span>{formatDay(entry.occurred_on)}</span>
                                                    {entry.occurred_time && <span className="fin-muted">{entry.occurred_time}</span>}
                                                </td>
                                                <td>
                                                    <span className={`fin-kind is-${entry.direction}`}>
                                                        <Icon name={kind.icon} size={15} />
                                                        {kind.label}
                                                    </span>
                                                </td>
                                                <td className="cash-concept">{entry.concept}</td>
                                                <td className="cash-detail">{entryDetail(entry)}</td>
                                                <td>
                                                    <MethodChip method={entry.payment_method} />
                                                </td>
                                                <td className={`is-num cash-amount ${entry.direction === "out" ? "is-negative" : "is-positive"}`}>
                                                    {signedMoney(entry.amount, entry.direction)}
                                                </td>
                                                <td className="is-actions">
                                                    {entry.kind === "movement" ? (
                                                        <button
                                                            type="button"
                                                            className="fin-icon-btn is-danger"
                                                            aria-label={`Eliminar movimiento: ${entry.concept}`}
                                                            onClick={() => setDeleting(entry)}
                                                        >
                                                            <Icon name="delete" size={18} />
                                                        </button>
                                                    ) : null}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        <div className="cash-cards">
                            {groups.map(group => (
                                <section key={group.day} className="cash-day">
                                    <div className="cash-day-head">
                                        <span>{dayHeading(group.day)}</span>
                                        <span className="fin-muted">
                                            {group.items.length} {group.items.length === 1 ? "movimiento" : "movimientos"}
                                        </span>
                                    </div>
                                    <ul className="cash-day-list">
                                        {group.items.map(entry => {
                                            const kind = ledgerKind(entry);
                                            return (
                                                <li key={`${entry.kind}-${entry.ref_id}`} className={`cash-entry is-${entry.direction}`}>
                                                    <span className="cash-entry-icon" aria-hidden="true">
                                                        <Icon name={kind.icon} size={22} />
                                                    </span>
                                                    <div className="cash-entry-text">
                                                        <span className="cash-entry-concept">{entry.concept}</span>
                                                        <span className="cash-entry-detail">
                                                            {kind.label} · {entryDetail(entry)}
                                                            {entry.occurred_time ? ` · ${entry.occurred_time}` : ""}
                                                        </span>
                                                        <MethodChip method={entry.payment_method} />
                                                    </div>
                                                    <div className="cash-entry-side">
                                                        <span className={`cash-entry-amount ${entry.direction === "out" ? "is-negative" : "is-positive"}`}>
                                                            {signedMoney(entry.amount, entry.direction)}
                                                        </span>
                                                        {entry.kind === "movement" && (
                                                            <button
                                                                type="button"
                                                                className="fin-icon-btn is-danger"
                                                                aria-label={`Eliminar movimiento: ${entry.concept}`}
                                                                onClick={() => setDeleting(entry)}
                                                            >
                                                                <Icon name="delete" size={18} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </section>
                            ))}
                        </div>

                        {pagination && (
                            <div className="fin-pagination">
                                <span>
                                    Página {pagination.page} de {Math.max(pagination.totalPages, 1)} · {pagination.total}{" "}
                                    {pagination.total === 1 ? "movimiento" : "movimientos"}
                                </span>
                                {pagination.totalPages > 1 && (
                                    <div className="fin-pagination-actions">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            icon="chevron_left"
                                            disabled={page <= 1 || ledgerLoading}
                                            onClick={() => setPage(p => Math.max(1, p - 1))}
                                        >
                                            Anterior
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            iconRight="chevron_right"
                                            disabled={page >= pagination.totalPages || ledgerLoading}
                                            onClick={() => setPage(p => p + 1)}
                                        >
                                            Siguiente
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </section>

            <ConfirmDialog
                open={Boolean(deleting)}
                icon="delete"
                title="Eliminar movimiento"
                message={
                    deleting
                        ? `Se borra “${deleting.concept}” (${signedMoney(deleting.amount, deleting.direction)}) del libro de caja.${
                              deleting.category === "product_restock"
                                  ? " También se descuentan las unidades que había sumado al stock."
                                  : ""
                          }`
                        : ""
                }
                confirmLabel="Eliminar movimiento"
                loading={deleteLoading}
                onConfirm={handleDelete}
                onClose={() => setDeleting(null)}
            />
        </div>
    );
};

export default CashTab;
