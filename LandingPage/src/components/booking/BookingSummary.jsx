import { BRAND } from "../../data/brand";
import { buildAssetUrl } from "../../services/api";
import { formatDuration, formatPrice, fullName, initialsOf } from "../../utils/format";
import { whatsappUrl } from "../../utils/links";
import Button from "../ui/Button";
import Icon from "../ui/Icon";
import { IconWhatsapp } from "../ui/icons";

function Row({ label, children, empty }) {
    return (
        <div className="summary-row">
            <dt>{label}</dt>
            <dd className={empty ? "is-empty" : undefined}>{empty ? "Sin elegir" : children}</dd>
        </div>
    );
}

export default function BookingSummary({
    headingId,
    service,
    barber,
    dateLabel,
    timeLabel,
    stepsReady,
    submit,
    onConfirm,
    onPickAnotherTime,
}) {
    const submitting = submit.status === "submitting";
    const photo = barber?.photos?.[0] ? buildAssetUrl(barber.photos[0]) : null;

    return (
        <div className="summary">
            <div className="summary-head">
                <h2 id={headingId} className="summary-title">
                    <Icon name="event_available" size={22} />
                    Tu turno
                </h2>
                <span className={`summary-tag ${stepsReady ? "is-ready" : ""}`}>
                    {stepsReady ? "Listo para confirmar" : "En progreso"}
                </span>
            </div>

            <dl className="summary-rows">
                <Row label="Servicio" empty={!service}>
                    <span className="summary-value">{service?.name}</span>
                    {service && <span className="summary-meta mono">{formatDuration(service.duration_minutes)}</span>}
                </Row>
                <Row label="Barbero" empty={!barber}>
                    <span className="summary-barber">
                        <span className="summary-avatar" aria-hidden="true">
                            {photo ? <img src={photo} alt="" /> : initialsOf(barber)}
                        </span>
                        <span className="summary-value">{barber && fullName(barber)}</span>
                    </span>
                </Row>
                <Row label="Día" empty={!dateLabel}>
                    <span className="summary-value">{dateLabel}</span>
                </Row>
                <Row label="Horario" empty={!timeLabel}>
                    <span className="summary-value mono">{timeLabel}</span>
                </Row>
            </dl>

            <div className="summary-total">
                <span>Total</span>
                <span className="summary-price">{service ? formatPrice(service.price) : "—"}</span>
            </div>
            <p className="summary-note">
                <Icon name="payments" size={18} />
                {BRAND.paymentNote}
            </p>

            {submit.status === "error" && (
                <div className="summary-error" role="alert">
                    <Icon name="error" size={20} />
                    <div>
                        <p>{submit.error}</p>
                        {submit.conflict && (
                            <button type="button" className="summary-error-action" onClick={onPickAnotherTime}>
                                <Icon name="schedule" size={18} />
                                Elegir otro horario
                            </button>
                        )}
                    </div>
                </div>
            )}

            <Button size="lg" block onClick={onConfirm} disabled={!stepsReady} loading={submitting}>
                {submitting ? "Confirmando…" : "Confirmar turno"}
            </Button>
            {!stepsReady && <p className="summary-hint">Elegí servicio, barbero, día y horario para confirmar.</p>}

            <a
                className="whatsapp-link summary-whatsapp"
                href={whatsappUrl("Hola! Tengo una consulta sobre los turnos.")}
                target="_blank"
                rel="noreferrer"
            >
                <IconWhatsapp width={18} height={18} />
                ¿Dudas? Escribinos por WhatsApp
            </a>
        </div>
    );
}
