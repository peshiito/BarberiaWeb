import { useEffect, useState } from "react";
import DayPicker from "../components/schedule/DayPicker";
import DurationPicker, { DURATION_MAX, DURATION_MIN } from "../components/schedule/DurationPicker";
import MonthCalendar from "../components/schedule/MonthCalendar";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import FormField from "../components/ui/FormField";
import InlineFeedback from "../components/ui/InlineFeedback";
import PageHeader from "../components/ui/PageHeader";
import Skeleton from "../components/ui/Skeleton";
import { createSchedule, getMySchedules } from "../services/schedules";
import { formatWeekRange, getMonday, parseDateOnly, toISODate } from "../utils/date";
import { generateSlots } from "../utils/slots";
import "./Schedule.css";

const Schedule = () => {
    const [selectedDays, setSelectedDays] = useState([]);
    const [startTime, setStartTime] = useState("10:00");
    const [endTime, setEndTime] = useState("20:00");
    const [duration, setDuration] = useState(30);
    // Date, no string: parsear un <input type="date"> con `new Date(str)` lo
    // interpreta como UTC y en huso horario negativo (Argentina) cae un día
    // antes en hora local — al elegir el lunes siguiente, terminaba
    // recalculando el lunes de ESTA semana y chocaba con la agenda ya creada
    // ("ya existe una agenda para esa semana"), como si no dejara abrir la
    // semana que viene.
    const [weekStart, setWeekStart] = useState(() => getMonday(new Date()));
    const weekStartIso = toISODate(weekStart);
    const [submitting, setSubmitting] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [schedules, setSchedules] = useState([]);
    const [loadingList, setLoadingList] = useState(true);

    const durationError =
        duration === "" || Number.isNaN(duration)
            ? "Elegí una duración"
            : duration < DURATION_MIN || duration > DURATION_MAX
              ? `Tiene que estar entre ${DURATION_MIN} y ${DURATION_MAX} minutos`
              : null;

    const preview = durationError ? [] : generateSlots(startTime, endTime, duration);

    const loadSchedules = async () => {
        setLoadingList(true);
        try {
            const data = await getMySchedules();
            setSchedules(data);
        } catch {
            // silencioso: la lista no es crítica para el formulario
        } finally {
            setLoadingList(false);
        }
    };

    useEffect(() => {
        loadSchedules();
    }, []);

    const toggleDay = day => {
        setSelectedDays(prev => (prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]));
    };

    const handleToday = () => setWeekStart(getMonday(new Date()));

    const handleSubmit = async e => {
        e.preventDefault();
        setFeedback(null);

        if (selectedDays.length === 0) {
            setFeedback({ type: "error", message: "Elegí al menos un día de trabajo" });
            return;
        }

        if (durationError) {
            setFeedback({ type: "error", message: durationError });
            return;
        }

        if (preview.length === 0) {
            setFeedback({ type: "error", message: "El horario y la duración no generan turnos válidos" });
            return;
        }

        setSubmitting(true);
        try {
            await createSchedule({
                week_start: weekStartIso,
                work_days: selectedDays.join(","),
                start_time: startTime,
                end_time: endTime,
                slot_duration_minutes: Number(duration),
            });
            setFeedback({ type: "success", message: "Agenda creada correctamente" });
            loadSchedules();
        } catch (err) {
            const message = err.response?.data?.error || "No se pudo crear la agenda";
            setFeedback({ type: "error", message });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div>
            <PageHeader
                eyebrow="Configuración"
                title="Mis horarios"
                description="Abrí tu agenda semanal y definí tus horarios de atención."
            />

            <div className="schedule-layout">
                <Card>
                    <h3 className="card-section-title">Nueva agenda</h3>
                    <form className="schedule-form" onSubmit={handleSubmit}>
                        <FormField label="Semana a abrir" hint="Elegí cualquier día: se abre la semana completa, de lunes a domingo">
                            <div className="schedule-week-picker">
                                <div className="schedule-week-readout">
                                    <span className="schedule-week-readout-range">{formatWeekRange(weekStart)}</span>
                                    <button type="button" className="schedule-week-today" onClick={handleToday}>
                                        Hoy
                                    </button>
                                </div>
                                <MonthCalendar weekStart={weekStart} onSelectWeek={setWeekStart} />
                            </div>
                        </FormField>

                        <FormField label="Días de trabajo">
                            <DayPicker selected={selectedDays} onToggle={toggleDay} />
                        </FormField>

                        <div className="schedule-form-row">
                            <FormField label="Hora inicio">
                                <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} />
                            </FormField>
                            <FormField label="Hora fin">
                                <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} />
                            </FormField>
                        </div>

                        <FormField
                            label="Duración entre cortes"
                            hint={durationError ? undefined : "Cada cuánto empieza un turno nuevo"}
                            error={durationError}
                        >
                            <DurationPicker value={duration} onChange={setDuration} />
                        </FormField>

                        {preview.length > 0 && (
                            <div className="schedule-preview">
                                <span className="schedule-preview-label">{preview.length} turnos por día</span>
                                <div className="schedule-preview-slots">
                                    {preview.map(slot => (
                                        <span key={slot} className="schedule-preview-slot">
                                            {slot}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {feedback && (
                            <InlineFeedback tone={feedback.type === "error" ? "error" : "success"}>
                                {feedback.message}
                            </InlineFeedback>
                        )}

                        <Button type="submit" loading={submitting}>
                            Abrir agenda
                        </Button>
                    </form>
                </Card>

                <Card>
                    <h3 className="card-section-title">Agendas abiertas</h3>
                    {loadingList ? (
                        <div className="schedule-list-skeleton">
                            <Skeleton height="52px" />
                            <Skeleton height="52px" />
                        </div>
                    ) : schedules.length === 0 ? (
                        <div className="state-box">Todavía no abriste ninguna agenda.</div>
                    ) : (
                        schedules.map(s => (
                            <div key={s.id} className="schedule-list-item">
                                <div>
                                    <div className="schedule-list-week">
                                        {formatWeekRange(parseDateOnly(s.week_start))}
                                    </div>
                                    <div className="schedule-list-detail">
                                        {s.work_days} · {s.start_time.slice(0, 5)}–{s.end_time.slice(0, 5)} · cada{" "}
                                        {s.slot_duration_minutes} min
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </Card>
            </div>
        </div>
    );
};

export default Schedule;
