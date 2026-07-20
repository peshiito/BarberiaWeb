import { useCallback, useEffect, useState } from "react";
import WeekGrid from "../components/schedule/WeekGrid";
import WeekNavigator from "../components/schedule/WeekNavigator";
import PageHeader from "../components/ui/PageHeader";
import { useAuth } from "../context/AuthContext";
import { completeAppointment, getBarberWeekAppointments } from "../services/appointments";
import { getScheduleSlots } from "../services/schedules";
import { addDays, getMonday, getWeekDays, toISODate } from "../utils/date";

const AgendaHome = () => {
    const { user } = useAuth();
    const [weekStart, setWeekStart] = useState(() => getMonday(new Date()));
    const [schedule, setSchedule] = useState(null);
    const [slots, setSlots] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [completingId, setCompletingId] = useState(null);

    const weekStartIso = toISODate(weekStart);
    const weekDays = getWeekDays(weekStart);

    const loadWeek = useCallback(async () => {
        setLoading(true);
        setError("");
        setSchedule(null);
        setSlots([]);
        setAppointments([]);

        try {
            const slotsData = await getScheduleSlots(user.id, weekStartIso);
            setSchedule({ work_days: slotsData.work_days });
            setSlots(slotsData.slots);

            const appointmentsData = await getBarberWeekAppointments(weekStartIso, 1, 100);
            setAppointments(appointmentsData.data);
        } catch (err) {
            if (err.response?.status === 404) {
                setSchedule(null);
            } else {
                setError("No se pudo cargar la agenda. Intentá de nuevo.");
            }
        } finally {
            setLoading(false);
        }
    }, [user.id, weekStartIso]);

    useEffect(() => {
        loadWeek();
    }, [loadWeek]);

    const handlePrevWeek = () => setWeekStart(prev => addDays(prev, -7));
    const handleNextWeek = () => setWeekStart(prev => addDays(prev, 7));
    const handleToday = () => setWeekStart(getMonday(new Date()));

    const handleComplete = async appointmentId => {
        setCompletingId(appointmentId);
        try {
            await completeAppointment(appointmentId);
            setAppointments(prev => prev.map(a => (a.id === appointmentId ? { ...a, status: "completed" } : a)));
        } catch {
            setError("No se pudo marcar el turno como completado.");
        } finally {
            setCompletingId(null);
        }
    };

    return (
        <div>
            <PageHeader
                eyebrow="Agenda"
                title={`Hola, ${user?.first_name}`}
                description="Tu libro de turnos de la semana."
                action={
                    <WeekNavigator
                        weekStart={weekStart}
                        onPrev={handlePrevWeek}
                        onNext={handleNextWeek}
                        onToday={handleToday}
                    />
                }
            />

            {error && <p style={{ color: "var(--burgundy-bright)", marginBottom: "var(--space-4)" }}>{error}</p>}

            {loading ? (
                <p style={{ color: "var(--text-secondary)" }}>Cargando agenda...</p>
            ) : (
                <WeekGrid
                    weekDays={weekDays}
                    schedule={schedule}
                    slots={slots}
                    appointments={appointments}
                    onComplete={handleComplete}
                    completingId={completingId}
                />
            )}
        </div>
    );
};

export default AgendaHome;
