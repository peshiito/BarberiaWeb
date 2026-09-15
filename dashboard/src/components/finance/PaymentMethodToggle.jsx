import { useRef } from "react";
import Icon from "../ui/Icon";
import { METHOD_META } from "./financeUtils";
import "./PaymentMethodToggle.css";

const METHODS = ["cash", "transfer"];

// Segmentado Efectivo / Transferencia con el patrón ARIA de radiogroup.
const PaymentMethodToggle = ({ value, onChange, label = "Medio de pago", size = "md" }) => {
    const refs = useRef([]);

    const handleKeyDown = (e, index) => {
        const step = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
        if (!step) return;
        e.preventDefault();
        const next = (index + step + METHODS.length) % METHODS.length;
        onChange(METHODS[next]);
        refs.current[next]?.focus();
    };

    return (
        <div className={`pay-toggle is-${size}`} role="radiogroup" aria-label={label}>
            {METHODS.map((method, index) => {
                const checked = value === method;
                return (
                    <button
                        key={method}
                        ref={node => {
                            refs.current[index] = node;
                        }}
                        type="button"
                        role="radio"
                        aria-checked={checked}
                        tabIndex={checked || (!value && index === 0) ? 0 : -1}
                        className={`pay-toggle-option ${checked ? "is-checked" : ""}`}
                        onClick={() => onChange(method)}
                        onKeyDown={e => handleKeyDown(e, index)}
                    >
                        <Icon name={METHOD_META[method].icon} size={18} />
                        {METHOD_META[method].label}
                    </button>
                );
            })}
        </div>
    );
};

export default PaymentMethodToggle;
