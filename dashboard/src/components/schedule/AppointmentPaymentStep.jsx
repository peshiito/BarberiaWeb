import { useRef } from "react";
import { formatMoney } from "../../utils/format";
import Icon from "../ui/Icon";
import "./AppointmentPaymentStep.css";

const METHODS = [
    { value: "cash", label: "Efectivo", hint: "En mano, entra a la caja", icon: "payments" },
    { value: "transfer", label: "Transferencia", hint: "A la cuenta de la barbería", icon: "account_balance" },
];

// Paso final al completar un turno: registrar cómo pagó el cliente.
const AppointmentPaymentStep = ({ price, method, onChange }) => {
    const refs = useRef([]);

    const handleKeyDown = (e, index) => {
        const step = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
        if (!step) return;
        e.preventDefault();
        const next = (index + step + METHODS.length) % METHODS.length;
        onChange(METHODS[next].value);
        refs.current[next]?.focus();
    };

    return (
        <section className="appt-pay" aria-labelledby="appt-pay-title">
            <div className="appt-pay-head">
                <div className="appt-pay-title-wrap">
                    <span className="appt-pay-eyebrow">
                        <span className="appt-pay-eyebrow-dot" aria-hidden="true" />
                        Cobro // Paso final
                    </span>
                    <h3 id="appt-pay-title" className="appt-pay-title">
                        ¿Cómo pagó el cliente?
                    </h3>
                </div>
                <div className="appt-pay-total">
                    <span className="t-label">Total a cobrar</span>
                    <span className="appt-pay-amount">
                        {formatMoney(price)}
                        <span className="appt-detail-currency">ARS</span>
                    </span>
                </div>
            </div>

            <div className="appt-pay-options" role="radiogroup" aria-labelledby="appt-pay-title">
                {METHODS.map((option, index) => {
                    const checked = method === option.value;
                    const focusable = checked || (!method && index === 0);
                    return (
                        <button
                            key={option.value}
                            ref={node => {
                                refs.current[index] = node;
                            }}
                            type="button"
                            role="radio"
                            aria-checked={checked}
                            tabIndex={focusable ? 0 : -1}
                            className={`appt-pay-option ${checked ? "is-checked" : ""}`}
                            onClick={() => onChange(option.value)}
                            onKeyDown={e => handleKeyDown(e, index)}
                        >
                            <span className="appt-pay-option-top">
                                <span className="appt-pay-option-icon" aria-hidden="true">
                                    <Icon name={option.icon} size={20} />
                                </span>
                                <span className="appt-pay-radio" aria-hidden="true">
                                    <Icon name="check" size={13} />
                                </span>
                            </span>
                            <span className="appt-pay-option-label">{option.label}</span>
                            <span className="appt-pay-option-hint">{option.hint}</span>
                        </button>
                    );
                })}
            </div>

            <p className="appt-pay-note">
                <Icon name="info" size={15} />
                Queda registrado en la caja y en la liquidación del barbero.
            </p>
        </section>
    );
};

export default AppointmentPaymentStep;
