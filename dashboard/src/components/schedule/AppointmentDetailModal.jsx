import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getClientHistory } from "../../services/clients";
import { parseDateOnly } from "../../utils/date";
import {
    formatMoney,
    formatPhone,
    getInitials,
    minutesToTime,
    telLink,
    timeToMinutes,
    whatsappLink,
} from "../../utils/format";
import Button from "../ui/Button";
import Icon from "../ui/Icon";
import AppointmentPaymentStep from "./AppointmentPaymentStep";
import "./AppointmentDetailModal.css";

const getLiveStatus = (appointment, durationMinutes) => {
    if (appointment.status === "completed") return { label: "Finalizado", tone: "sage" };

    const date = parseDateOnly(appointment.date);
    const start = new Date(date);
    const startMinutes = timeToMinutes(appointment.time);
    start.setHours(Math.floor(startMinutes / 60), startMinutes % 60, 0, 0);
    const end = new Date(start.getTime() + durationMinutes * 60000);
    const now = new Date();

    if (now >= start && now < end) return { label: "En curso", tone: "sage" };
    if (now >= end) return { label: "Pendiente de cierre", tone: "brass" };
    return { label: "Próximo", tone: "brass" };
};

const AppointmentDetailModal = ({
    appointment,
    durationMinutes = 30,
    barberName,
    onClose,
    onComplete,
    onCancel,
    onReschedule,
    onViewClient,
    actionLoading,
}) => {
    const { isAdmin } = useAuth();
    const [confirmingCancel, setConfirmingCancel] = useState(false);
    const [paying, setPaying] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState(null);
    const [visits, setVisits] = useState(null);

    useEffect(() => {
        setConfirmingCancel(false);
        setPaying(false);
        setPaymentMethod(null);
        setVisits(null);
        if (!appointment?.client_id) return undefined;
        let cancelled = false;
        getClientHistory(appointment.client_id)
            .then(history => {
                if (!cancelled) setVisits(history.filter(a => a.status === "completed").length);
            })
            .catch(() => {});
        return () => {
            cancelled = true;
        };
    }, [appointment]);

    useEffect(() => {
        if (!appointment) return undefined;
        const handleKey = e => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", handleKey);
        return () => document.removeEventListener("keydown", handleKey);
    }, [appointment, onClose]);

    if (!appointment) return null;

    const isCompleted = appointment.status === "completed";
    const startMinutes = timeToMinutes(appointment.time);
    const timeLabel = `${minutesToTime(startMinutes)} – ${minutesToTime(startMinutes + durationMinutes)}`;
    const dateLabel = parseDateOnly(appointment.date)
        .toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" })
        .replace(",", "");
    const live = getLiveStatus(appointment, durationMinutes);
    const clientName = `${appointment.client_first_name} ${appointment.client_last_name || ""}`.trim();
    const wa = whatsappLink(appointment.client_phone, `Hola ${appointment.client_first_name}!`);
    const tel = telLink(appointment.client_phone);
    const createdLabel = appointment.created_at
        ? new Date(appointment.created_at).toLocaleString("es-AR", {
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
          })
        : null;

    return (
        <div className="appt-detail-overlay" onMouseDown={e => e.target === e.currentTarget && onClose()}>
            <div className="appt-detail" role="dialog" aria-modal="true" aria-labelledby="appt-detail-client">
                <header className="appt-detail-head">
                    <div className="appt-detail-status-row">
                        <span className={`appt-detail-ticket ${isCompleted ? "is-completed" : ""}`}>
                            {isCompleted ? "Completado" : "Confirmado"} #TRN-{appointment.id}
                        </span>
                        <span className={`appt-detail-live is-${live.tone}`}>
                            <span className="appt-detail-live-dot" aria-hidden="true" />
                            {live.label}
                        </span>
                    </div>
                    <p className="appt-detail-when">
                        <Icon name="calendar_today" size={16} />
                        <span>
                            {dateLabel} • {timeLabel} ({durationMinutes} min)
                        </span>
                    </p>
                    <button type="button" className="appt-detail-close" onClick={onClose} aria-label="Cerrar">
                        <Icon name="close" size={20} />
                    </button>
                </header>

                <div className="appt-detail-body">
                    <section className="appt-detail-client">
                        <div className="appt-detail-client-row">
                            <div className="appt-detail-client-id">
                                <span className="appt-detail-avatar" aria-hidden="true">
                                    {getInitials(appointment.client_first_name, appointment.client_last_name)}
                                </span>
                                <div className="appt-detail-client-text">
                                    <h2 id="appt-detail-client" className="appt-detail-client-name">
                                        {clientName}
                                    </h2>
                                    <span className="appt-detail-client-meta">
                                        {visits === null
                                            ? "Cargando historial…"
                                            : visits === 0
                                              ? "Primera visita"
                                              : `${visits} ${visits === 1 ? "visita registrada" : "visitas registradas"}`}
                                    </span>
                                </div>
                            </div>
                            <button
                                type="button"
                                className="appt-detail-file-btn"
                                onClick={() => onViewClient(appointment.client_id)}
                            >
                                Ficha
                                <Icon name="arrow_forward" size={16} />
                            </button>
                        </div>

                        {appointment.client_phone && (
                            <div className="appt-detail-contact">
                                <span className="appt-detail-phone">
                                    <Icon name="call" size={18} />
                                    {formatPhone(appointment.client_phone)}
                                </span>
                                <span className="appt-detail-contact-actions">
                                    {wa && (
                                        <a className="appt-detail-wa" href={wa} target="_blank" rel="noopener noreferrer">
                                            <Icon name="chat" size={16} />
                                            WhatsApp
                                        </a>
                                    )}
                                    {tel && (
                                        <a className="appt-detail-call" href={tel} aria-label={`Llamar a ${clientName}`}>
                                            <Icon name="phone_in_talk" size={16} />
                                        </a>
                                    )}
                                </span>
                            </div>
                        )}
                    </section>

                    <div className="appt-detail-grid">
                        <section className="appt-detail-tile">
                            <span className="t-label appt-detail-tile-label">Servicio asignado</span>
                            <h3 className="appt-detail-service">{appointment.service_name || "Sin servicio asignado"}</h3>
                            {barberName && (
                                <span className="appt-detail-barber">
                                    <Icon name="content_cut" size={18} />
                                    {barberName}
                                </span>
                            )}
                        </section>
                        <section className="appt-detail-tile">
                            <span className="t-label appt-detail-tile-label">Total a cobrar</span>
                            <span className="appt-detail-price">
                                {formatMoney(appointment.price)}
                                <span className="appt-detail-currency">ARS</span>
                            </span>
                            <span className={`appt-detail-payment ${isCompleted ? "is-done" : ""}`}>
                                <span className="appt-detail-payment-dot" aria-hidden="true" />
                                {!isCompleted
                                    ? "Se cobra al completar"
                                    : appointment.payment_method === "cash"
                                      ? "Cobrado en efectivo"
                                      : appointment.payment_method === "transfer"
                                        ? "Cobrado por transferencia"
                                        : "Registrado en caja"}
                            </span>
                        </section>
                    </div>

                    <section className="appt-detail-note">
                        <span className="appt-detail-note-head">
                            <Icon name="content_cut" size={18} />
                            <span className="t-label">Referencia del cliente</span>
                        </span>
                        {appointment.note ? (
                            <blockquote className="appt-detail-quote">“{appointment.note}”</blockquote>
                        ) : (
                            <p className="appt-detail-quote is-empty">El cliente no dejó ninguna referencia.</p>
                        )}
                    </section>

                    {!isCompleted && paying && (
                        <div className="appt-detail-actions">
                            <AppointmentPaymentStep
                                price={appointment.price}
                                method={paymentMethod}
                                onChange={setPaymentMethod}
                            />
                            <div className="appt-pay-buttons">
                                <Button
                                    variant="secondary"
                                    size="lg"
                                    icon="arrow_back"
                                    onClick={() => setPaying(false)}
                                    disabled={actionLoading}
                                >
                                    Volver
                                </Button>
                                <Button
                                    variant="success"
                                    size="lg"
                                    icon="check_circle"
                                    onClick={() => onComplete(appointment.id, paymentMethod)}
                                    loading={actionLoading}
                                    disabled={!paymentMethod}
                                >
                                    {paymentMethod ? "Confirmar cobro" : "Elegí el medio de pago"}
                                </Button>
                            </div>
                        </div>
                    )}

                    {!isCompleted && !paying && (
                        <div className="appt-detail-actions">
                            <div className={`appt-detail-primary-actions ${isAdmin ? "" : "is-single"}`}>
                                <Button
                                    variant="success"
                                    size="lg"
                                    icon="check_circle"
                                    onClick={() => {
                                        setConfirmingCancel(false);
                                        setPaying(true);
                                    }}
                                    disabled={actionLoading}
                                >
                                    Marcar completado
                                </Button>
                                {isAdmin && (
                                    <Button
                                        variant="secondary"
                                        size="lg"
                                        icon="schedule"
                                        onClick={() => onReschedule(appointment)}
                                        disabled={actionLoading}
                                    >
                                        Reprogramar turno
                                    </Button>
                                )}
                            </div>

                            <div className="appt-detail-cancel">
                                <div className="appt-detail-cancel-row">
                                    <button
                                        type="button"
                                        className="appt-detail-cancel-toggle"
                                        onClick={() => setConfirmingCancel(v => !v)}
                                        aria-expanded={confirmingCancel}
                                        disabled={actionLoading}
                                    >
                                        <Icon name="event_busy" size={18} />
                                        Cancelar turno
                                    </button>
                                    <span className="t-mono-sm appt-detail-cancel-hint">Libera el horario</span>
                                </div>
                                {confirmingCancel && (
                                    <div className="appt-detail-cancel-confirm" role="alert">
                                        <p>
                                            <Icon name="warning" size={20} />
                                            <span>
                                                ¿Seguro que querés cancelar el turno de {appointment.client_first_name}? El
                                                horario de las {minutesToTime(startMinutes)} vuelve a quedar libre.
                                            </span>
                                        </p>
                                        <div className="appt-detail-cancel-buttons">
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                onClick={() => setConfirmingCancel(false)}
                                                disabled={actionLoading}
                                            >
                                                Mantener turno
                                            </Button>
                                            <Button
                                                variant="danger-solid"
                                                size="sm"
                                                onClick={() => onCancel(appointment.id)}
                                                loading={actionLoading}
                                            >
                                                Confirmar cancelación
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <footer className="appt-detail-foot">
                    <span>{createdLabel ? `Reservado: ${createdLabel}` : "Reservado"}</span>
                    <span>ID: TRN-{appointment.id}</span>
                </footer>
            </div>
        </div>
    );
};

export default AppointmentDetailModal;
