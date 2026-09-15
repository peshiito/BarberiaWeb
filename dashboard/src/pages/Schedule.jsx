import { useEffect, useMemo, useState } from "react";
import SlotDurationPicker, { DURATION_MAX, DURATION_MIN } from "../components/schedule/SlotDurationPicker";
import TimeStepper from "../components/schedule/TimeStepper";
import WeekPicker, { formatWeekSpan } from "../components/schedule/WeekPicker";
import WorkdayToggles, { WORK_DAYS } from "../components/schedule/WorkdayToggles";
import { isoWeekNumber } from "../components/schedule/agendaUtils";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Icon from "../components/ui/Icon";
import InlineFeedback from "../components/ui/InlineFeedback";
import PageHeader from "../components/ui/PageHeader";
import Skeleton from "../components/ui/Skeleton";
import { useToast } from "../components/ui/Toast";
import { createSchedule, getMySchedules } from "../services/schedules";
import { DAY_NAMES, addDays, getMonday, parseDateOnly, parseWorkDays, toISODate } from "../utils/date";
import { timeToMinutes } from "../utils/format";
import { generateSlots } from "../utils/slots";
import "./Schedule.css";

const DEFAULTS = {
    days: ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado"],
    start: "10:00",
    end: "20:00",
    duration: 30,
};

const AFTERNOON_FROM = "14:00";

const plural = (count, singular, pluralForm) => `${count} ${count === 1 ? singular : pluralForm}`;
const formatHours = hours => `${Number.isInteger(hours) ? hours : hours.toFixed(1).replace(".", ",")} h`;
const shortDays = workDays =>
    WORK_DAYS.filter(d => parseWorkDays(workDays).includes(d.key))
        .map(d => d.short)
        .join(" · ");

const configFrom = schedule =>
    schedule
        ? {
              days: parseWorkDays(schedule.work_days),
              start: schedule.start_time.slice(0, 5),
              end: schedule.end_time.slice(0, 5),
              duration: Number(schedule.slot_duration_minutes),
          }
        : DEFAULTS;

