import { useEffect, useState } from "react";
import { getPayout } from "../../services/finance";
import { formatMoney } from "../../utils/format";
import Button from "../ui/Button";
import InlineFeedback from "../ui/InlineFeedback";
import Modal from "../ui/Modal";
import Skeleton from "../ui/Skeleton";
import PayoutLines from "./PayoutLines";
import { formatDay, formatDayYear, formatTimestamp, methodMeta } from "./financeUtils";

const PayoutReceiptModal = ({ payoutId, onClose }) => {
    const [payout, setPayout] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!payoutId) return undefined;
        let cancelled = false;
        setPayout(null);
        setError("");
        getPayout(payoutId)
            .then(data => !cancelled && setPayout(data))
            .catch(() => !cancelled && setError("No se pudo cargar el comprobante."));
        return () => {
            cancelled = true;
        };
    }, [payoutId]);

    const paid = payout ? formatTimestamp(payout.paid_at) : null;

    return (
        <Modal
            open={Boolean(payoutId)}
            onClose={onClose}
            size="lg"
            icon="receipt_long"
            eyebrow={`Comprobante LIQ-${payoutId}`}
            title={payout ? `${payout.barber_first_name} ${payout.barber_last_name}` : "Comprobante de pago"}
            subtitle={
                payout ? `Pagado el ${paid.day} ${paid.year} a las ${paid.time} hs · ${methodMeta(payout.payment_method).label}` : undefined
            }
            footer={
                <div className="fin-modal-footer">
                    <Button variant="secondary" onClick={onClose}>
                        Cerrar
                    </Button>
                </div>
            }
        >
            {error && <InlineFeedback tone="error">{error}</InlineFeedback>}
            {!payout && !error ? (
                <div className="fin-skeleton">
                    <Skeleton height="72px" />
                    <Skeleton height="220px" />
                </div>
            ) : (
                payout && (
                    <div className="payout-receipt">
                        <dl className="payout-receipt-meta">
                            <div>
                                <dt className="fin-label">Período</dt>
                                <dd>
                                    {formatDay(payout.period_from)} – {formatDayYear(payout.period_to)}
                                </dd>
                            </div>
                            <div>
                                <dt className="fin-label">Registrado por</dt>
                                <dd>
                                    {payout.created_by_first_name
                                        ? `${payout.created_by_first_name} ${payout.created_by_last_name || ""}`.trim()
                                        : "—"}
                                </dd>
                            </div>
                            {payout.note && (
                                <div className="is-wide">
                                    <dt className="fin-label">Nota</dt>
                                    <dd>{payout.note}</dd>
                                </div>
                            )}
                        </dl>

                        <PayoutLines
                            appointments={payout.appointments}
                            sales={payout.sales}
                            advances={payout.advances}
                            totals={payout}
                        />

                        <div className="payout-totals">
                            <div className="payout-totals-row">
                                <span>Cortes ({payout.services_count})</span>
                                <span>{formatMoney(payout.services_earnings)}</span>
                            </div>
                            <div className="payout-totals-row is-positive">
                                <span>Comisiones por productos</span>
                                <span>+ {formatMoney(payout.commissions_amount)}</span>
                            </div>
                            <div className="payout-totals-row is-negative">
                                <span>Adelantos descontados</span>
                                <span>− {formatMoney(payout.advances_amount)}</span>
                            </div>
                            <div className="payout-totals-net">
                                <span className="fin-label">Neto pagado</span>
                                <span className="payout-totals-amount">
                                    {formatMoney(payout.net_amount)}
                                    <span className="fin-currency">ARS</span>
                                </span>
                            </div>
                        </div>
                    </div>
                )
            )}
        </Modal>
    );
};

export default PayoutReceiptModal;
