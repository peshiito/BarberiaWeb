import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AlertBanner from "../components/home/AlertBanner";
import AppointmentDetailModal from "../components/schedule/AppointmentDetailModal";
import WeekGrid from "../components/schedule/WeekGrid";
import WeekNavigator from "../components/schedule/WeekNavigator";
import Button from "../components/ui/Button";
import PageHeader from "../components/ui/PageHeader";
import Skeleton from "../components/ui/Skeleton";
import StatCard from "../components/ui/StatCard";
import { useToast } from "../components/ui/Toast";
import { useAuth } from "../context/AuthContext";
import { useHomeDashboard } from "../hooks/useHomeDashboard";
import { cancelAppointmentByBarber, completeAppointment, getBarberWeekAppointments } from "../services/appointments";
import { getScheduleSlots } from "../services/schedules";
import { addDays, getMonday, getWeekDays, toISODate } from "../utils/date";
import "./AgendaHome.css";

const iconCalendarDay = (
    <svg viewBox="0 0 20 20" fill="none">
        <rect x="3" y="4" width="14" height="13" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M3 8h14M7 2.5v3M13 2.5v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
);

const iconClock = (
    <svg viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" />
        <path d="M10 6.5V10l2.5 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
);

const iconWeek = (
    <svg viewBox="0 0 20 20" fill="none">
        <rect x="2.5" y="4" width="15" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M2.5 8.5h15" stroke="currentColor" strokeWidth="1.5" />
        <path d="M6.5 2.5v3M13.5 2.5v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
);

const iconUnlock = (
    <svg viewBox="0 0 20 20" fill="none">
        <rect x="4" y="9" width="12" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M6.5 9V6.5a3.5 3.5 0 016.5-1.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
);

const iconGauge = (
    <svg viewBox="0 0 20 20" fill="none">
        <path d="M3 14a7 7 0 1114 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M10 14l3.5-4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
);

const iconCheck = (
    <svg viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" />
        <path d="M7 10l2 2 4-4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const AgendaHome = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const { loading: homeLoading, data: home } = useHomeDashboard(user?.id);

    const [weekStart, setWeekStart] = useState(() => getMonday(new Date()));
    const [schedule, setSchedule] = useState(null);
    const [slots, setSlots] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);

    const weekStartIso = toISODate(weekStart);
    const weekDays = getWeekDays(weekStart);

    const loadWeek = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const slotsData = await getScheduleSlots(user.id, weekStartIso);
            setSchedule({ work_days: slotsData.work_days });
            setSlots(slotsData.slots);

            const appointmentsData = await getBarberWeekAppointments(weekStartIso, 1, 100);
            setAppointments(appointmentsData.data);
        } catch (err) {
            if (err.response?.status === 404) {
                setSchedule(null);
                setAppointments([]);
            } else {
                setError("No se pudo cargar la agenda. Intentá de nuevo.");
            }
        } finally {
            setLoading(false);
        }
    }, [user?.id, weekStartIso]);

    useEffect(() => {
        loadWeek();
    }, [loadWeek]);

    const handlePrevWeek = () => setWeekStart(prev => addDays(prev, -7));
    const handleNextWeek = () => setWeekStart(prev => addDays(prev, 7));
    const handleToday = () => setWeekStart(getMonday(new Date()));

    const handleComplete = async appointmentId => {
        setActionLoading(true);
        try {
            await completeAppointment(appointmentId);
            setAppointments(prev => prev.map(a => (a.id === appointmentId ? { ...a, status: "completed" } : a)));
            setSelectedAppointment(null);
            showToast("Turno marcado como completado.");
        } catch {
            showToast("No se pudo marcar el turno como completado.", "error");
        } finally {
            setActionLoading(false);
        }
    };

    const handleCancel = async appointmentId => {
        setActionLoading(true);
        try {
            await cancelAppointmentByBarber(appointmentId);
            setAppointments(prev => prev.filter(a => a.id !== appointmentId));
            setSelectedAppointment(null);
            showToast("Turno cancelado.");
        } catch {
            showToast("No se pudo cancelar el turno.", "error");
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div>
            <PageHeader
                eyebrow="Agenda"
                title={`Hola, ${user?.first_name || "Barbero"}`}
                description="Tu centro de operaciones del día."
                action={
                    <WeekNavigator
                        weekStart={weekStart}
                        onPrev={handlePrevWeek}
                        onNext={handleNextWeek}
                        onToday={handleToday}
                    />
                }
            />

            {homeLoading ? (
                <div className="home-summary-skeleton">
                    <Skeleton height="52px" />
                    <div className="home-stats-grid">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <Skeleton key={i} height="112px" />
                        ))}
                    </div>
                </div>
            ) : (
                <>
                    {home.alerts.length > 0 && (
                        <div className="home-alerts">
                            {home.alerts.map(alert => (
                                <AlertBanner
                                    key={alert.id}
                                    message={alert.message}
                                    actionLabel={alert.actionLabel}
                                    onAction={() => navigate(alert.to)}
                                />
                            ))}
                        </div>
                    )}

                    <div className="home-stats-grid">
                        <StatCard
                            icon={iconCalendarDay}
                            label="Turnos hoy"
                            value={home.todayAppointments.length}
                            sub={`${home.todayAppointments.filter(a => a.status === "completed").length} completados`}
                        />
                        <StatCard
                            icon={iconClock}
                            label="Próximo cliente"
                            value={
                                home.nextClient
                                    ? `${home.nextClient.client_first_name} ${home.nextClient.client_last_name}`
                                    : "—"
                            }
                            sub={home.nextClient ? home.nextClient.time.slice(0, 5) : "Sin turnos pendientes hoy"}
                            highlight={Boolean(home.nextClient)}
                        />
                        <StatCard icon={iconWeek} label="Turnos esta semana" value={home.appointmentsThisWeek.length} />
                        <StatCard
                            icon={iconUnlock}
                            label="Horarios libres hoy"
                            value={home.freeSlotsToday === null ? "—" : home.freeSlotsToday}
                            sub={!home.isTodayWorkDay && home.hasScheduleThisWeek ? "Hoy no trabajás" : undefined}
                        />
                        <StatCard
                            icon={iconGauge}
                            label="Ocupación semanal"
                            value={home.occupancyPercent === null ? "—" : `${home.occupancyPercent}%`}
                        />
                        <StatCard icon={iconCheck} label="Completados esta semana" value={home.completedThisWeek} />
                    </div>
                </>
            )}

            {error && <p className="error-message">{error}</p>}

            {loading ? (
                <div className="loading-state">
                    <p>Cargando agenda...</p>
                </div>
            ) : (
                <WeekGrid
                    weekDays={weekDays}
                    schedule={schedule}
                    slots={slots}
                    appointments={appointments}
                    onSelectAppointment={setSelectedAppointment}
                />
            )}

            <div className="home-quick-links">
                <Button variant="ghost" size="sm" onClick={() => navigate("/schedule")}>
                    Mis horarios
                </Button>
                <Button variant="ghost" size="sm" onClick={() => navigate("/profile")}>
                    Mi perfil
                </Button>
                <Button variant="ghost" size="sm" onClick={() => navigate("/photos")}>
                    Fotos y bio
                </Button>
            </div>

            <AppointmentDetailModal
                appointment={selectedAppointment}
                onClose={() => setSelectedAppointment(null)}
                onComplete={handleComplete}
                onCancel={handleCancel}
                actionLoading={actionLoading}
            />
        </div>
    );
};

export default AgendaHome;
