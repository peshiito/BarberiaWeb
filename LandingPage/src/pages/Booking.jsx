import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useDocumentHead } from "../hooks/useDocumentHead";
import { useBarbers } from "../hooks/useBarbers";
import { useServices } from "../hooks/useServices";
import { useWeekSlots } from "../hooks/useWeekSlots";
import { createAppointment } from "../services/appointments";
import { buildAssetUrl } from "../services/api";
import { getErrorMessage, isConflict } from "../utils/apiError";
import {
    addDays,
    formatDayMonth,
    formatFullDate,
    getMonday,
    getWeekDays,
    isPastDay,
    parseWorkDays,
    toISODate,
} from "../utils/date";
import { addMinutesToTime, formatDuration, formatPrice, fullName, initialsOf, timeToMinutes } from "../utils/format";
import { whatsappUrl } from "../utils/links";
import BookingConfirmation from "../components/booking/BookingConfirmation";
import BookingSummary from "../components/booking/BookingSummary";
import DayStrip from "../components/booking/DayStrip";
import StepBlock from "../components/booking/StepBlock";
import TimeGrid from "../components/booking/TimeGrid";
import AsyncImage from "../components/ui/AsyncImage";
import Button from "../components/ui/Button";
import FormField from "../components/ui/FormField";
import Icon from "../components/ui/Icon";
import Skeleton from "../components/ui/Skeleton";
import "./Booking.css";

const EMPTY_GUEST = { firstName: "", lastName: "", phone: "", note: "" };
const FIELD_ORDER = ["firstName", "lastName", "phone"];
const PHONE_PATTERN = /^[0-9+\-\s]{8,30}$/;

function capitalize(text) {
    return text ? text.charAt(0).toUpperCase() + text.slice(1) : text;
}

function validateGuest(guest) {
    const errors = {};
    if (guest.firstName.trim().length < 2) errors.firstName = "Ingresá tu nombre.";
    if (guest.lastName.trim().length < 2) errors.lastName = "Ingresá tu apellido.";
    if (!PHONE_PATTERN.test(guest.phone.trim())) errors.phone = "Ingresá un teléfono válido, por ejemplo 11 2345-6789.";
    return errors;
}

function weekRangeLabel(days) {
    const first = days[0].date;
    const last = days[6].date;
    if (first.getMonth() === last.getMonth()) {
        return `Semana del ${first.getDate()} al ${formatDayMonth(last)}`;
    }
    return `Semana del ${formatDayMonth(first)} al ${formatDayMonth(last)}`;
}

function StepMessage({ icon, title, text, children, tone }) {
    return (
        <div className={`step-message ${tone === "error" ? "is-error" : ""}`} role={tone === "error" ? "alert" : "status"}>
            <span className="step-message-icon" aria-hidden="true">
                <Icon name={icon} size={24} />
            </span>
            <p className="step-message-title">{title}</p>
            {text && <p className="step-message-text">{text}</p>}
            {children && <div className="step-message-actions">{children}</div>}
        </div>
    );
}

