import { useState } from "react";
import { formatMoney } from "../../utils/format";
import { formatDay, methodMeta } from "./financeUtils";

const VISIBLE_CUTS = 5;

// Desglose de una liquidación: cortes, comisiones por ventas y adelantos.
const PayoutLines = ({ appointments, sales, advances, totals }) => {
    const [showAll, setShowAll] = useState(false);
    const visible = showAll ? appointments : appointments.slice(0, VISIBLE_CUTS);
    const hidden = appointments.length - visible.length;

    return (
        <div className="payout-lines">
            <section className="payout-section">
                <div className="payout-section-head">
                    <span>
                        1. Cortes ({appointments.length} {appointments.length === 1 ? "servicio" : "servicios"})
                    </span>
                    <span className="is-brass">Subtotal: {formatMoney(totals.services_earnings)}</span>
                </div>
                {appointments.length === 0 ? (
                    <p className="payout-section-empty">Sin cortes pendientes hasta esta fecha.</p>
                ) : (
                    <ul className="payout-list">
                        {visible.map(item => (
                            <li key={item.id} className="payout-line">
                                <div className="payout-line-row">
                                    <span className="payout-line-title">{item.service_name || "Servicio"}</span>
                                    <span className="payout-line-amount is-brass">{formatMoney(item.earnings)}</span>
                                </div>
                                <div className="payout-line-row is-meta">
                                    <span>
                                        {formatDay(item.date)} {item.time.slice(0, 5)} ·{" "}
                                        {[item.client_first_name, item.client_last_name].filter(Boolean).join(" ")}
                                    </span>
                                    <span>
                                        {formatMoney(item.price)} ({Number(item.split_percentage)}%)
                                    </span>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
                {appointments.length > VISIBLE_CUTS && (
                    <button type="button" className="payout-more" onClick={() => setShowAll(v => !v)} aria-expanded={showAll}>
                        {showAll ? "Mostrar menos" : `Ver los ${hidden} ${hidden === 1 ? "corte restante" : "cortes restantes"}`}
                    </button>
                )}
            </section>

            <section className="payout-section">
                <div className="payout-section-head">
                    <span>2. Comisiones por ventas</span>
                    <span className="is-positive">Subtotal: + {formatMoney(totals.commissions_amount)}</span>
                </div>
                {sales.length === 0 ? (
                    <p className="payout-section-empty">Sin ventas con comisión.</p>
                ) : (
                    <ul className="payout-list">
                        {sales.map(item => (
                            <li key={item.id} className="payout-line">
                                <div className="payout-line-row">
                                    <span className="payout-line-title">
                                        {item.product_name} ×{item.quantity}
                                    </span>
                                    <span className="payout-line-amount is-positive">+ {formatMoney(item.commission_amount)}</span>
                                </div>
                                <div className="payout-line-row is-meta">
                                    <span>
                                        {formatDay(item.sold_on)} · Total venta {formatMoney(item.total)}
                                    </span>
                                    <span>Comisión {Number(item.commission_percentage)}%</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            <section className="payout-section">
                <div className="payout-section-head">
                    <span>3. Adelantos a descontar</span>
                    <span className="is-negative">Total: − {formatMoney(totals.advances_amount)}</span>
                </div>
                {advances.length === 0 ? (
                    <p className="payout-section-empty">Sin adelantos pendientes.</p>
                ) : (
                    <ul className="payout-list">
                        {advances.map(item => (
                            <li key={item.id} className="payout-line">
                                <div className="payout-line-row">
                                    <span className="payout-line-title">{item.note || "Adelanto"}</span>
                                    <span className="payout-line-amount is-negative">− {formatMoney(item.amount)}</span>
                                </div>
                                <div className="payout-line-row is-meta">
                                    <span>
                                        {formatDay(item.given_on)} · {methodMeta(item.payment_method).label}
                                        {item.created_by_first_name ? ` · Registró ${item.created_by_first_name.trim()}` : ""}
                                    </span>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </div>
    );
};

export default PayoutLines;
