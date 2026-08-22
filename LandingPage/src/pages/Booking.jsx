import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useDocumentHead } from "../hooks/useDocumentHead";
import { useBarbers } from "../hooks/useBarbers";
import { useServices } from "../hooks/useServices";
import { useWeekSlots } from "../hooks/useWeekSlots";
import { useClientAuth } from "../hooks/useClientAuth";
import { createAppointment } from "../services/appointments";
import { getErrorMessage, isConflict } from "../utils/apiError";
import { addDays, formatFullDate, getMonday, isPastDay, isToday, isWorkDay, toISODate } from "../utils/date";
import { buildAssetUrl } from "../services/api";
import StepIndicator from "../components/booking/StepIndicator";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Skeleton from "../components/ui/Skeleton";
import EmptyState from "../components/ui/EmptyState";
import FormField from "../components/ui/FormField";
import AsyncImage from "../components/ui/AsyncImage";
import { IconArrowLeft, IconArrowRight, IconCheck, IconCalendar } from "../components/ui/icons";
import "./Booking.css";

const STEPS = ["Servicio", "Barbero", "Fecha", "Horario", "Cuenta", "Confirmación"];

export default function Booking() {
    useDocumentHead({ title: "Reservar turno", description: "Reservá tu turno en Oficio Barbería en pocos pasos." });

    const [searchParams] = useSearchParams();
    const { isAuthenticated, client } = useClientAuth();
    const { status: barbersStatus, barbers, error: barbersError } = useBarbers();
    const { status: servicesStatus, services, error: servicesError } = useServices();

    const preselectedBarber = searchParams.get("barbero");

    const [currentStepName, setCurrentStepName] = useState(STEPS[0]);
    const [serviceId, setServiceId] = useState(null);
    const [barberId, setBarberId] = useState(() => (preselectedBarber ? Number(preselectedBarber) : null));
    const [weekStart, setWeekStart] = useState(() => getMonday(new Date()));
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTime, setSelectedTime] = useState(null);
    const [submitState, setSubmitState] = useState({ status: "idle", error: null, appointmentId: null });
    const [slotsNonce, setSlotsNonce] = useState(0);

    const { status: slotsStatus, data: slotsData, error: slotsError } = useWeekSlots(barberId, weekStart, slotsNonce);

    const selectedBarber = barbers.find((b) => b.id === barberId);
    const selectedService = services.find((s) => s.id === serviceId);
    const barbersForService = serviceId ? barbers.filter((b) => b.service_ids?.includes(serviceId)) : barbers;

    // Navegación por nombre de paso, no por índice: STEPS se achica al loguearse.
    const visibleSteps = isAuthenticated ? STEPS.filter((s) => s !== "Cuenta") : STEPS;
    const currentIndex = visibleSteps.indexOf(currentStepName);

    const stepContentRef = useRef(null);
    useEffect(() => {
        stepContentRef.current?.focus();
    }, [currentStepName]);

    function goNext() {
        setCurrentStepName((current) => {
            const allIndex = STEPS.indexOf(current);
            let nextIndex = Math.min(allIndex + 1, STEPS.length - 1);
            while (STEPS[nextIndex] === "Cuenta" && isAuthenticated && nextIndex < STEPS.length - 1) {
                nextIndex += 1;
            }
            return STEPS[nextIndex];
        });
    }
    function goBack() {
        setCurrentStepName((current) => {
            const allIndex = STEPS.indexOf(current);
            let prevIndex = Math.max(allIndex - 1, 0);
            while (STEPS[prevIndex] === "Cuenta" && isAuthenticated && prevIndex > 0) {
                prevIndex -= 1;
            }
            return STEPS[prevIndex];
        });
    }

    async function handleConfirm() {
        setSubmitState({ status: "submitting", error: null, appointmentId: null });
        try {
            const result = await createAppointment({
                barberId,
                serviceId,
                date: toISODate(selectedDate),
                time: selectedTime,
            });
            setSubmitState({ status: "success", error: null, appointmentId: result.id });
        } catch (error) {
            setSubmitState({ status: "error", error: getErrorMessage(error), appointmentId: null });
            if (isConflict(error)) {
                setSlotsNonce((n) => n + 1);
            }
        }
    }

    if (submitState.status === "success") {
        return (
            <section className="section section-dark booking-page">
                <div className="container booking-shell booking-success">
                    <div className="booking-success-icon">
                        <IconCheck width={28} height={28} />
                    </div>
                    <h1 className="booking-step-title">¡Turno reservado!</h1>
                    <p className="booking-step-lede">
                        Te esperamos el {formatFullDate(selectedDate)} a las {selectedTime} con {selectedBarber?.first_name}.
                    </p>
                    <div className="booking-nav" style={{ justifyContent: "center" }}>
                        <Button as={Link} to="/cuenta" variant="secondary">
                            Ver mis turnos
                        </Button>
                        <Button as={Link} to="/">
                            Volver al inicio
                        </Button>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="section section-dark booking-page">
            <div className="container booking-shell">
                <div className="booking-header">
                    <p className="eyebrow">Reservar turno</p>
                    <h1 className="visually-hidden">Reservar turno</h1>
                    <StepIndicator steps={visibleSteps} currentIndex={currentIndex} />
                    <p className="visually-hidden" aria-live="polite">
                        Paso {currentIndex + 1} de {visibleSteps.length}: {currentStepName}
                    </p>
                </div>

                <div ref={stepContentRef} tabIndex={-1}>
                {currentStepName === "Servicio" && (
                    <ServiceStep
                        status={servicesStatus}
                        services={services}
                        error={servicesError}
                        serviceId={serviceId}
                        onSelect={(id) => setServiceId(id)}
                        onNext={goNext}
                    />
                )}

                {currentStepName === "Barbero" && (
                    <BarberStep
                        status={barbersStatus}
                        barbers={barbersForService}
                        error={barbersError}
                        selectedId={barberId}
                        onSelect={(id) => {
                            setBarberId(id);
                            setSelectedDate(null);
                            setSelectedTime(null);
                        }}
                        onBack={goBack}
                        onNext={goNext}
                    />
                )}

                {currentStepName === "Fecha" && (
                    <DateStep
                        weekStart={weekStart}
                        onChangeWeek={setWeekStart}
                        slotsStatus={slotsStatus}
                        slotsData={slotsData}
                        slotsError={slotsError}
                        selectedDate={selectedDate}
                        onSelectDate={(d) => {
                            setSelectedDate(d);
                            setSelectedTime(null);
                        }}
                        onBack={goBack}
                        onNext={goNext}
                    />
                )}

                {currentStepName === "Horario" && (
                    <TimeStep
                        selectedDate={selectedDate}
                        slots={slotsData?.slots || []}
                        selectedTime={selectedTime}
                        onSelect={setSelectedTime}
                        onBack={goBack}
                        onNext={goNext}
                    />
                )}

                {currentStepName === "Cuenta" && <AuthStep onBack={goBack} onNext={goNext} />}

                {currentStepName === "Confirmación" && (
                    <ConfirmStep
                        service={selectedService}
                        barber={selectedBarber}
                        date={selectedDate}
                        time={selectedTime}
                        client={client}
                        submitState={submitState}
                        onBack={goBack}
                        onConfirm={handleConfirm}
                        onPickAnotherTime={() => setCurrentStepName("Horario")}
                    />
                )}
                </div>
            </div>
        </section>
    );
}

