import { useEffect, useState } from "react";
import DayPicker from "../components/schedule/DayPicker";
import Card from "../components/ui/Card";
import FormField from "../components/ui/FormField";
import PageHeader from "../components/ui/PageHeader";
import { createSchedule, getMySchedules } from "../services/schedules";
import { formatWeekRange, getMonday, parseDateOnly, toISODate } from "../utils/date";
import { generateSlots } from "../utils/slots";
import "./Schedule.css";

const DURATION_OPTIONS = [15, 20, 30, 45, 60];

const Schedule = () => {
    const [selectedDays, setSelectedDays] = useState([]);
    const [startTime, setStartTime] = useState("10:00");
    const [endTime, setEndTime] = useState("20:00");
    const [duration, setDuration] = useState(30);
    const [weekStart, setWeekStart] = useState(() => toISODate(getMonday(new Date())));
    const [submitting, setSubmitting] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [schedules, setSchedules] = useState([]);
    const [loadingList, setLoadingList] = useState(true);

    const preview = generateSlots(startTime, endTime, duration);

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

    const handleSubmit = async e => {
        e.preventDefault();
        setFeedback(null);

        if (selectedDays.length === 0) {
            setFeedback({ type: "error", message: "Elegí al menos un día de trabajo" });
            return;
        }

        if (preview.length === 0) {
            setFeedback({ type: "error", message: "El horario y la duración no generan turnos válidos" });
            return;
        }

        setSubmitting(true);
        try {
            await createSchedule({
                week_start: weekStart,
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
                    <form className="schedule-form" onSubmit={handleSubmit}>
                        <FormField label="Semana a abrir">
                            <input
                                type="date"
                                value={weekStart}
                                onChange={e => setWeekStart(toISODate(getMonday(new Date(e.target.value))))}
                            />
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

                        <FormField label="Duración entre cortes" hint="Cada cuánto empieza un turno nuevo">
                            <select value={duration} onChange={e => setDuration(e.target.value)}>
                                {DURATION_OPTIONS.map(min => (
                                    <option key={min} value={min}>
                                        {min} minutos
                                    </option>
                                ))}
                            </select>
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
                            <p className={`schedule-feedback ${feedback.type === "error" ? "is-error" : "is-success"}`}>
                                {feedback.message}
                            </p>
                        )}

                        <button className="schedule-submit" type="submit" disabled={submitting}>
                            {submitting ? "Creando..." : "Abrir agenda"}
                        </button>
                    </form>
                </Card>

                <Card>
                    <h3 className="schedule-list-title">Agendas abiertas</h3>
                    {loadingList ? (
                        <p style={{ color: "var(--text-secondary)" }}>Cargando...</p>
                    ) : schedules.length === 0 ? (
                        <p style={{ color: "var(--text-secondary)" }}>Todavía no abriste ninguna agenda.</p>
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
