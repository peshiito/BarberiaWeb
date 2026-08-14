import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDocumentHead } from "../hooks/useDocumentHead";
import { useClientAuth } from "../hooks/useClientAuth";
import { useBarbers } from "../hooks/useBarbers";
import { fetchMyAppointments, cancelAppointment } from "../services/appointments";
import { getErrorMessage } from "../utils/apiError";
import { parseISODateOnly, formatFullDate } from "../utils/date";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Skeleton from "../components/ui/Skeleton";
import EmptyState from "../components/ui/EmptyState";
import ErrorState from "../components/ui/ErrorState";
import Modal from "../components/ui/Modal";
import { IconCalendar } from "../components/ui/icons";
import "./Account.css";

const STATUS_TONE = { active: "accent", cancelled: "danger", completed: "success" };
const STATUS_LABEL = { active: "Confirmado", cancelled: "Cancelado", completed: "Completado" };

// price llega como DECIMAL de MySQL (puede tener 1 o 2 decimales, ej. 25.5):
// toLocaleString sin opciones de precisión mostraba "$25,5" en vez de "$25,50".
const currencyFormatter = new Intl.NumberFormat("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function Account() {
    useDocumentHead({ title: "Mi cuenta", description: "Revisá y gestioná tus turnos reservados.", noIndex: true });
    const { client, logout } = useClientAuth();
    const { barbers } = useBarbers();
    const navigate = useNavigate();

    const [state, setState] = useState({ status: "loading", appointments: [], error: null });
    const [cancelTarget, setCancelTarget] = useState(null);
    const [cancelStatus, setCancelStatus] = useState("idle");
    const [cancelError, setCancelError] = useState(null);

    function fetchAndSet() {
        fetchMyAppointments()
            .then((appointments) => setState({ status: "success", appointments, error: null }))
            .catch((error) => setState({ status: "error", appointments: [], error: getErrorMessage(error) }));
    }

    function load() {
        setState({ status: "loading", appointments: [], error: null });
        fetchAndSet();
    }

    // El estado inicial ya es "loading", así que el efecto de montaje solo
    // necesita disparar el fetch (el setState real ocurre en las callbacks
    // de la promesa, no de forma síncrona en el cuerpo del efecto).
    useEffect(fetchAndSet, []);

    function barberName(barberId) {
        const b = barbers.find((x) => x.id === barberId);
        return b ? `${b.first_name} ${b.last_name}` : "Barbero";
    }

    async function handleCancel() {
        if (!cancelTarget) return;
        setCancelStatus("loading");
        setCancelError(null);
        try {
            await cancelAppointment(cancelTarget.id);
            setCancelTarget(null);
            setCancelStatus("idle");
            load();
        } catch (error) {
            setCancelStatus("idle");
            setCancelError(getErrorMessage(error));
        }
    }

    function handleLogout() {
        logout();
        navigate("/");
    }

    const sorted = [...state.appointments].sort((a, b) => (a.date + a.time < b.date + b.time ? 1 : -1));

    return (
        <section className="section section-dark account-page">
            <div className="container">
                <div className="account-header">
                    <div>
                        <p className="eyebrow">Mi cuenta</p>
                        <h1 className="booking-step-title">
                            Hola, {client?.first_name} {client?.last_name}
                        </h1>
                    </div>
                    <Button variant="secondary" size="sm" onClick={handleLogout}>
                        Cerrar sesión
                    </Button>
                </div>

                <div className="account-section-head">
                    <h2 className="account-section-title">Mis turnos</h2>
                    <Button as={Link} to="/reservar" size="sm">
                        Reservar otro turno
                    </Button>
                </div>

                {state.status === "loading" && (
                    <div className="account-appointments">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <Skeleton key={i} height="88px" />
                        ))}
                    </div>
                )}

                {state.status === "error" && <ErrorState title="No pudimos cargar tus turnos" text={state.error} onRetry={load} />}

                {state.status === "success" && sorted.length === 0 && (
                    <EmptyState
                        icon={<IconCalendar />}
                        title="Todavía no reservaste ningún turno"
                        text="Cuando reserves, tus turnos van a aparecer acá."
                        action={
                            <Button as={Link} to="/reservar" size="sm">
                                Reservar mi primer turno
                            </Button>
                        }
                    />
                )}

                {state.status === "success" && sorted.length > 0 && (
                    <div className="account-appointments">
                        {sorted.map((appointment) => (
                            <Card key={appointment.id} className="appointment-row">
                                <div className="appointment-row-info">
                                    <p className="appointment-row-date">{formatFullDate(parseISODateOnly(appointment.date))}</p>
                                    <p className="appointment-row-meta">
                                        {appointment.time} · {barberName(appointment.barber_id)}
                                        {typeof appointment.price === "number" && appointment.price > 0
                                            ? ` · $${currencyFormatter.format(appointment.price)}`
                                            : ""}
                                    </p>
                                </div>
                                <div className="appointment-row-actions">
                                    <Badge tone={STATUS_TONE[appointment.status] || "neutral"}>
                                        {STATUS_LABEL[appointment.status] || appointment.status}
                                    </Badge>
                                    {appointment.status === "active" && (
                                        <Button variant="danger" size="sm" onClick={() => setCancelTarget(appointment)}>
                                            Cancelar
                                        </Button>
                                    )}
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            <Modal open={Boolean(cancelTarget)} onClose={() => setCancelTarget(null)} title="Cancelar turno">
                <p style={{ color: "var(--text-on-dark-secondary)" }}>
                    ¿Seguro que querés cancelar tu turno del {cancelTarget && formatFullDate(parseISODateOnly(cancelTarget.date))}{" "}
                    a las {cancelTarget?.time}?
                </p>
                {cancelError && (
                    <p className="form-error" role="alert" style={{ marginTop: "var(--space-3)" }}>
                        {cancelError}
                    </p>
                )}
                <div className="booking-nav">
                    <Button variant="secondary" onClick={() => setCancelTarget(null)}>
                        Volver
                    </Button>
                    <Button variant="danger" onClick={handleCancel} loading={cancelStatus === "loading"}>
                        Sí, cancelar turno
                    </Button>
                </div>
            </Modal>
        </section>
    );
}