function ServiceStep({ status, services, error, serviceId, onSelect, onNext }) {
    return (
        <div>
            <h2 className="booking-step-title">¿Qué servicio buscás?</h2>
            <p className="booking-step-lede">Elegí un servicio para ver qué barberos lo hacen.</p>

            {status === "loading" && (
                <div className="option-grid option-grid-2">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} height="72px" />
                    ))}
                </div>
            )}

            {status === "error" && <EmptyState title="No pudimos cargar los servicios" text={error} />}

            {status === "success" && (
                <div className="option-grid option-grid-2">
                    {services.map((service) => (
                        <button
                            key={service.id}
                            type="button"
                            className={`option-btn ${serviceId === service.id ? "is-selected" : ""}`}
                            onClick={() => onSelect(service.id)}
                        >
                            <span className="option-btn-title">{service.name}</span>
                            <span className="option-btn-meta">
                                {service.duration_minutes} min · ${Number(service.price).toLocaleString("es-AR")}
                            </span>
                        </button>
                    ))}
                </div>
            )}

            <div className="booking-nav">
                <span />
                <Button onClick={onNext} disabled={!serviceId}>
                    Continuar <IconArrowRight width={16} height={16} />
                </Button>
            </div>
        </div>
    );
}

function BarberStep({ status, barbers, error, selectedId, onSelect, onBack, onNext }) {
    return (
        <div>
            <h2 className="booking-step-title">Elegí tu barbero</h2>
            <p className="booking-step-lede">Cada barbero maneja su propia agenda.</p>

            {status === "loading" && (
                <div className="option-grid option-grid-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} height="72px" />
                    ))}
                </div>
            )}

            {status === "error" && <EmptyState title="No pudimos cargar los barberos" text={error} />}

            {status === "success" && barbers.length === 0 && (
                <EmptyState title="Nadie ofrece este servicio todavía" text="Probá con otro servicio." />
            )}

            {status === "success" && barbers.length > 0 && (
                <div className="option-grid option-grid-3">
                    {barbers.map((barber) => (
                        <button
                            key={barber.id}
                            type="button"
                            className={`option-btn ${selectedId === barber.id ? "is-selected" : ""}`}
                            onClick={() => onSelect(barber.id)}
                        >
                            <AsyncImage
                                src={barber.photos?.[0] ? buildAssetUrl(barber.photos[0]) : null}
                                alt=""
                                aspectRatio="1 / 1"
                                className="option-btn-avatar"
                                initials={`${barber.first_name?.[0] || ""}${barber.last_name?.[0] || ""}`.toUpperCase()}
                            />
                            <span className="option-btn-title">
                                {barber.first_name} {barber.last_name}
                            </span>
                        </button>
                    ))}
                </div>
            )}

            <div className="booking-nav">
                <Button variant="secondary" onClick={onBack}>
                    <IconArrowLeft width={16} height={16} /> Atrás
                </Button>
                <Button onClick={onNext} disabled={!selectedId}>
                    Continuar <IconArrowRight width={16} height={16} />
                </Button>
            </div>
        </div>
    );
}