export default function Booking() {
    useDocumentHead({
        title: "Reservar turno",
        description: "Reservá tu turno en Oficio Barbería: elegí servicio, barbero y horario. Sin cuenta y sin seña.",
    });

    const [searchParams] = useSearchParams();
    const { status: servicesStatus, services, reload: reloadServices } = useServices();
    const { status: barbersStatus, barbers, reload: reloadBarbers } = useBarbers();

    const [serviceId, setServiceId] = useState(() => Number(searchParams.get("servicio")) || null);
    const [barberId, setBarberId] = useState(() => Number(searchParams.get("barbero")) || null);
    const [weekStart, setWeekStart] = useState(() => getMonday(new Date()));
    const [dateIso, setDateIso] = useState(null);
    const [time, setTime] = useState(null);
    const [timeConfirmed, setTimeConfirmed] = useState(false);
    const [editing, setEditing] = useState(null);
    const [guest, setGuest] = useState(EMPTY_GUEST);
    const [errors, setErrors] = useState({});
    const [slotsNonce, setSlotsNonce] = useState(0);
    const [lostSlots, setLostSlots] = useState({});
    const [submit, setSubmit] = useState({ status: "idle", error: null, conflict: false });
    const [confirmed, setConfirmed] = useState(null);
    const [sheetOpen, setSheetOpen] = useState(false);

    const formRef = useRef(null);
    const sheetCloseRef = useRef(null);
    const sheetTriggerRef = useRef(null);
    const previousStepRef = useRef(null);

    // ---- Selección derivada de los datos reales ----
    const service = services.find((s) => s.id === serviceId) || null;
    const barbersForService = service ? barbers.filter((b) => b.service_ids?.includes(service.id)) : barbers;
    const barber = barbersForService.find((b) => b.id === barberId) || null;

    const { status: slotsStatus, data: slotsData, error: slotsError } = useWeekSlots(barber?.id ?? null, weekStart, slotsNonce);
    const slotsReady = slotsStatus === "success";
    const hasSchedule = slotsReady && slotsData?.has_schedule;
    const workDays = parseWorkDays(slotsData?.work_days);
    const now = new Date();
    const todayIso = toISODate(now);
    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    const takenFor = (iso) => [...(slotsData?.taken?.[iso] || []), ...(lostSlots[iso] || [])];
    const slotsFor = (iso) =>
        (slotsData?.slots || [])
            .filter((slot) => !(iso === todayIso && timeToMinutes(slot) <= nowMinutes))
            .map((slot) => ({ time: slot, taken: takenFor(iso).includes(slot) }));

    const days = getWeekDays(weekStart).map((day) => {
        let status = "free";
        let free = 0;
        if (isPastDay(day.date)) status = "past";
        else if (!slotsReady) status = "loading";
        else if (!hasSchedule) status = "none";
        else if (!workDays.includes(day.dayName)) status = "closed";
        else {
            free = slotsFor(day.iso).filter((slot) => !slot.taken).length;
            if (free === 0) status = "full";
        }
        return { ...day, status, free, fullLabel: capitalize(formatFullDate(day.date).replace(",", "")) };
    });

    const selectedDay = days.find((day) => day.iso === dateIso) || null;
    const daySlots = selectedDay?.status === "free" ? slotsFor(selectedDay.iso) : [];
    const timeValid = Boolean(time && daySlots.some((slot) => slot.time === time && !slot.taken));

    const serviceDone = Boolean(service);
    const barberDone = serviceDone && Boolean(barber);
    const timeDone = barberDone && timeValid && timeConfirmed;
    const firstIncomplete = !serviceDone ? 1 : !barberDone ? 2 : !timeDone ? 3 : 4;
    const openStep = editing !== null && editing < firstIncomplete ? editing : firstIncomplete;
    const stepsReady = timeDone;
    const submitting = submit.status === "submitting";
    const stepState = (step, done) => (step === openStep ? "active" : done ? "done" : "locked");

    const dateLabel = selectedDay ? selectedDay.fullLabel : null;
    const timeLabel = time && service && timeValid ? `${time} a ${addMinutesToTime(time, service.duration_minutes)}` : null;
    const currentMonday = getMonday(now);
    const anyFreeDay = days.some((day) => day.status === "free");

    // ---- Efectos ----
    useEffect(() => {
        if (confirmed) return undefined;
        document.body.classList.add("has-booking-bar");
        return () => document.body.classList.remove("has-booking-bar");
    }, [confirmed]);

    // Al abrirse otro paso, lo lleva a la vista y le pasa el foco (lectores de pantalla).
    useEffect(() => {
        if (previousStepRef.current === null) {
            previousStepRef.current = openStep;
            return;
        }
        if (previousStepRef.current === openStep) return;
        previousStepRef.current = openStep;
        const node = document.getElementById(`step-${openStep}`);
        if (!node) return;
        node.focus({ preventScroll: true });
        const { top } = node.getBoundingClientRect();
        if (top < 80 || top > window.innerHeight * 0.55) {
            const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
            node.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
        }
    }, [openStep]);

    useEffect(() => {
        if (!sheetOpen) return undefined;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        sheetCloseRef.current?.focus();
        const trigger = sheetTriggerRef.current;
        const onKey = (e) => {
            if (e.key === "Escape") setSheetOpen(false);
        };
        document.addEventListener("keydown", onKey);
        return () => {
            document.body.style.overflow = previousOverflow;
            document.removeEventListener("keydown", onKey);
            trigger?.focus();
        };
    }, [sheetOpen]);

    // ---- Acciones ----
    function resetTime() {
        setDateIso(null);
        setTime(null);
        setTimeConfirmed(false);
    }

    function clearSubmitError() {
        if (submit.status === "error") setSubmit({ status: "idle", error: null, conflict: false });
    }

    function selectService(id) {
        const current = barbers.find((b) => b.id === barberId);
        if (current && !current.service_ids?.includes(id)) {
            setBarberId(null);
            resetTime();
        }
        setServiceId(id);
        setEditing(null);
        clearSubmitError();
    }

    function selectBarber(id) {
        if (id !== barberId) {
            setBarberId(id);
            setWeekStart(getMonday(new Date()));
            resetTime();
        }
        setEditing(null);
        clearSubmitError();
    }

    function changeWeek(delta) {
        setWeekStart((start) => addDays(start, delta * 7));
        resetTime();
        // El botón que se tocó puede desaparecer (mensaje de semana sin horarios):
        // el foco pasa a la navegación de semanas, que siempre queda.
        requestAnimationFrame(() => {
            const nav = document.querySelector(`.daystrip-nav button[aria-label="${delta > 0 ? "Semana siguiente" : "Semana anterior"}"]`);
            if (nav && !document.activeElement?.closest(".daystrip-nav")) nav.focus();
        });
    }

    function selectDay(iso) {
        setDateIso(iso);
        setTime(null);
        setTimeConfirmed(false);
    }

    function selectTime(value) {
        setTime(value);
        setTimeConfirmed(false);
        clearSubmitError();
    }

    function confirmTime() {
        setTimeConfirmed(true);
        setEditing(null);
    }

    function updateGuest(field, value) {
        setGuest((g) => ({ ...g, [field]: value }));
        if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
    }

    function pickAnotherTime() {
        setSheetOpen(false);
        setEditing(3);
        document.getElementById("step-3")?.scrollIntoView({ block: "start" });
    }

    function handleConfirmClick() {
        setSheetOpen(false);
        if (!stepsReady) return;
        if (openStep !== 4) {
            setEditing(null);
            return;
        }
        formRef.current?.requestSubmit();
    }

    async function handleSubmit(event) {
        event.preventDefault();
        if (!stepsReady || submitting) return;

        const nextErrors = validateGuest(guest);
        setErrors(nextErrors);
        const firstError = FIELD_ORDER.find((field) => nextErrors[field]);
        if (firstError) {
            document.getElementById(`booking-${firstError}`)?.focus();
            return;
        }

        setSubmit({ status: "submitting", error: null, conflict: false });
        try {
            const result = await createAppointment({
                firstName: guest.firstName.trim(),
                lastName: guest.lastName.trim(),
                phone: guest.phone.trim(),
                note: guest.note,
                barberId: barber.id,
                serviceId: service.id,
                date: dateIso,
                time,
            });
            setConfirmed({ id: result.id, service, barber, dateIso, time, guest });
            window.scrollTo(0, 0);
        } catch (error) {
            const slotTaken = isConflict(error) && error.response?.data?.error === "Slot already taken";
            if (slotTaken) {
                setLostSlots((prev) => ({ ...prev, [dateIso]: [...(prev[dateIso] || []), time] }));
                setTime(null);
                setTimeConfirmed(false);
                setEditing(3);
                setSlotsNonce((n) => n + 1);
            }
            setSubmit({ status: "error", error: getErrorMessage(error), conflict: slotTaken });
        }
    }

    if (confirmed) {
        return <BookingConfirmation appointment={confirmed} />;
    }

    const barLine = [service?.name, selectedDay && timeValid ? `${selectedDay.label} ${selectedDay.dayNumber}` : null, timeValid ? time : null]
        .filter(Boolean)
        .join(" · ");
    const completedCount = [serviceDone, barberDone, timeDone, false].filter(Boolean).length;

    const summaryProps = {
        service,
        barber,
        dateLabel: timeValid ? dateLabel : selectedDay?.fullLabel || null,
        timeLabel,
        stepsReady,
        submit,
        onConfirm: handleConfirmClick,
        onPickAnotherTime: pickAnotherTime,
    };

    return (
        <section className="section section-dark booking-page" aria-labelledby="booking-title">
            <div className="container">
                <header className="booking-head">
                    <p className="eyebrow">Reserva online</p>
                    <h1 id="booking-title" className="booking-title">
                        Reservá tu turno
                    </h1>
                    <p className="booking-lede">Sin cuenta y sin seña. Te lleva un par de minutos.</p>
                </header>

                <div className="booking-progress" aria-hidden="true">
                    <div className="booking-progress-bar">
                        {[1, 2, 3, 4].map((step) => (
                            <span key={step} className={step <= completedCount ? "is-done" : step === openStep ? "is-current" : ""} />
                        ))}
                    </div>
                    <p>
                        Paso {openStep} de 4 · {["Servicio", "Barbero", "Día y horario", "Tus datos"][openStep - 1]}
                    </p>
                </div>

                <div className="booking-layout">
                    <form id="booking-form" ref={formRef} className="booking-steps" onSubmit={handleSubmit} noValidate>
                        <fieldset disabled={submitting} className="booking-fieldset">
                            <legend className="visually-hidden">Datos del turno</legend>

                            {/* 1 · Servicio */}
                            <StepBlock
                                id="step-1"
                                index={1}
                                title="Servicio"
                                state={stepState(1, serviceDone)}
                                onEdit={() => setEditing(1)}
                                summary={
                                    service && (
                                        <>
                                            <span className="step-summary-main">{service.name}</span>
                                            <span className="step-summary-meta mono">
                                                {formatDuration(service.duration_minutes)} · {formatPrice(service.price)}
                                            </span>
                                        </>
                                    )
                                }
                            >
                                {servicesStatus === "loading" && (
                                    <div className="option-list" aria-hidden="true">
                                        {Array.from({ length: 3 }).map((_, i) => (
                                            <Skeleton key={i} height="72px" />
                                        ))}
                                    </div>
                                )}
                                {servicesStatus === "error" && (
                                    <StepMessage icon="wifi_off" tone="error" title="No pudimos cargar los servicios" text="Revisá tu conexión e intentá de nuevo.">
                                        <Button size="sm" onClick={reloadServices}>
                                            <Icon name="refresh" size={18} />
                                            Reintentar
                                        </Button>
                                        <a className="whatsapp-link" href={whatsappUrl()} target="_blank" rel="noreferrer">
                                            Reservar por WhatsApp
                                        </a>
                                    </StepMessage>
                                )}
                                {servicesStatus === "success" && services.length === 0 && (
                                    <StepMessage icon="content_cut" title="Todavía no hay servicios publicados" text="Mientras tanto, podés reservar por WhatsApp." />
                                )}
                                {servicesStatus === "success" && services.length > 0 && (
                                    <ul className="option-list">
                                        {services.map((item) => {
                                            const selected = item.id === serviceId;
                                            return (
                                                <li key={item.id}>
                                                    <button
                                                        type="button"
                                                        className={`option ${selected ? "is-selected" : ""}`}
                                                        aria-pressed={selected}
                                                        onClick={() => selectService(item.id)}
                                                    >
                                                        <span className="option-text">
                                                            <span className="option-title">{item.name}</span>
                                                            {item.description && <span className="option-desc">{item.description}</span>}
                                                        </span>
                                                        <span className="option-side">
                                                            <span className="option-duration mono">{formatDuration(item.duration_minutes)}</span>
                                                            <span className="option-price mono">{formatPrice(item.price)}</span>
                                                        </span>
                                                        <span className="option-check" aria-hidden="true">
                                                            <Icon name="check" size={16} />
                                                        </span>
                                                    </button>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                )}
                            </StepBlock>

                            {/* 2 · Barbero */}
                            <StepBlock
                                id="step-2"
                                index={2}
                                title="Barbero"
                                state={stepState(2, barberDone)}
                                onEdit={() => setEditing(2)}
                                lockedHint="Elegí primero el servicio"
                                summary={barber && <span className="step-summary-main">{fullName(barber)}</span>}
                            >
                                {barbersStatus === "loading" && (
                                    <div className="barber-options" aria-hidden="true">
                                        {Array.from({ length: 2 }).map((_, i) => (
                                            <Skeleton key={i} height="88px" />
                                        ))}
                                    </div>
                                )}
                                {barbersStatus === "error" && (
                                    <StepMessage icon="wifi_off" tone="error" title="No pudimos cargar los barberos" text="Revisá tu conexión e intentá de nuevo.">
                                        <Button size="sm" onClick={reloadBarbers}>
                                            <Icon name="refresh" size={18} />
                                            Reintentar
                                        </Button>
                                    </StepMessage>
                                )}
                                {barbersStatus === "success" && barbersForService.length === 0 && (
                                    <StepMessage icon="person_off" title="Por ahora nadie ofrece este servicio" text="Probá con otro servicio de la lista.">
                                        <Button variant="secondary" size="sm" onClick={() => setEditing(1)}>
                                            <Icon name="swap_horiz" size={18} />
                                            Elegir otro servicio
                                        </Button>
                                    </StepMessage>
                                )}
                                {barbersStatus === "success" && barbersForService.length > 0 && (
                                    <ul className="barber-options">
                                        {barbersForService.map((item) => {
                                            const selected = item.id === barberId;
                                            const photo = item.photos?.[0] ? buildAssetUrl(item.photos[0]) : null;
                                            return (
                                                <li key={item.id}>
                                                    <button
                                                        type="button"
                                                        className={`option option-barber ${selected ? "is-selected" : ""}`}
                                                        aria-pressed={selected}
                                                        onClick={() => selectBarber(item.id)}
                                                    >
                                                        <AsyncImage src={photo} alt="" aspectRatio="1 / 1" className="option-avatar" initials={initialsOf(item)} />
                                                        <span className="option-text">
                                                            <span className="option-title">{fullName(item)}</span>
                                                            {item.bio && <span className="option-desc option-desc-clamp">{item.bio}</span>}
                                                        </span>
                                                        <span className="option-check" aria-hidden="true">
                                                            <Icon name="check" size={16} />
                                                        </span>
                                                    </button>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                )}
                            </StepBlock>

                            {/* 3 · Día y horario */}
                            <StepBlock
                                id="step-3"
                                index={3}
                                title="Día y horario"
                                state={stepState(3, timeDone)}
                                onEdit={() => setEditing(3)}
                                lockedHint="Elegí primero el barbero"
                                summary={
                                    timeDone && (
                                        <>
                                            <span className="step-summary-main">{dateLabel}</span>
                                            <span className="step-summary-meta mono">{timeLabel} hs</span>
                                        </>
                                    )
                                }
                            >
                                {slotsStatus === "error" ? (
                                    <StepMessage icon="wifi_off" tone="error" title="No pudimos cargar la agenda" text={slotsError}>
                                        <Button size="sm" onClick={() => setSlotsNonce((n) => n + 1)}>
                                            <Icon name="refresh" size={18} />
                                            Reintentar
                                        </Button>
                                    </StepMessage>
                                ) : (
                                    <>
                                        <DayStrip
                                            days={days}
                                            selectedIso={dateIso}
                                            onSelect={selectDay}
                                            onPrev={() => changeWeek(-1)}
                                            onNext={() => changeWeek(1)}
                                            prevDisabled={weekStart <= currentMonday}
                                            rangeLabel={weekRangeLabel(days)}
                                        />

                                        {submit.conflict && (
                                            <p className="step-inline-error" role="alert">
                                                <Icon name="error" size={18} />
                                                Ese horario se acaba de ocupar. Elegí otro y confirmá de nuevo.
                                            </p>
                                        )}

                                        {slotsReady && !hasSchedule && (
                                            <StepMessage
                                                icon="event_busy"
                                                title={`${barber?.first_name} todavía no cargó horarios para esta semana`}
                                                text="Probá con la semana siguiente o elegí otro barbero."
                                            >
                                                <Button variant="secondary" size="sm" onClick={() => changeWeek(1)}>
                                                    Ver semana siguiente
                                                    <Icon name="arrow_forward" size={18} />
                                                </Button>
                                                <Button variant="ghost" size="sm" onClick={() => setEditing(2)}>
                                                    Elegir otro barbero
                                                </Button>
                                            </StepMessage>
                                        )}

                                        {slotsReady && hasSchedule && !anyFreeDay && (
                                            <StepMessage icon="event_busy" title="No quedan horarios libres esta semana" text="Probá con la semana siguiente o elegí otro barbero.">
                                                <Button variant="secondary" size="sm" onClick={() => changeWeek(1)}>
                                                    Ver semana siguiente
                                                    <Icon name="arrow_forward" size={18} />
                                                </Button>
                                                <Button variant="ghost" size="sm" onClick={() => setEditing(2)}>
                                                    Elegir otro barbero
                                                </Button>
                                            </StepMessage>
                                        )}

                                        {slotsReady && hasSchedule && anyFreeDay && !selectedDay && (
                                            <p className="step-hint">
                                                <Icon name="touch_app" size={18} />
                                                Elegí un día para ver los horarios libres.
                                            </p>
                                        )}

                                        {selectedDay && daySlots.length > 0 && (
                                            <TimeGrid slots={daySlots} selected={time} onSelect={selectTime} />
                                        )}

                                        {selectedDay && (
                                            <div className="step-foot">
                                                <p className="step-note">
                                                    <Icon name="info" size={18} />
                                                    Si alguien toma ese horario justo antes, te avisamos al confirmar.
                                                </p>
                                                <Button onClick={confirmTime} disabled={!timeValid}>
                                                    Continuar a tus datos
                                                    <Icon name="arrow_forward" size={18} />
                                                </Button>
                                            </div>
                                        )}
                                    </>
                                )}
                            </StepBlock>

                            {/* 4 · Tus datos */}
                            <StepBlock id="step-4" index={4} title="Tus datos" state={stepState(4, false)} lockedHint="Completá el horario arriba">
                                <div className="booking-form-grid">
                                    <FormField id="booking-firstName" label="Nombre" required error={errors.firstName}>
                                        <input
                                            id="booking-firstName"
                                            name="given-name"
                                            className="form-input"
                                            value={guest.firstName}
                                            onChange={(e) => updateGuest("firstName", e.target.value)}
                                            autoComplete="given-name"
                                            aria-invalid={Boolean(errors.firstName)}
                                            aria-describedby={errors.firstName ? "booking-firstName-error" : undefined}
                                        />
                                    </FormField>
                                    <FormField id="booking-lastName" label="Apellido" required error={errors.lastName}>
                                        <input
                                            id="booking-lastName"
                                            name="family-name"
                                            className="form-input"
                                            value={guest.lastName}
                                            onChange={(e) => updateGuest("lastName", e.target.value)}
                                            autoComplete="family-name"
                                            aria-invalid={Boolean(errors.lastName)}
                                            aria-describedby={errors.lastName ? "booking-lastName-error" : undefined}
                                        />
                                    </FormField>
                                    <FormField
                                        id="booking-phone"
                                        label="Teléfono"
                                        required
                                        error={errors.phone}
                                        hint="Solo lo usamos para este turno."
                                    >
                                        <input
                                            id="booking-phone"
                                            name="tel"
                                            type="tel"
                                            inputMode="tel"
                                            className="form-input mono"
                                            value={guest.phone}
                                            onChange={(e) => updateGuest("phone", e.target.value)}
                                            autoComplete="tel"
                                            spellCheck={false}
                                            placeholder="11 2345-6789"
                                            aria-invalid={Boolean(errors.phone)}
                                            aria-describedby={errors.phone ? "booking-phone-error" : "booking-phone-hint"}
                                        />
                                    </FormField>
                                    <FormField
                                        id="booking-note"
                                        label={
                                            <>
                                                Referencia<span className="form-label-optional">(opcional)</span>
                                            </>
                                        }
                                        hint="Ej: de parte de Juan, o el corte de la vez pasada."
                                    >
                                        <textarea
                                            id="booking-note"
                                            name="note"
                                            className="form-input"
                                            rows="3"
                                            maxLength={300}
                                            value={guest.note}
                                            onChange={(e) => updateGuest("note", e.target.value)}
                                            aria-describedby="booking-note-hint"
                                        />
                                    </FormField>
                                </div>
                            </StepBlock>
                        </fieldset>
                    </form>

                    <aside className="booking-aside" aria-labelledby="summary-title">
                        <BookingSummary headingId="summary-title" {...summaryProps} />
                    </aside>
                </div>
            </div>

            {/* Mobile: barra fija con resumen + hoja inferior */}
            <div className="booking-bar">
                <button
                    ref={sheetTriggerRef}
                    type="button"
                    className="booking-bar-summary"
                    onClick={() => setSheetOpen(true)}
                    aria-expanded={sheetOpen}
                    aria-controls="booking-sheet"
                >
                    <span className="booking-bar-label">
                        Ver resumen
                        <Icon name="expand_less" size={18} />
                    </span>
                    <span className="booking-bar-line">{barLine || "Elegí un servicio"}</span>
                </button>
                <span className="booking-bar-price mono">{service ? formatPrice(service.price) : ""}</span>
                <Button onClick={handleConfirmClick} disabled={!stepsReady} loading={submitting}>
                    {submitting ? "Confirmando…" : "Confirmar"}
                </Button>
            </div>

            <div className={`booking-sheet-backdrop ${sheetOpen ? "is-open" : ""}`} onClick={() => setSheetOpen(false)} aria-hidden="true" />
            <div
                id="booking-sheet"
                className={`booking-sheet ${sheetOpen ? "is-open" : ""}`}
                role="dialog"
                aria-modal="true"
                aria-labelledby="sheet-summary-title"
                inert={!sheetOpen || undefined}
            >
                <div className="booking-sheet-grabber" aria-hidden="true" />
                <button ref={sheetCloseRef} type="button" className="icon-btn booking-sheet-close" onClick={() => setSheetOpen(false)} aria-label="Cerrar resumen">
                    <Icon name="close" size={22} />
                </button>
                <BookingSummary headingId="sheet-summary-title" {...summaryProps} />
            </div>
        </section>
    );
}

