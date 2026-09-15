import { useEffect, useState } from "react";
import { deletePayout, getPayouts, getPendingPayouts } from "../../services/finance";
import { addDays, toISODate } from "../../utils/date";
import { formatMoney, getInitials } from "../../utils/format";
import Button from "../ui/Button";
import ConfirmDialog from "../ui/ConfirmDialog";
import Icon from "../ui/Icon";
import InlineFeedback from "../ui/InlineFeedback";
import Skeleton from "../ui/Skeleton";
import { useToast } from "../ui/Toast";
import PayoutDrawer from "./PayoutDrawer";
import PayoutReceiptModal from "./PayoutReceiptModal";
import { PAYOUT_PRESETS, financeErrorMessage, formatDay, formatDayYear, formatTimestamp, methodMeta, money, todayIso } from "./financeUtils";
import "./PayoutsTab.css";

const HISTORY_DAYS = 90;

const rowState = barber => {
    if (barber.net_amount < 0) return "blocked";
    if (barber.services_count === 0 && barber.sales_count === 0 && barber.advances_amount === 0) return "clear";
    if (barber.services_count === 0 && barber.sales_count === 0) return "blocked";
    return "pending";
};

const PayoutsTab = ({ refreshKey, onAdvance, onChanged }) => {
    const { showToast } = useToast();
    const [upTo, setUpTo] = useState(todayIso());
    const [pending, setPending] = useState(null);
    const [pendingError, setPendingError] = useState("");
    const [history, setHistory] = useState(null);
    const [historyError, setHistoryError] = useState("");
    const [payingBarber, setPayingBarber] = useState(null);
    const [receiptId, setReceiptId] = useState(null);
    const [voiding, setVoiding] = useState(null);
    const [voidLoading, setVoidLoading] = useState(false);

    useEffect(() => {
        let cancelled = false;
        setPendingError("");
        getPendingPayouts(upTo)
            .then(data => !cancelled && setPending(data))
            .catch(() => !cancelled && setPendingError("No se pudo calcular lo pendiente de cada barbero."));
        return () => {
            cancelled = true;
        };
    }, [upTo, refreshKey]);

    useEffect(() => {
        let cancelled = false;
        setHistoryError("");
        getPayouts(toISODate(addDays(new Date(), -HISTORY_DAYS)), todayIso())
            .then(data => !cancelled && setHistory(data))
            .catch(() => !cancelled && setHistoryError("No se pudo cargar el historial de pagos."));
        return () => {
            cancelled = true;
        };
    }, [refreshKey]);

    const handleVoid = async () => {
        setVoidLoading(true);
        try {
            await deletePayout(voiding.id);
            showToast("Pago anulado: todo volvió a quedar pendiente.");
            setVoiding(null);
            onChanged();
        } catch (err) {
            showToast(financeErrorMessage(err, "No se pudo anular el pago."), "error");
        } finally {
            setVoidLoading(false);
        }
    };

    const barbers = pending?.barbers || [];
    const totals = pending?.totals;
    const revenue = barbers.reduce((sum, b) => sum + b.services_revenue, 0);
    const salesCount = barbers.reduce((sum, b) => sum + b.sales_count, 0);
    const advancesCount = barbers.reduce((sum, b) => sum + b.advances_count, 0);
    const activePreset = PAYOUT_PRESETS.find(preset => preset.date() === upTo)?.value;

    const renderNet = barber => {
        const state = rowState(barber);
        if (state === "clear") return <span className="fin-tag is-muted">Al día</span>;
        if (state === "blocked") {
            return (
                <span className="payout-net is-blocked">
                    <span className="payout-net-value">{money(barber.net_amount)}</span>
                    <span className="payout-net-note">Adelantos superan lo generado</span>
                </span>
            );
        }
        return (
            <span className="payout-net">
                <span className="payout-net-value">{formatMoney(barber.net_amount)}</span>
            </span>
        );
    };

    const renderActions = barber => {
        const state = rowState(barber);
        return (
            <div className="payout-actions">
                <Button variant="secondary" size="sm" icon="payments" onClick={() => onAdvance(barber.barber_id)}>
                    Adelanto
                </Button>
                <Button
                    size="sm"
                    icon={state === "blocked" ? "lock" : "check_circle"}
                    disabled={state !== "pending"}
                    onClick={() => setPayingBarber(barber)}
                    aria-label={`Pagar a ${barber.first_name} ${barber.last_name}`}
                >
                    {state === "blocked" ? "Bloqueado" : state === "clear" ? "Sin saldo" : "Pagar"}
                </Button>
            </div>
        );
    };

    return (
        <div className="payouts-tab">
            <section className="fin-card payouts-control" aria-label="Fecha de corte y totales">
                <div className="payouts-upto">
                    <label className="fin-label" htmlFor="payout-upto">
                        Liquidar hasta
                    </label>
                    <div className="payouts-upto-row">
                        <span className="fin-date">
                            <Icon name="calendar_today" size={18} />
                            <input
                                id="payout-upto"
                                type="date"
                                max={todayIso()}
                                value={upTo}
                                onChange={e => e.target.value && setUpTo(e.target.value)}
                            />
                        </span>
                        <div className="payouts-presets" role="group" aria-label="Atajos de fecha">
                            {PAYOUT_PRESETS.map(preset => (
                                <button
                                    key={preset.value}
                                    type="button"
                                    className={`fin-preset ${activePreset === preset.value ? "is-active" : ""}`}
                                    aria-pressed={activePreset === preset.value}
                                    onClick={() => setUpTo(preset.date())}
                                >
                                    {preset.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <dl className="payouts-stats">
                    <div className="payouts-stat is-main">
                        <dt>Total a pagar</dt>
                        <dd>{totals ? formatMoney(totals.net_amount) : "—"}</dd>
                        <span>neto acumulado</span>
                    </div>
                    <div className="payouts-stat">
                        <dt>Cortes pendientes</dt>
                        <dd>{totals ? `${totals.services_count} ${totals.services_count === 1 ? "corte" : "cortes"}` : "—"}</dd>
                        <span>{formatMoney(revenue)} facturado</span>
                    </div>
                    <div className="payouts-stat">
                        <dt>Comisiones por productos</dt>
                        <dd className="is-positive">{totals ? `+ ${formatMoney(totals.commissions_amount)}` : "—"}</dd>
                        <span>
                            {salesCount} {salesCount === 1 ? "venta" : "ventas"}
                        </span>
                    </div>
                    <div className="payouts-stat">
                        <dt>Adelantos a descontar</dt>
                        <dd className="is-negative">{totals ? `− ${formatMoney(totals.advances_amount)}` : "—"}</dd>
                        <span>
                            {advancesCount} {advancesCount === 1 ? "adelanto" : "adelantos"}
                        </span>
                    </div>
                </dl>
            </section>

            <section className="fin-card" aria-labelledby="payouts-pending-title">
                <div className="fin-section-head">
                    <div>
                        <h2 id="payouts-pending-title" className="fin-section-title">
                            Pendiente por barbero
                        </h2>
                        <p className="fin-section-sub">Lo generado y todavía no pagado hasta el {formatDayYear(upTo)}.</p>
                    </div>
                </div>

                {pendingError ? (
                    <InlineFeedback tone="error">{pendingError}</InlineFeedback>
                ) : !pending ? (
                    <div className="fin-skeleton">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <Skeleton key={i} height="72px" />
                        ))}
                    </div>
                ) : barbers.length === 0 ? (
                    <div className="fin-empty">
                        <Icon name="group" size={36} />
                        <span className="fin-empty-title">No hay barberos en el equipo</span>
                        <p>Cargalos en Barberos y equipo para calcular sus liquidaciones.</p>
                    </div>
                ) : (
                    <>
                        <div className="fin-table-wrap payouts-table-wrap">
                            <table className="fin-table payouts-table">
                                <thead>
                                    <tr>
                                        <th scope="col">Barbero</th>
                                        <th scope="col">Cortes sin pagar</th>
                                        <th scope="col" className="is-num">
                                            Le corresponde
                                        </th>
                                        <th scope="col" className="is-num">
                                            Comis. ventas
                                        </th>
                                        <th scope="col" className="is-num">
                                            Adelantos
                                        </th>
                                        <th scope="col" className="is-num">
                                            Neto a pagar
                                        </th>
                                        <th scope="col" className="is-actions">
                                            <span className="visually-hidden">Acciones</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {barbers.map(barber => (
                                        <tr key={barber.barber_id} className={`is-${rowState(barber)}`}>
                                            <td>
                                                <span className="payout-barber">
                                                    <span className="fin-avatar">{getInitials(barber.first_name, barber.last_name)}</span>
                                                    <span className="payout-barber-text">
                                                        <span className="payout-barber-name">
                                                            {barber.first_name} {barber.last_name}
                                                        </span>
                                                        <span className="fin-muted">
                                                            Comisión {Number(barber.earnings_split_percentage)}% ·{" "}
                                                            {barber.last_period_to
                                                                ? `pagado hasta ${formatDay(barber.last_period_to)}`
                                                                : "nunca se le pagó"}
                                                        </span>
                                                    </span>
                                                </span>
                                            </td>
                                            <td className="payout-cuts">
                                                <span>
                                                    {barber.services_count} {barber.services_count === 1 ? "corte" : "cortes"}
                                                </span>
                                                <span className="fin-muted">
                                                    {barber.oldest_date ? `desde ${formatDay(barber.oldest_date)}` : "—"}
                                                </span>
                                            </td>
                                            <td className="is-num payout-earn">
                                                <span>{formatMoney(barber.services_earnings)}</span>
                                                <span className="fin-muted">de {formatMoney(barber.services_revenue)}</span>
                                            </td>
                                            <td className={`is-num ${barber.commissions_amount ? "is-positive" : "fin-muted"}`}>
                                                {barber.commissions_amount ? `+ ${formatMoney(barber.commissions_amount)}` : formatMoney(0)}
                                            </td>
                                            <td className={`is-num ${barber.advances_amount ? "is-negative" : "fin-muted"}`}>
                                                {barber.advances_amount ? `− ${formatMoney(barber.advances_amount)}` : formatMoney(0)}
                                            </td>
                                            <td className="is-num">{renderNet(barber)}</td>
                                            <td className="is-actions">{renderActions(barber)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <ul className="payout-cards">
                            {barbers.map(barber => {
                                const state = rowState(barber);
                                return (
                                    <li key={barber.barber_id} className={`payout-card is-${state}`}>
                                        <div className="payout-card-head">
                                            <span className="fin-avatar">{getInitials(barber.first_name, barber.last_name)}</span>
                                            <span className="payout-barber-text">
                                                <span className="payout-barber-name">
                                                    {barber.first_name} {barber.last_name}
                                                </span>
                                                <span className="fin-muted">Comisión {Number(barber.earnings_split_percentage)}%</span>
                                            </span>
                                        </div>
                                        <div className="payout-card-chips">
                                            <span className="fin-chip">
                                                {barber.services_count} {barber.services_count === 1 ? "corte" : "cortes"}
                                            </span>
                                            {barber.commissions_amount > 0 && (
                                                <span className="fin-chip is-positive">+ {formatMoney(barber.commissions_amount)} com.</span>
                                            )}
                                            {barber.advances_amount > 0 && (
                                                <span className="fin-chip is-negative">− {formatMoney(barber.advances_amount)} adel.</span>
                                            )}
                                        </div>
                                        <div className="payout-card-net">
                                            <span className="fin-label">Neto a pagar</span>
                                            {renderNet(barber)}
                                            <span className="fin-muted">
                                                {barber.last_period_to ? `Pagado hasta ${formatDay(barber.last_period_to)}` : "Nunca se le pagó"}
                                            </span>
                                        </div>
                                        {renderActions(barber)}
                                    </li>
                                );
                            })}
                        </ul>
                    </>
                )}
            </section>

            <section className="fin-card" aria-labelledby="payouts-history-title">
                <div className="fin-section-head">
                    <div>
                        <h2 id="payouts-history-title" className="fin-section-title">
                            Historial de pagos
                        </h2>
                        <p className="fin-section-sub">Liquidaciones registradas en los últimos {HISTORY_DAYS} días.</p>
                    </div>
                </div>

                {historyError ? (
                    <InlineFeedback tone="error">{historyError}</InlineFeedback>
                ) : !history ? (
                    <div className="fin-skeleton">
                        <Skeleton height="52px" />
                        <Skeleton height="52px" />
                    </div>
                ) : history.length === 0 ? (
                    <div className="fin-empty">
                        <Icon name="receipt_long" size={36} />
                        <span className="fin-empty-title">Todavía no hay pagos</span>
                        <p>Cuando le pagues a un barbero, el comprobante queda acá.</p>
                    </div>
                ) : (
                    <div className="fin-table-wrap">
                        <table className="fin-table payouts-history">
                            <thead>
                                <tr>
                                    <th scope="col">Fecha de pago</th>
                                    <th scope="col">Barbero</th>
                                    <th scope="col">Período</th>
                                    <th scope="col" className="is-num">
                                        Cortes
                                    </th>
                                    <th scope="col" className="is-num">
                                        Comisiones
                                    </th>
                                    <th scope="col" className="is-num">
                                        Adelantos
                                    </th>
                                    <th scope="col" className="is-num">
                                        Neto pagado
                                    </th>
                                    <th scope="col">Medio</th>
                                    <th scope="col" className="is-actions">
                                        <span className="visually-hidden">Acciones</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {history.map(payout => {
                                    const paid = formatTimestamp(payout.paid_at);
                                    return (
                                        <tr key={payout.id}>
                                            <td className="cash-date">
                                                <span>
                                                    {paid.day} {paid.year}
                                                </span>
                                                <span className="fin-muted">{paid.time} hs</span>
                                                {payout.created_by_first_name && (
                                                    <span className="payout-by">Registró {payout.created_by_first_name}</span>
                                                )}
                                            </td>
                                            <td>
                                                <span className="payout-barber is-compact">
                                                    <span className="fin-avatar">
                                                        {getInitials(payout.barber_first_name, payout.barber_last_name)}
                                                    </span>
                                                    <span className="payout-barber-name">
                                                        {payout.barber_first_name} {payout.barber_last_name}
                                                    </span>
                                                </span>
                                            </td>
                                            <td className="payout-period">
                                                {formatDay(payout.period_from)} – {formatDayYear(payout.period_to)}
                                            </td>
                                            <td className="is-num">{payout.services_count}</td>
                                            <td className="is-num is-positive">+ {formatMoney(payout.commissions_amount)}</td>
                                            <td className={`is-num ${payout.advances_amount ? "is-negative" : "fin-muted"}`}>
                                                {payout.advances_amount ? `− ${formatMoney(payout.advances_amount)}` : formatMoney(0)}
                                            </td>
                                            <td className="is-num payout-paid">{formatMoney(payout.net_amount)}</td>
                                            <td>
                                                <span className="fin-method">
                                                    <Icon name={methodMeta(payout.payment_method).icon} size={15} />
                                                    {methodMeta(payout.payment_method).label}
                                                </span>
                                            </td>
                                            <td className="is-actions">
                                                <div className="payout-history-actions">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        icon="receipt"
                                                        onClick={() => setReceiptId(payout.id)}
                                                        aria-label={`Ver comprobante del pago a ${payout.barber_first_name}`}
                                                    >
                                                        <span className="payout-receipt-label">Comprobante</span>
                                                    </Button>
                                                    <button
                                                        type="button"
                                                        className="fin-icon-btn is-danger"
                                                        aria-label={`Anular el pago a ${payout.barber_first_name}`}
                                                        onClick={() => setVoiding(payout)}
                                                    >
                                                        <Icon name="undo" size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            <PayoutDrawer
                barber={payingBarber}
                upTo={upTo}
                onClose={() => setPayingBarber(null)}
                onPaid={() => {
                    setPayingBarber(null);
                    onChanged();
                }}
            />
            <PayoutReceiptModal payoutId={receiptId} onClose={() => setReceiptId(null)} />
            <ConfirmDialog
                open={Boolean(voiding)}
                icon="undo"
                title="Anular pago"
                message={
                    voiding
                        ? `Se anula el pago de ${formatMoney(voiding.net_amount)} a ${voiding.barber_first_name}. Sus cortes, comisiones y adelantos vuelven a quedar pendientes.`
                        : ""
                }
                confirmLabel="Anular pago"
                loading={voidLoading}
                onConfirm={handleVoid}
                onClose={() => setVoiding(null)}
            />
        </div>
    );
};

export default PayoutsTab;