function DateStep({ weekStart, onChangeWeek, slotsStatus, slotsData, slotsError, selectedDate, onSelectDate, onBack, onNext }) {
    const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);
    const isCurrentWeek = toISODate(getMonday(new Date())) === toISODate(weekStart);

    return (
        <div>
            <h2 className="booking-step-title">Elegí el día</h2>
            <p className="booking-step-lede">Los días disponibles dependen de la agenda real del barbero.</p>

            <div className="day-picker">
                <button
                    type="button"
                    className="day-picker-nav"
                    onClick={() => onChangeWeek(addDays(weekStart, -7))}
                    disabled={isCurrentWeek}
                    aria-label="Semana anterior"
                >
                    <IconArrowLeft width={16} height={16} />
                </button>

                <div className="day-picker-days">
                    {days.map((day) => {
                        const disabled =
                            isPastDay(day) ||
                            slotsStatus !== "success" ||
                            !slotsData?.has_schedule ||
                            !isWorkDay(day, slotsData?.work_days);
                        return (
                            <button
                                key={toISODate(day)}
                                type="button"
                                className={`day-pill ${selectedDate && toISODate(selectedDate) === toISODate(day) ? "is-selected" : ""}`}
                                disabled={disabled}
                                onClick={() => onSelectDate(day)}
                            >
                                <span className="day-pill-weekday">{day.toLocaleDateString("es-AR", { weekday: "short" })}</span>
                                <span className="day-pill-number">{day.getDate()}</span>
                            </button>
                        );
                    })}
                </div>

                <button
                    type="button"
                    className="day-picker-nav"
                    onClick={() => onChangeWeek(addDays(weekStart, 7))}
                    aria-label="Semana siguiente"
                >
                    <IconArrowRight width={16} height={16} />
                </button>
            </div>

            {slotsStatus === "loading" && (
                <div style={{ marginTop: "var(--space-5)" }}>
                    <Skeleton height="16px" width="50%" />
                </div>
            )}

            {slotsStatus === "error" && (
                <div style={{ marginTop: "var(--space-5)" }}>
                    <EmptyState icon={<IconCalendar />} title="No pudimos cargar la agenda" text={slotsError} />
                </div>
            )}

            {slotsStatus === "success" && !slotsData?.has_schedule && (
                <div style={{ marginTop: "var(--space-5)" }}>
                    <EmptyState
                        icon={<IconCalendar />}
                        title="Sin agenda esta semana"
                        text="Este barbero todavía no cargó horarios para esta semana. Probá con la semana siguiente."
                    />
                </div>
            )}

            <div className="booking-nav">
                <Button variant="secondary" onClick={onBack}>
                    <IconArrowLeft width={16} height={16} /> Atrás
                </Button>
                <Button onClick={onNext} disabled={!selectedDate}>
                    Continuar <IconArrowRight width={16} height={16} />
                </Button>
            </div>
        </div>
    );
}

