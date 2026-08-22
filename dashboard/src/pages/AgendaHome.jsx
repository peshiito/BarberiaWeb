import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import AlertBanner from "../components/home/AlertBanner";
import ClientHistoryModal from "../components/clients/ClientHistoryModal";
import AppointmentDetailModal from "../components/schedule/AppointmentDetailModal";
import AppointmentFormModal from "../components/schedule/AppointmentFormModal";
import WeekGrid from "../components/schedule/WeekGrid";
import WeekNavigator from "../components/schedule/WeekNavigator";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import InlineFeedback from "../components/ui/InlineFeedback";
import PageHeader from "../components/ui/PageHeader";
import Skeleton from "../components/ui/Skeleton";
import StatCard from "../components/ui/StatCard";
import { useToast } from "../components/ui/Toast";
import {
    IconCalendar,
    IconCheckCircle,
    IconClock,
    IconCoin,
    IconGauge,
    IconHourglass,
    IconSunrise,
    IconUnlock,
    IconUserPlus,
    IconUsers,
    IconWeek,
} from "../components/ui/icons";
import { useAuth } from "../context/AuthContext";
import { useHomeDashboard } from "../hooks/useHomeDashboard";
import {
    cancelAppointmentByAdmin,
    cancelAppointmentByBarber,
    completeAppointment,
    getBarberWeekAppointments,
} from "../services/appointments";
import { getScheduleSlots } from "../services/schedules";
import { addDays, getMonday, getWeekDays, toISODate } from "../utils/date";
import { formatMoney } from "../utils/format";
import "./AgendaHome.css";

const iconCalendarDay = <IconCalendar />;
const iconClock = <IconClock />;
const iconWeek = <IconWeek />;
const iconUnlock = <IconUnlock />;
const iconGauge = <IconGauge />;
const iconCheck = <IconCheckCircle />;
const iconSunrise = <IconSunrise />;
const iconHourglass = <IconHourglass />;
const iconCoin = <IconCoin />;
const iconUsers = <IconUsers />;
const iconUserPlus = <IconUserPlus />;

const formatHours = value => (value === null ? "—" : `${value.toFixed(1)} h`);

const APPOINTMENT_STATUS_TONE = { active: "brass", completed: "sage", cancelled: "burgundy" };
const APPOINTMENT_STATUS_LABEL = { active: "Confirmado", completed: "Completado", cancelled: "Cancelado" };

