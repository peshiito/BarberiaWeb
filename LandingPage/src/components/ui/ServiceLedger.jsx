import { formatDuration, formatPrice } from "../../utils/format";
import "./ServiceLedger.css";

// Lista de precios con línea de puntos, estilo tablero de barbería.
// tone="board": letras claras sobre fieltro oscuro · tone="plain": sobre tarjeta oscura.
export default function ServiceLedger({ services, tone = "plain", className = "" }) {
    return (
        <ul className={`ledger ledger-${tone} ${className}`.trim()}>
            {services.map((service) => (
                <li key={service.id} className="ledger-item">
                    <div className="ledger-row">
                        <span className="ledger-name">{service.name}</span>
                        <span className="ledger-leader" aria-hidden="true" />
                        <span className="ledger-price">{formatPrice(service.price)}</span>
                    </div>
                    <p className="ledger-meta">
                        <span className="ledger-duration">{formatDuration(service.duration_minutes)}</span>
                        {service.description && <span className="ledger-desc">{service.description}</span>}
                    </p>
                </li>
            ))}
        </ul>
    );
}