function TimeStep({ selectedDate, slots, selectedTime, onSelect, onBack, onNext }) {
    const availableSlots = useMemo(() => {
        if (!selectedDate) return slots;
        if (!isToday(selectedDate)) return slots;
        const now = new Date();
        const nowMinutes = now.getHours() * 60 + now.getMinutes();
        return slots.filter((slot) => {
            const [h, m] = slot.split(":").map(Number);
            return h * 60 + m > nowMinutes;
        });
    }, [slots, selectedDate]);

    return (
        <div>
            <h2 className="booking-step-title">Elegí el horario</h2>
            <p className="booking-step-lede">
                {selectedDate && formatFullDate(selectedDate)}. Si alguien reserva un horario justo antes que vos, te lo
                avisamos al confirmar.
            </p>

            {availableSlots.length === 0 ? (
                <EmptyState title="No quedan horarios ese día" text="Volvé al paso anterior y elegí otra fecha." />
            ) : (
                <div className="slot-grid">
                    {availableSlots.map((slot) => (
                        <button
                            key={slot}
                            type="button"
                            className={`slot-btn ${selectedTime === slot ? "is-selected" : ""}`}
                            onClick={() => onSelect(slot)}
                        >
                            {slot}
                        </button>
                    ))}
                </div>
            )}

            <div className="booking-nav">
                <Button variant="secondary" onClick={onBack}>
                    <IconArrowLeft width={16} height={16} /> Atrás
                </Button>
                <Button onClick={onNext} disabled={!selectedTime}>
                    Continuar <IconArrowRight width={16} height={16} />
                </Button>
            </div>
        </div>
    );
}

