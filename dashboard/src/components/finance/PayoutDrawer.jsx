import { useEffect, useState } from "react";
import { createPayout, getPendingPayoutDetail } from "../../services/finance";
import { formatMoney } from "../../utils/format";
import Button from "../ui/Button";
import Drawer from "../ui/Drawer";
import FormField from "../ui/FormField";
import Icon from "../ui/Icon";
import InlineFeedback from "../ui/InlineFeedback";
import Skeleton from "../ui/Skeleton";
import { useToast } from "../ui/Toast";
import PaymentMethodToggle from "./PaymentMethodToggle";
import PayoutLines from "./PayoutLines";
import { financeErrorMessage, formatDayYear, money } from "./financeUtils";

const PayoutDrawer = ({ barber, upTo, onClose, onPaid }) => {
    const { showToast } = useToast();
    const [detail, setDetail] = useState(null);
    const [error, setError] = useState("");
    const [method, setMethod] = useState("transfer");
    const [note, setNote] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!barber) return undefined;
        let cancelled = false;
        setDetail(null);
        setError("");
        setMethod("transfer");
        setNote("");
        getPendingPayoutDetail(barber.barber_id, upTo)
            .then(data => !cancelled && setDetail(data))
            .catch(() => !cancelled && setError("No se pudo cargar el detalle de la liquidación."));
        return () => {
            cancelled = true;
        };
    }, [barber, upTo]);

    const totals = detail?.totals;
    const blocked = totals ? totals.net_amount < 0 : false;
    const nothing = totals ? totals.services_count === 0 && totals.sales_count === 0 : false;
    const firstDates = detail
        ? [detail.appointments[0]?.date, detail.sales[0]?.sold_on].filter(Boolean).sort()
        : [];
    const periodFrom = firstDates[0] || upTo;

    const handleConfirm = async () => {
        setSaving(true);
        setError("");
        try {
            await createPayout({
                barber_id: barber.barber_id,
                up_to: upTo,
                payment_method: method,
                ...(note.trim() && { note: note.trim() }),
            });
            showToast(`Pago de ${formatMoney(totals.net_amount)} registrado para ${barber.first_name}.`);
            onPaid();
        } catch (err) {
            setError(financeErrorMessage(err, "No se pudo registrar el pago."));
        } finally {
            setSaving(false);
        }
    };

    return (
        <Drawer
            open={Boolean(barber)}
            onClose={onClose}
            eyebrow="Liquidación"
            title="Pagar liquidación"
            subtitle={barber ? `${barber.first_name} ${barber.last_name} · Comisión ${Number(barber.earnings_split_percentage)}%` : ""}
            className="payout-drawer"
            footer={
                <div className="payout-drawer-footer">
                    <Button
                        size="lg"
                        block
                        icon="check_circle"
                        onClick={handleConfirm}
                        loading={saving}
                        disabled={!totals || blocked || nothing}
                    >
                        {totals ? `Confirmar pago ${formatMoney(Math.max(totals.net_amount, 0))}` : "Confirmar pago"}
                    </Button>
                    <p className="payout-drawer-note">
                        Los cortes, ventas y adelantos incluidos quedan marcados como pagados. Si te equivocás, podés anular
                        el pago desde el historial.
                    </p>
                </div>
            }
        >
            {!detail && !error ? (
                <div className="fin-skeleton">
                    <Skeleton height="64px" />
                    <Skeleton height="200px" />
                    <Skeleton height="120px" />
                </div>
            ) : (
                detail && (
                    <div className="payout-drawer-body">
                        <div className="payout-period-box">
                            <Icon name="calendar_month" size={22} />
                            <div>
                                <span className="fin-label">Período incluido</span>
                                <span className="payout-period-value">
                                    {formatDayYear(periodFrom)} — {formatDayYear(upTo)}
                                </span>
                                <span className="fin-muted">Desde el corte más antiguo sin pagar</span>
                            </div>
                        </div>

                        <PayoutLines
                            appointments={detail.appointments}
                            sales={detail.sales}
                            advances={detail.advances}
                            totals={totals}
                        />

                        <div className={`payout-totals ${blocked ? "is-blocked" : ""}`}>
                            <div className="payout-totals-row">
                                <span>Cortes</span>
                                <span>{formatMoney(totals.services_earnings)}</span>
                            </div>
                            <div className="payout-totals-row is-positive">
                                <span>Comisiones por productos</span>
                                <span>+ {formatMoney(totals.commissions_amount)}</span>
                            </div>
                            <div className="payout-totals-row is-negative">
                                <span>Adelantos entregados</span>
                                <span>− {formatMoney(totals.advances_amount)}</span>
                            </div>
                            <div className="payout-totals-net">
                                <span className="fin-label">Neto a pagar</span>
                                <span className="payout-totals-amount">
                                    {money(totals.net_amount)}
                                    <span className="fin-currency">ARS</span>
                                </span>
                            </div>
                        </div>

                        {blocked && (
                            <InlineFeedback tone="error">
                                Los adelantos superan lo generado. Esperá a que genere más o eliminá algún adelanto.
                            </InlineFeedback>
                        )}

                        <FormField label="Medio de pago utilizado">
                            <PaymentMethodToggle value={method} onChange={setMethod} size="lg" />
                        </FormField>

                        <FormField label="Nota u observación" htmlFor="payout-note" aside="Opcional">
                            <textarea
                                id="payout-note"
                                rows={2}
                                maxLength={300}
                                placeholder="Ej: transferencia con comprobante 1234"
                                value={note}
                                onChange={e => setNote(e.target.value)}
                            />
                        </FormField>
                    </div>
                )
            )}
            {error && <InlineFeedback tone="error">{error}</InlineFeedback>}
        </Drawer>
    );
};

export default PayoutDrawer;