const Schedule = () => {
    const { showToast } = useToast();
    const currentMonday = useMemo(() => getMonday(new Date()), []);
    const currentMondayIso = toISODate(currentMonday);

    const [schedules, setSchedules] = useState([]);
    const [loadingList, setLoadingList] = useState(true);
    const [weekStart, setWeekStart] = useState(currentMonday);
    const [selectedDays, setSelectedDays] = useState(DEFAULTS.days);
    const [startTime, setStartTime] = useState(DEFAULTS.start);
    const [endTime, setEndTime] = useState(DEFAULTS.end);
    const [duration, setDuration] = useState(DEFAULTS.duration);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const sortedSchedules = useMemo(
        () => [...schedules].sort((a, b) => b.week_start.localeCompare(a.week_start)),
        [schedules],
    );
    const openedWeeks = useMemo(() => new Set(schedules.map(s => s.week_start.slice(0, 10))), [schedules]);
    const lastSchedule = sortedSchedules[0] || null;

    const applyConfig = config => {
        setSelectedDays(config.days);
        setStartTime(config.start);
        setEndTime(config.end);
        setDuration(config.duration);
    };

    // Primera semana desde la actual que todavía no tiene agenda.
    const firstFreeWeek = opened => {
        let cursor = currentMonday;
        for (let i = 0; i < 52 && opened.has(toISODate(cursor)); i += 1) cursor = addDays(cursor, 7);
        return cursor;
    };

    const loadSchedules = async ({ initial = false } = {}) => {
        setLoadingList(true);
        try {
            const data = await getMySchedules();
            setSchedules(data);
            if (initial) {
                const opened = new Set(data.map(s => s.week_start.slice(0, 10)));
                const last = [...data].sort((a, b) => b.week_start.localeCompare(a.week_start))[0];
                applyConfig(configFrom(last));
                setWeekStart(firstFreeWeek(opened));
            }
        } catch {
            // La lista no bloquea el formulario.
        } finally {
            setLoadingList(false);
        }
    };

    useEffect(() => {
        loadSchedules({ initial: true });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const weekStartIso = toISODate(weekStart);
    const isOpened = openedWeeks.has(weekStartIso);
    const isPastWeek = weekStart < currentMonday;

    const durationError =
        duration === "" || Number.isNaN(duration)
            ? "Elegí una duración."
            : duration < DURATION_MIN || duration > DURATION_MAX
              ? `La duración tiene que estar entre ${DURATION_MIN} y ${DURATION_MAX} minutos.`
              : null;
    const timeError = startTime >= endTime ? "El cierre tiene que ser después de la apertura." : null;

    const slots = durationError || timeError ? [] : generateSlots(startTime, endTime, duration);
    const morning = slots.filter(s => s < AFTERNOON_FROM);
    const afternoon = slots.filter(s => s >= AFTERNOON_FROM);
    const activeDays = selectedDays.length;
    const journeyHours = timeError ? 0 : (timeToMinutes(endTime) - timeToMinutes(startTime)) / 60;
    const weeklySlots = slots.length * activeDays;
    const lastSlot = slots[slots.length - 1];
    const lastSlotEnds = lastSlot ? timeToMinutes(lastSlot) + Number(duration) : null;

    const blockers = [
        isOpened && "Esa semana ya tiene agenda abierta.",
        isPastWeek && "No se puede abrir una semana que ya pasó.",
        activeDays === 0 && "Elegí al menos un día de atención.",
        (durationError || timeError) && (timeError || durationError),
        !durationError && !timeError && slots.length === 0 && "Con ese horario y duración no entra ningún turno.",
    ].filter(Boolean);

    const toggleDay = key =>
        setSelectedDays(prev => (prev.includes(key) ? prev.filter(d => d !== key) : [...prev, key]));

    const handleSubmit = async () => {
        setError("");
        if (blockers.length > 0) return;
        setSubmitting(true);
        try {
            await createSchedule({
                week_start: weekStartIso,
                work_days: WORK_DAYS.map(d => d.key)
                    .filter(key => selectedDays.includes(key))
                    .join(","),
                start_time: startTime,
                end_time: endTime,
                slot_duration_minutes: Number(duration),
            });
            showToast(`Agenda abierta para la semana del ${formatWeekSpan(weekStart)}.`);
            loadSchedules();
        } catch (err) {
            setError(
                err.response?.status === 409
                    ? "Esa semana ya tiene agenda abierta."
                    : err.response?.data?.error || "No se pudo abrir la agenda.",
            );
        } finally {
            setSubmitting(false);
        }
    };

    const weekStatus = monday => {
        const iso = monday.slice(0, 10);
        if (iso === currentMondayIso) return { label: "En curso", tone: "sage" };
        return iso > currentMondayIso ? { label: "Próxima", tone: "brass-soft" } : { label: "Pasada", tone: "neutral" };
    };

    return (
        <div className="schedule-page">
            <PageHeader
                eyebrow="Configuración de agenda"
                title="Mis horarios"
                titleAccent="Disponibilidad"
                description="Abrí tu agenda semanal: días de atención, horario y duración de cada turno. Es lo que ven los clientes al reservar."
                status={
                    loadingList ? null : openedWeeks.has(currentMondayIso) ? (
                        <span className="schedule-status is-on">
                            <span className="schedule-status-dot" aria-hidden="true" />
                            Esta semana está abierta
                        </span>
                    ) : (
                        <span className="schedule-status">
                            <span className="schedule-status-dot" aria-hidden="true" />
                            Esta semana sin abrir
                        </span>
                    )
                }
            />

            <div className="schedule-grid">
                <div className="schedule-main">
                    <section className="schedule-card">
                        <header className="schedule-card-head">
                            <h2 className="schedule-card-title">
                                <Icon name="date_range" size={22} />
                                Semana a abrir
                            </h2>
                            <Badge tone="brass-soft">
                                Semana {isoWeekNumber(weekStart)} · {weekStart.getFullYear()}
                            </Badge>
                        </header>
                        <WeekPicker
                            weekStart={weekStart}
                            onChange={setWeekStart}
                            openedWeeks={openedWeeks}
                            minWeek={currentMonday}
                        />
                        <p className="schedule-note">
                            <Icon name="info" size={16} />
                            Se abre la semana completa, de lunes a domingo. Las semanas marcadas en verde ya tienen agenda.
                        </p>
                    </section>

                    <section className="schedule-card">
                        <header className="schedule-card-head">
                            <h2 className="schedule-card-title">
                                <Icon name="view_week" size={22} />
                                Días de atención
                            </h2>
                            <span className="schedule-card-aside">
                                {plural(activeDays, "día activo", "días activos")} ·{" "}
                                {plural(7 - activeDays, "franco", "francos")}
                            </span>
                        </header>
                        <WorkdayToggles
                            selected={selectedDays}
                            onToggle={toggleDay}
                            startTime={startTime}
                            endTime={endTime}
                            todayKey={
                                weekStartIso === currentMondayIso ? DAY_NAMES[new Date().getDay()] : null
                            }
                        />
                    </section>

                    <section className="schedule-card">
                        <header className="schedule-card-head">
                            <h2 className="schedule-card-title">
                                <Icon name="schedule" size={22} />
                                Apertura y cierre
                            </h2>
                            <span className="schedule-card-aside">
                                Jornada: {timeError ? "—" : formatHours(journeyHours)}
                            </span>
                        </header>
                        <div className="schedule-times">
                            <TimeStepper
                                id="schedule-start"
                                label="Hora de apertura"
                                icon="wb_sunny"
                                value={startTime}
                                onChange={setStartTime}
                            />
                            <TimeStepper
                                id="schedule-end"
                                label="Hora de cierre"
                                icon="nights_stay"
                                value={endTime}
                                onChange={setEndTime}
                            />
                        </div>
                        {timeError && <InlineFeedback tone="error">{timeError}</InlineFeedback>}
                    </section>

                    <section className="schedule-card">
                        <header className="schedule-card-head">
                            <h2 className="schedule-card-title">
                                <Icon name="timelapse" size={22} />
                                Duración de cada turno
                            </h2>
                            <span className="schedule-card-aside">Cada cuánto empieza un turno</span>
                        </header>
                        <SlotDurationPicker value={duration} onChange={setDuration} />
                        {durationError && <InlineFeedback tone="error">{durationError}</InlineFeedback>}
                    </section>
                </div>

                <aside className="schedule-side">
                    <section className="schedule-card schedule-preview">
                        <div className="schedule-preview-head">
                            <div className="schedule-preview-top">
                                <span className="schedule-kicker">
                                    <span className="schedule-kicker-dot" aria-hidden="true" />
                                    Vista previa
                                </span>
                                {!timeError && (
                                    <span className="schedule-card-aside">
                                        Jornada de {startTime} a {endTime}
                                    </span>
                                )}
                            </div>
                            <h2 className="schedule-preview-title">Turnos disponibles por día</h2>
                            <p className="schedule-preview-text">
                                <strong>{plural(slots.length, "turno", "turnos")}</strong> por cada día abierto de la
                                semana del <strong className="is-plain">{formatWeekSpan(weekStart)}</strong>
                                {slots.length > 0 && ` (cada ${duration} min)`}.
                            </p>
                        </div>

                        {slots.length === 0 ? (
                            <div className="schedule-preview-empty">
                                <Icon name="event_busy" size={24} />
                                Ajustá el horario o la duración para ver los turnos.
                            </div>
                        ) : (
                            [
                                { key: "morning", label: "Mañana", list: morning },
                                { key: "afternoon", label: "Tarde", list: afternoon },
                            ]
                                .filter(block => block.list.length > 0)
                                .map(block => (
                                    <div key={block.key} className="schedule-block">
                                        <div className="schedule-block-head">
                                            <span className="schedule-block-label">
                                                {block.label} ({plural(block.list.length, "turno", "turnos")})
                                            </span>
                                            <span className="schedule-block-range">
                                                {block.list[0]} – {block.list[block.list.length - 1]}
                                            </span>
                                        </div>
                                        <div className="schedule-slots">
                                            {block.list.map(slot => (
                                                <span key={slot} className="schedule-slot">
                                                    {slot}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))
                        )}

                        {lastSlotEnds !== null && lastSlotEnds < timeToMinutes(endTime) && (
                            <p className="schedule-note">
                                <Icon name="info" size={16} />
                                El último turno empieza a las {lastSlot} para terminar antes del cierre.
                            </p>
                        )}

                        <div className="schedule-metrics">
                            <div className="schedule-metric">
                                <span className="schedule-metric-value">{activeDays}</span>
                                <span className="schedule-metric-label">Días abiertos</span>
                            </div>
                            <div className="schedule-metric">
                                <span className="schedule-metric-value">{weeklySlots}</span>
                                <span className="schedule-metric-label">Turnos en la semana</span>
                            </div>
                            <div className="schedule-metric">
                                <span className="schedule-metric-value is-accent">
                                    {formatHours((weeklySlots * (Number(duration) || 0)) / 60)}
                                </span>
                                <span className="schedule-metric-label">Horas de atención</span>
                            </div>
                        </div>

                        {error && <InlineFeedback tone="error">{error}</InlineFeedback>}
                        {!error && blockers.length > 0 && (
                            <p className="schedule-blocker">
                                <Icon name="block" size={16} />
                                {blockers[0]}
                            </p>
                        )}

                        <div className="schedule-actions">
                            <Button
                                variant="ghost"
                                onClick={() => {
                                    applyConfig(configFrom(lastSchedule));
                                    setError("");
                                }}
                            >
                                Descartar
                            </Button>
                            <Button
                                icon="save"
                                loading={submitting}
                                disabled={blockers.length > 0}
                                onClick={handleSubmit}
                                className="schedule-submit"
                            >
                                Abrir agenda
                            </Button>
                        </div>
                    </section>

                    <div className="schedule-info">
                        <span className="schedule-info-icon">
                            <Icon name="history_toggle_off" size={22} />
                        </span>
                        <span>
                            <span className="schedule-info-title">Una semana, una agenda</span>
                            <span className="schedule-info-text">
                                Cada semana se abre una sola vez y no se edita desde acá. Revisá días y horario antes de
                                abrirla.
                            </span>
                        </span>
                    </div>

                    <section className="schedule-card">
                        <header className="schedule-card-head">
                            <h2 className="schedule-card-title">
                                <Icon name="event_note" size={22} />
                                Agendas abiertas
                            </h2>
                            {!loadingList && <span className="schedule-card-aside">{schedules.length}</span>}
                        </header>
                        {loadingList ? (
                            <div className="schedule-list">
                                <Skeleton height="56px" />
                                <Skeleton height="56px" />
                            </div>
                        ) : sortedSchedules.length === 0 ? (
                            <p className="schedule-empty">Todavía no abriste ninguna agenda.</p>
                        ) : (
                            <ul className="schedule-list">
                                {sortedSchedules.map(s => {
                                    const status = weekStatus(s.week_start);
                                    return (
                                        <li key={s.id}>
                                            <button
                                                type="button"
                                                className={`schedule-list-item ${
                                                    s.week_start.slice(0, 10) === weekStartIso ? "is-current" : ""
                                                }`}
                                                onClick={() => setWeekStart(parseDateOnly(s.week_start))}
                                            >
                                                <span className="schedule-list-text">
                                                    <span className="schedule-list-week">
                                                        Semana del {formatWeekSpan(parseDateOnly(s.week_start))}
                                                    </span>
                                                    <span className="schedule-list-detail">
                                                        {shortDays(s.work_days)} · {s.start_time.slice(0, 5)}–
                                                        {s.end_time.slice(0, 5)} · cada {s.slot_duration_minutes} min
                                                    </span>
                                                </span>
                                                <Badge tone={status.tone}>{status.label}</Badge>
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </section>
                </aside>
            </div>
        </div>
    );
};

export default Schedule;