const AgendaHome = () => {
    const { user, isAdmin } = useAuth();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const { loading: homeLoading, data: home, reload: reloadHome } = useHomeDashboard(user);
    const hasOwnAgenda = user?.role === "barber" || user?.role === "admin_barber";

    const [weekStart, setWeekStart] = useState(() => getMonday(new Date()));
    const [schedule, setSchedule] = useState(null);
    const [slots, setSlots] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);

    const [appointmentFormState, setAppointmentFormState] = useState(null);
    const [historyClientId, setHistoryClientId] = useState(null);

    const weekStartIso = toISODate(weekStart);
    const weekDays = getWeekDays(weekStart);

    // Evita que una request vieja (semana anterior, o disparada antes de un reload)
    // pise el estado de una request más nueva si llega a resolver después.
    const loadWeekRequestId = useRef(0);

    const loadWeek = useCallback(async () => {
        if (!hasOwnAgenda) {
            setLoading(false);
            return;
        }
        const requestId = ++loadWeekRequestId.current;
        setLoading(true);
        setError("");

        try {
            const slotsData = await getScheduleSlots(user.id, weekStartIso);
            if (requestId !== loadWeekRequestId.current) return;

            if (!slotsData.has_schedule) {
                setSchedule(null);
                setSlots([]);
                setAppointments([]);
                return;
            }

            setSchedule({ work_days: slotsData.work_days });
            setSlots(slotsData.slots);

            const appointmentsData = await getBarberWeekAppointments(weekStartIso, 1, 100);
            if (requestId !== loadWeekRequestId.current) return;
            setAppointments(appointmentsData.data);
        } catch {
            if (requestId === loadWeekRequestId.current) {
                setError("No se pudo cargar la agenda. Intentá de nuevo.");
            }
        } finally {
            if (requestId === loadWeekRequestId.current) {
                setLoading(false);
            }
        }
    }, [hasOwnAgenda, user?.id, weekStartIso]);

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
            reloadHome();
        } catch {
            showToast("No se pudo marcar el turno como completado.", "error");
        } finally {
            setActionLoading(false);
        }
    };

    const handleCancel = async appointmentId => {
        setActionLoading(true);
        try {
            const isOwn = selectedAppointment?.barber_id === user.id;
            if (isAdmin && !isOwn) {
                await cancelAppointmentByAdmin(appointmentId);
            } else {
                await cancelAppointmentByBarber(appointmentId);
            }
            setAppointments(prev => prev.filter(a => a.id !== appointmentId));
            setSelectedAppointment(null);
            showToast("Turno cancelado.");
            reloadHome();
        } catch {
            showToast("No se pudo cancelar el turno.", "error");
        } finally {
            setActionLoading(false);
        }
    };

    const handleAppointmentSaved = () => {
        setAppointmentFormState(null);
        setSelectedAppointment(null);
        loadWeek();
        reloadHome();
    };

    const openNewAppointment = () => setAppointmentFormState({ mode: "create" });
    const openFreeSlot = (dateIso, time) =>
        setAppointmentFormState({ mode: "create", initialBarberId: user.id, initialDate: dateIso, initialTime: time });
    const openReschedule = appointment => setAppointmentFormState({ mode: "reschedule", appointment });

    return (
        <div>
            <PageHeader
                eyebrow={home?.kind === "business" ? "Panel de negocio" : "Agenda"}
                title={`Hola, ${user?.first_name || "Barbero"}`}
                description={
                    home?.kind === "business"
                        ? "Un vistazo al negocio de hoy."
                        : "Tu centro de operaciones del día."
                }
                action={
                    hasOwnAgenda ? (
                        <div className="home-header-actions">
                            <WeekNavigator
                                weekStart={weekStart}
                                onPrev={handlePrevWeek}
                                onNext={handleNextWeek}
                                onToday={handleToday}
                            />
                            <Button variant="primary" onClick={openNewAppointment}>
                                Nuevo turno
                            </Button>
                        </div>
                    ) : (
                        <Button variant="primary" onClick={openNewAppointment}>
                            Nuevo turno
                        </Button>
                    )
                }
            />

            {homeLoading ? (
                <div className="home-summary-skeleton">
                    <Skeleton height="52px" />
                    <div className="home-stats-grid">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <Skeleton key={i} height="112px" />
                        ))}
                    </div>
                </div>
            ) : home?.kind === "business" ? (
                <>
                    <div className="home-metrics-header">
                        <span className="eyebrow">Hoy</span>
                    </div>
                    <div className="home-stats-grid">
                        <StatCard
                            icon={iconCoin}
                            label="Ingresos de hoy"
                            value={home.revenueToday !== null ? formatMoney(home.revenueToday) : "—"}
                            highlight
                        />
                        <StatCard icon={iconCheck} label="Turnos completados hoy" value={home.appointmentsToday ?? "—"} />
                        <StatCard
                            icon={iconUsers}
                            label="Barberos activos hoy"
                            value={home.activeBarbersToday ?? "—"}
                            sub={`de ${home.totalBarbers} en el equipo`}
                        />
                        <StatCard
                            icon={iconGauge}
                            label="Mejor barbero de hoy"
                            value={home.bestBarberToday ? home.bestBarberToday.name : "—"}
                            sub={home.bestBarberToday ? formatMoney(home.bestBarberToday.total_revenue) : "Sin turnos completados"}
                        />
                    </div>

                    <div className="home-metrics-header">
                        <span className="eyebrow">Esta semana</span>
                    </div>
                    <div className="home-stats-grid">
                        <StatCard
                            icon={iconCoin}
                            label="Ingresos de la semana"
                            value={home.revenueThisWeek !== null ? formatMoney(home.revenueThisWeek) : "—"}
                        />
                        <StatCard icon={iconWeek} label="Turnos esta semana" value={home.appointmentsThisWeek ?? "—"} />
                        <StatCard icon={iconUserPlus} label="Clientes nuevos" value={home.newClientsThisWeek} />
                    </div>

                    <div className="home-metrics-header">
                        <span className="eyebrow">Este mes</span>
                    </div>
                    <div className="home-stats-grid">
                        <StatCard
                            icon={iconCoin}
                            label="Ingresos del mes"
                            value={home.revenueThisMonth !== null ? formatMoney(home.revenueThisMonth) : "—"}
                        />
                        <StatCard icon={iconWeek} label="Turnos del mes" value={home.appointmentsThisMonth ?? "—"} />
                        <StatCard icon={iconUsers} label="Clientes totales" value={home.totalClients ?? "—"} />
                    </div>
                </>
            ) : (
                home && (
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

                        <div className="home-metrics-header">
                            <span className="eyebrow">Hoy</span>
                        </div>
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
                                    home.nextClient ? (
                                        <span title={`${home.nextClient.client_first_name} ${home.nextClient.client_last_name}`}>
                                            {home.nextClient.client_first_name} {home.nextClient.client_last_name}
                                        </span>
                                    ) : (
                                        "—"
                                    )
                                }
                                sub={home.nextClient ? home.nextClient.time.slice(0, 5) : "Sin turnos pendientes hoy"}
                                highlight={Boolean(home.nextClient)}
                            />
                            <StatCard
                                icon={iconUnlock}
                                label="Horarios libres hoy"
                                value={home.freeSlotsToday === null ? "—" : home.freeSlotsToday}
                                sub={!home.isTodayWorkDay && home.hasScheduleThisWeek ? "Hoy no trabajás" : undefined}
                            />
                            <StatCard icon={iconHourglass} label="Horas disponibles hoy" value={formatHours(home.hoursAvailableToday)} />
                        </div>

                        {home.todayAppointments.length > 0 && (
                            <Card className="home-today-list">
                                <h3 className="card-section-title">Turnos de hoy</h3>
                                <div className="home-today-rows">
                                    {home.todayAppointments
                                        .slice()
                                        .sort((a, b) => a.time.localeCompare(b.time))
                                        .map(appointment => (
                                            <button
                                                key={appointment.id}
                                                type="button"
                                                className="home-today-row"
                                                onClick={() => setSelectedAppointment(appointment)}
                                            >
                                                <span className="home-today-row-time">{appointment.time.slice(0, 5)}</span>
                                                <span className="home-today-row-client">
                                                    {appointment.client_first_name} {appointment.client_last_name}
                                                </span>
                                                <span className="home-today-row-service">{appointment.service_name || "—"}</span>
                                                <Badge tone={APPOINTMENT_STATUS_TONE[appointment.status] || "neutral"}>
                                                    {APPOINTMENT_STATUS_LABEL[appointment.status] || appointment.status}
                                                </Badge>
                                            </button>
                                        ))}
                                </div>
                            </Card>
                        )}

                        <div className="home-metrics-header">
                            <span className="eyebrow">Esta semana</span>
                        </div>
                        <div className="home-stats-grid">
                            <StatCard icon={iconWeek} label="Turnos esta semana" value={home.appointmentsThisWeek.length} />
                            <StatCard icon={iconSunrise} label="Turnos mañana" value={home.tomorrowAppointmentsCount} />
                            <StatCard icon={iconCheck} label="Completados esta semana" value={home.completedThisWeek} />
                            <StatCard
                                icon={iconGauge}
                                label="Ocupación semanal"
                                value={home.occupancyPercent === null ? "—" : `${home.occupancyPercent}%`}
                            />
                            <StatCard icon={iconHourglass} label="Horas trabajadas" value={formatHours(home.hoursWorkedThisWeek)} />
                        </div>

                        <div className="home-metrics-header">
                            <span className="eyebrow">Ingresos</span>
                        </div>
                        <div className="home-stats-grid">
                            <StatCard icon={iconCoin} label="Ingresos del día" value={formatMoney(home.revenueToday)} highlight />
                            <StatCard icon={iconCoin} label="Ingresos de la semana" value={formatMoney(home.revenueThisWeek)} />
                            <StatCard icon={iconCoin} label="Ingresos del mes" value={formatMoney(home.revenueThisMonth)} />
                        </div>
                    </>
                )
            )}

            {error && (
                <InlineFeedback tone="error" className="home-error">
                    {error}
                </InlineFeedback>
            )}

            {hasOwnAgenda &&
                (loading ? (
                    <div className="week-grid-skeleton">
                        <Skeleton height="52px" />
                        <Skeleton height="320px" />
                    </div>
                ) : (
                    <WeekGrid
                        weekDays={weekDays}
                        schedule={schedule}
                        slots={slots}
                        appointments={appointments}
                        onSelectAppointment={setSelectedAppointment}
                        onSelectFreeSlot={openFreeSlot}
                    />
                ))}

            <div className="home-quick-links">
                <Button variant="ghost" size="sm" onClick={() => navigate("/clients")}>
                    Clientes
                </Button>
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
                onReschedule={openReschedule}
                onViewClient={id => setHistoryClientId(id)}
                actionLoading={actionLoading}
            />

            <AppointmentFormModal
                open={Boolean(appointmentFormState)}
                mode={appointmentFormState?.mode || "create"}
                appointment={appointmentFormState?.appointment || null}
                initialBarberId={appointmentFormState?.initialBarberId || null}
                initialDate={appointmentFormState?.initialDate || null}
                initialTime={appointmentFormState?.initialTime || null}
                onClose={() => setAppointmentFormState(null)}
                onSaved={handleAppointmentSaved}
            />

            <ClientHistoryModal clientId={historyClientId} onClose={() => setHistoryClientId(null)} />
        </div>
    );
};

export default AgendaHome;
