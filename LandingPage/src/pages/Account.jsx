import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDocumentHead } from "../hooks/useDocumentHead";
import { useClientAuth } from "../hooks/useClientAuth";
import { useBarbers } from "../hooks/useBarbers";
import { fetchMyAppointments, cancelAppointment } from "../services/appointments";
import { buildAssetUrl } from "../services/api";
import { getErrorMessage } from "../utils/apiError";
import { parseISODateOnly, formatFullDate } from "../utils/date";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import FormField from "../components/ui/FormField";
import AsyncImage from "../components/ui/AsyncImage";
import AppointmentRowSkeleton from "../components/ui/AppointmentRowSkeleton";
import EmptyState from "../components/ui/EmptyState";
import ErrorState from "../components/ui/ErrorState";
import Modal from "../components/ui/Modal";
import Reveal from "../components/ui/Reveal";
import { IconCalendar } from "../components/ui/icons";
import "./Account.css";

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const ALLOWED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];

const STATUS_TONE = { active: "accent", cancelled: "danger", completed: "success" };
const STATUS_LABEL = { active: "Confirmado", cancelled: "Cancelado", completed: "Completado" };

const currencyFormatter = new Intl.NumberFormat("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function Account() {
    useDocumentHead({ title: "Mi cuenta", description: "Revisá y gestioná tus turnos reservados.", noIndex: true });
    const { client, logout, updateProfile, uploadPhoto } = useClientAuth();
    const { barbers } = useBarbers();
    const navigate = useNavigate();

    const [state, setState] = useState({ status: "loading", appointments: [], error: null });
    const [cancelTarget, setCancelTarget] = useState(null);
    const [cancelStatus, setCancelStatus] = useState("idle");
    const [cancelError, setCancelError] = useState(null);

    const fileInputRef = useRef(null);
    const [notes, setNotes] = useState(client?.notes || "");
    const [photoStatus, setPhotoStatus] = useState("idle");
    const [notesStatus, setNotesStatus] = useState("idle");
    const [profileError, setProfileError] = useState(null);
    const [profileSaved, setProfileSaved] = useState(false);

    function fetchAndSet() {
        fetchMyAppointments()
            .then((appointments) => setState({ status: "success", appointments, error: null }))
            .catch((error) => setState({ status: "error", appointments: [], error: getErrorMessage(error) }));
    }

    function load() {
        setState({ status: "loading", appointments: [], error: null });
        fetchAndSet();
    }

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

    async function handlePhotoChange(e) {
        const file = e.target.files?.[0];
        e.target.value = "";
        if (!file) return;

        setProfileError(null);
        if (!ALLOWED_PHOTO_TYPES.includes(file.type)) {
            setProfileError("La foto debe ser JPG, PNG o WEBP.");
            return;
        }
        if (file.size > MAX_PHOTO_BYTES) {
            setProfileError("La foto no puede pesar más de 5MB.");
            return;
        }

        setPhotoStatus("loading");
        try {
            await uploadPhoto(file);
        } catch (error) {
            setProfileError(getErrorMessage(error));
        } finally {
            setPhotoStatus("idle");
        }
    }

    async function handleSaveNotes() {
        setNotesStatus("loading");
        setProfileError(null);
        setProfileSaved(false);
        try {
            await updateProfile({ notes });
            setProfileSaved(true);
        } catch (error) {
            setProfileError(getErrorMessage(error));
        } finally {
            setNotesStatus("idle");
        }
    }

    const sorted = [...state.appointments].sort((a, b) => (a.date + a.time < b.date + b.time ? 1 : -1));

    return (
        <section className="section section-dark account-page">
            <div className="container">
                <Reveal className="account-header">
                    <div>
                        <p className="eyebrow">Mi cuenta</p>
                        <h1 className="booking-step-title">
                            Hola, {client?.first_name} {client?.last_name}
                        </h1>
                    </div>
                    <Button variant="secondary" size="sm" onClick={handleLogout}>
                        Cerrar sesión
                    </Button>
                </Reveal>

                <Card className="account-profile-card">
                    <h2 className="account-section-title">Mi perfil</h2>
                    <div className="account-profile-body">
                        <div className="account-profile-photo">
                            <AsyncImage
                                src={buildAssetUrl(client?.photo_url)}
                                alt="Tu foto de perfil"
                                aspectRatio="1 / 1"
                                initials={`${client?.first_name?.[0] || ""}${client?.last_name?.[0] || ""}`}
                            />
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                hidden
                                onChange={handlePhotoChange}
                            />
                            <Button
                                variant="secondary"
                                size="sm"
                                type="button"
                                loading={photoStatus === "loading"}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                {client?.photo_url ? "Cambiar foto" : "Subir foto"}
                            </Button>
                        </div>

                        <FormField id="account-notes" label="Preferencias / notas" hint="Ej: tipo de corte preferido, alergias.">
                            <textarea
                                id="account-notes"
                                className="form-input"
                                rows="3"
                                maxLength={500}
                                value={notes}
                                onChange={(e) => {
                                    setNotes(e.target.value);
                                    setProfileSaved(false);
                                }}
                            />
                        </FormField>
                        <Button
                            variant="secondary"
                            size="sm"
                            type="button"
                            loading={notesStatus === "loading"}
                            onClick={handleSaveNotes}
                            style={{ alignSelf: "flex-start" }}
                        >
                            {profileSaved ? "Guardado ✓" : "Guardar notas"}
                        </Button>
                    </div>
                    {profileError && (
                        <p className="form-error" role="alert" style={{ marginTop: "var(--space-3)" }}>
                            {profileError}
                        </p>
                    )}
                </Card>

                <div className="account-section-head">
                    <h2 className="account-section-title">Mis turnos</h2>
                    <Button as={Link} to="/reservar" size="sm">
                        Reservar otro turno
                    </Button>
                </div>

                {state.status === "loading" && (
                    <div className="account-appointments">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <AppointmentRowSkeleton key={i} />
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
                    <div className="account-appointments account-appointments-in">
                        {sorted.map((appointment, i) => (
                            <Card key={appointment.id} className="appointment-row" style={{ animationDelay: `${i * 60}ms` }}>
                                <div className="appointment-row-info">
                                    <p className="appointment-row-date">{formatFullDate(parseISODateOnly(appointment.date))}</p>
                                    <p className="appointment-row-meta">
                                        {appointment.time} · {barberName(appointment.barber_id)}
                                        {appointment.service_name ? ` · ${appointment.service_name}` : ""}
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