function AuthStep({ onBack, onNext }) {
    const { login } = useClientAuth();
    const [form, setForm] = useState({ firstName: "", lastName: "", phone: "" });
    const [errors, setErrors] = useState({});
    const [status, setStatus] = useState("idle");
    const [apiError, setApiError] = useState(null);

    function validate() {
        const next = {};
        if (form.firstName.trim().length < 2) next.firstName = "Ingresá tu nombre.";
        if (form.lastName.trim().length < 2) next.lastName = "Ingresá tu apellido.";
        if (!/^[0-9+\-\s]{8,30}$/.test(form.phone.trim())) next.phone = "Ingresá un teléfono válido.";
        setErrors(next);
        return Object.keys(next).length === 0;
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (status === "loading") return;
        if (!validate()) return;
        setStatus("loading");
        setApiError(null);
        try {
            await login(form);
            setStatus("idle");
            onNext();
        } catch (error) {
            setStatus("idle");
            setApiError(getErrorMessage(error));
        }
    }

    return (
        <div>
            <h2 className="booking-step-title">Confirmá quién sos</h2>
            <p className="booking-step-lede">
                Usamos tu teléfono para identificarte. Si ya reservaste antes con este número, vas a entrar directo a tu
                cuenta.
            </p>

            <Card style={{ padding: "var(--space-5)", marginTop: "var(--space-6)" }}>
                <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
                    <FormField id="booking-first-name" label="Nombre" required error={errors.firstName}>
                        <input
                            id="booking-first-name"
                            className="form-input"
                            value={form.firstName}
                            onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                            autoComplete="given-name"
                            aria-invalid={Boolean(errors.firstName)}
                        />
                    </FormField>
                    <FormField id="booking-last-name" label="Apellido" required error={errors.lastName}>
                        <input
                            id="booking-last-name"
                            className="form-input"
                            value={form.lastName}
                            onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                            autoComplete="family-name"
                            aria-invalid={Boolean(errors.lastName)}
                        />
                    </FormField>
                    <FormField id="booking-phone" label="Teléfono" required error={errors.phone} hint="Ej: 1123456789">
                        <input
                            id="booking-phone"
                            className="form-input"
                            type="tel"
                            value={form.phone}
                            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                            autoComplete="tel"
                            aria-invalid={Boolean(errors.phone)}
                        />
                    </FormField>

                    {apiError && (
                        <p className="form-error" role="alert">
                            {apiError}
                        </p>
                    )}

                    <div className="booking-nav" style={{ marginTop: 0 }}>
                        <Button type="button" variant="secondary" onClick={onBack}>
                            <IconArrowLeft width={16} height={16} /> Atrás
                        </Button>
                        <Button type="submit" loading={status === "loading"}>
                            Continuar <IconArrowRight width={16} height={16} />
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}

function ConfirmStep({ service, barber, date, time, client, submitState, onBack, onConfirm, onPickAnotherTime }) {
    return (
        <div>
            <h2 className="booking-step-title">Confirmá tu turno</h2>
            <p className="booking-step-lede">Revisá los datos antes de reservar.</p>

            <div className="booking-confirm-list">
                {service && (
                    <>
                        <div className="booking-confirm-row">
                            <span className="booking-confirm-label">Servicio</span>
                            <span className="booking-confirm-value">{service.name}</span>
                        </div>
                        <div className="booking-confirm-row">
                            <span className="booking-confirm-label">Precio</span>
                            <span className="booking-confirm-value">
                                ${Number(service.price).toLocaleString("es-AR")}
                            </span>
                        </div>
                    </>
                )}
                <div className="booking-confirm-row">
                    <span className="booking-confirm-label">Barbero</span>
                    <span className="booking-confirm-value">
                        {barber?.first_name} {barber?.last_name}
                    </span>
                </div>
                <div className="booking-confirm-row">
                    <span className="booking-confirm-label">Fecha</span>
                    <span className="booking-confirm-value">{date && formatFullDate(date)}</span>
                </div>
                <div className="booking-confirm-row">
                    <span className="booking-confirm-label">Horario</span>
                    <span className="booking-confirm-value">{time}</span>
                </div>
                <div className="booking-confirm-row">
                    <span className="booking-confirm-label">A nombre de</span>
                    <span className="booking-confirm-value">
                        {client?.first_name} {client?.last_name}
                    </span>
                </div>
            </div>

            {submitState.status === "error" && (
                <div style={{ marginTop: "var(--space-4)" }}>
                    <p className="form-error" role="alert">
                        {submitState.error}
                    </p>
                    <Button variant="secondary" size="sm" onClick={onPickAnotherTime} style={{ marginTop: "var(--space-2)" }}>
                        Elegir otro horario
                    </Button>
                </div>
            )}

            <div className="booking-nav">
                <Button variant="secondary" onClick={onBack} disabled={submitState.status === "submitting"}>
                    <IconArrowLeft width={16} height={16} /> Atrás
                </Button>
                <Button onClick={onConfirm} loading={submitState.status === "submitting"}>
                    Confirmar turno
                </Button>
            </div>
        </div>
    );
}
