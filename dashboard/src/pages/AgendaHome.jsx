import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import ClientHistoryModal from "../components/clients/ClientHistoryModal";
import AppointmentDetailModal from "../components/schedule/AppointmentDetailModal";
import DayTimeline from "../components/schedule/DayTimeline";
import WeekBoard from "../components/schedule/WeekBoard";
import {
    appointmentDuration,
    deriveSlotDuration,
    findNextAppointmentId,
    formatRange,
    isPastSlot,
    isoWeekNumber,
} from "../components/schedule/agendaUtils";
import Button from "../components/ui/Button";
import Icon from "../components/ui/Icon";
import InlineFeedback from "../components/ui/InlineFeedback";
import PageHeader from "../components/ui/PageHeader";
import SegmentedControl from "../components/ui/SegmentedControl";
import Skeleton from "../components/ui/Skeleton";
import StatCard from "../components/ui/StatCard";
import { useToast } from "../components/ui/Toast";
import { useAppointmentComposer } from "../context/AppointmentComposerContext";
import { useAuth } from "../context/AuthContext";
import { useHomeData } from "../context/HomeDashboardContext";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { useNow } from "../hooks/useNow";
import {
    cancelAppointmentByAdmin,
    cancelAppointmentByBarber,
    completeAppointment,
    getBarberWeekAppointments,
} from "../services/appointments";
import { getScheduleSlots } from "../services/schedules";
import { getServicesByBarber } from "../services/services";
import { addDays, getMonday, getWeekDays, isToday, parseWorkDays, toISODate } from "../utils/date";
import { formatMoney, getInitials } from "../utils/format";
import "./AgendaHome.css";

const VIEW_OPTIONS = [
    { value: "week", label: "Semana" },
    { value: "day", label: "Día" },
];

const EMPTY_WEEK = { hasSchedule: false, workDays: [], slots: [] };

const plural = (count, singular, pluralForm) => `${count} ${count === 1 ? singular : pluralForm}`;

const fetchWeekAppointments = async weekStartIso => {
    const first = await getBarberWeekAppointments(weekStartIso, 1, 100);
    let all = first.data;
    const totalPages = first.pagination?.totalPages || 1;
    for (let page = 2; page <= totalPages; page += 1) {
        const next = await getBarberWeekAppointments(weekStartIso, page, 100);
        all = all.concat(next.data);
    }
    return all.filter(a => a.status !== "cancelled");
};

const sumPrices = list => list.reduce((sum, a) => sum + Number(a.price || 0), 0);

const OccupancyRing = ({ value }) => {
    const safe = value ?? 0;
    return (
        <span className="agenda-ring" aria-hidden="true">
            <svg viewBox="0 0 36 36">
                <circle className="agenda-ring-track" cx="18" cy="18" r="15.9155" />
                <circle
                    className="agenda-ring-value"
                    cx="18"
                    cy="18"
                    r="15.9155"
                    strokeDasharray={`${safe} ${100 - safe}`}
                />
            </svg>
            <span className="agenda-ring-label">{value === null ? "—" : `${safe}%`}</span>
        </span>
    );
};

const BarberAgenda = () => {
    const { user, isAdmin } = useAuth();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const { data: home, reload: reloadHome } = useHomeData();
    const { openComposer, version } = useAppointmentComposer();
    const isCompact = useMediaQuery("(max-width: 1023px)");
    const now = useNow(30000);

    const [weekStart, setWeekStart] = useState(() => getMonday(new Date()));
    const [view, setView] = useState("week");
    const [selectedDayIso, setSelectedDayIso] = useState(() => toISODate(new Date()));
    const [week, setWeek] = useState(EMPTY_WEEK);
    const [appointments, setAppointments] = useState([]);
    const [durationsByService, setDurationsByService] = useState(() => new Map());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [historyClientId, setHistoryClientId] = useState(null);

    const weekStartIso = toISODate(weekStart);
    const weekDays = useMemo(() => getWeekDays(weekStart), [weekStart]);
    const effectiveView = isCompact ? "day" : view;
    const requestIdRef = useRef(0);

    useEffect(() => {
        getServicesByBarber(user.id)
            .then(list => {
                const services = Array.isArray(list) ? list : [];
                setDurationsByService(new Map(services.map(s => [s.id, Number(s.duration_minutes)])));
            })
            .catch(() => {});
    }, [user.id]);

    // Descarta respuestas de semanas viejas si el usuario navegó mientras cargaban.
    const loadWeek = useCallback(async () => {
        const requestId = ++requestIdRef.current;
        setLoading(true);
        setError("");
        try {
            const slotsData = await getScheduleSlots(user.id, weekStartIso);
            if (requestId !== requestIdRef.current) return;
            if (!slotsData.has_schedule) {
                setWeek(EMPTY_WEEK);
                setAppointments([]);
                return;
            }
            const list = await fetchWeekAppointments(weekStartIso);
            if (requestId !== requestIdRef.current) return;
            setWeek({ hasSchedule: true, workDays: parseWorkDays(slotsData.work_days), slots: slotsData.slots });
            setAppointments(list);
        } catch {
            if (requestId === requestIdRef.current) {
                setError("No se pudo cargar la agenda. Revisá la conexión e intentá de nuevo.");
            }
        } finally {
            if (requestId === requestIdRef.current) setLoading(false);
        }
    }, [user.id, weekStartIso]);

    useEffect(() => {
        loadWeek();
    }, [loadWeek, version]);

    const goToWeek = date => {
        const monday = getMonday(date);
        const todayIso = toISODate(new Date());
        const days = getWeekDays(monday);
        setWeekStart(monday);
        setSelectedDayIso(days.some(d => d.iso === todayIso) ? todayIso : days[0].iso);
    };

    const slotDuration = deriveSlotDuration(week.slots);
    const todayIso = toISODate(now);
    const nextAppointmentId = useMemo(
        () => findNextAppointmentId(appointments, now, durationsByService, slotDuration),
        [appointments, now, durationsByService, slotDuration],
    );

    const selectedDay = weekDays.find(d => d.iso === selectedDayIso) || weekDays[0];
    const dayAppointments = appointments
        .filter(a => a.date.slice(0, 10) === selectedDay.iso)
        .sort((a, b) => a.time.localeCompare(b.time));
    const dayIsOpen = week.workDays.includes(selectedDay.dayName);
    const dayFree = dayIsOpen
        ? week.slots.filter(
              slot => !isPastSlot(selectedDay.iso, slot, now) && !dayAppointments.some(a => a.time.slice(0, 5) === slot),
          ).length
        : 0;

    const openDays = weekDays.filter(d => week.workDays.includes(d.dayName)).length;
    const capacity = week.slots.length * openDays;
    const occupancy = capacity ? Math.min(100, Math.round((appointments.length / capacity) * 100)) : null;
    const weekHasToday = weekDays.some(d => d.iso === todayIso);
    const todayList = appointments.filter(a => a.date.slice(0, 10) === todayIso);
    const completedWeek = appointments.filter(a => a.status === "completed");

    const status = !home
        ? null
        : !home.hasScheduleThisWeek
          ? { tone: "muted", label: "Sin agenda esta semana" }
          : home.isTodayWorkDay
            ? {
                  tone: "live",
                  label: home.nextClient ? `Hoy atendés · próximo ${home.nextClient.time.slice(0, 5)}` : "Hoy atendés",
              }
            : { tone: "muted", label: "Hoy no atendés" };

    const handleComplete = async (appointmentId, paymentMethod) => {
        setActionLoading(true);
        try {
            await completeAppointment(appointmentId, paymentMethod);
            setAppointments(prev =>
                prev.map(a => (a.id === appointmentId ? { ...a, status: "completed", payment_method: paymentMethod } : a)),
            );
            setSelectedAppointment(null);
            showToast(`Cobro registrado en ${paymentMethod === "cash" ? "efectivo" : "transferencia"}.`);
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

    const handleReschedule = appointment => {
        setSelectedAppointment(null);
        openComposer({ mode: "reschedule", appointment });
    };

    const openFreeSlot = (dateIso, time) =>
        openComposer({ initialBarberId: user.id, initialDate: dateIso, initialTime: time });

    const selectDayFromBoard = iso => {
        setSelectedDayIso(iso);
        setView("day");
    };

    const renderBody = () => {
        if (error) {
            return (
                <div className="agenda-state">
                    <InlineFeedback tone="error">{error}</InlineFeedback>
                    <Button variant="secondary" icon="refresh" onClick={loadWeek}>
                        Reintentar
                    </Button>
                </div>
            );
        }

        if (loading) {
            return (
                <div className="agenda-skeleton" aria-busy="true" aria-label="Cargando agenda">
                    <Skeleton height="64px" />
                    <Skeleton height="360px" />
                </div>
            );
        }

        if (!week.hasSchedule) {
            return (
                <div className="agenda-empty">
                    <Icon name="event_busy" size={40} />
                    <h2 className="agenda-empty-title">Sin agenda esta semana</h2>
                    <p className="agenda-empty-text">
                        No abriste horarios para la semana del {formatRange(weekStart, addDays(weekStart, 6))}. Configurá
                        días y horario para empezar a recibir turnos.
                    </p>
                    <Button variant="primary" icon="edit_calendar" onClick={() => navigate("/schedule")}>
                        Abrir agenda
                    </Button>
                </div>
            );
        }

        if (effectiveView === "week") {
            return (
                <WeekBoard
                    days={weekDays}
                    workDays={week.workDays}
                    slots={week.slots}
                    slotDuration={slotDuration}
                    appointments={appointments}
                    durationsByService={durationsByService}
                    nextAppointmentId={nextAppointmentId}
                    now={now}
                    onSelectAppointment={setSelectedAppointment}
                    onSelectFreeSlot={openFreeSlot}
                    onSelectDay={selectDayFromBoard}
                />
            );
        }

        const dayLabel = selectedDay.date.toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" });

        return (
            <div className="agenda-day">
                <div className="agenda-day-strip">
                    {weekDays.map(day => {
                        const count = appointments.filter(a => a.date.slice(0, 10) === day.iso).length;
                        const open = week.workDays.includes(day.dayName);
                        const selected = day.iso === selectedDay.iso;
                        return (
                            <button
                                key={day.iso}
                                type="button"
                                className={`agenda-day-chip ${selected ? "is-selected" : ""} ${open ? "" : "is-closed"} ${isToday(day.date) ? "is-today" : ""}`}
                                aria-pressed={selected}
                                aria-label={`${day.date.toLocaleDateString("es-AR", { weekday: "long", day: "numeric" })}, ${plural(count, "turno", "turnos")}`}
                                onClick={() => setSelectedDayIso(day.iso)}
                            >
                                <span className="agenda-day-chip-name">{day.label}</span>
                                <span className="agenda-day-chip-number">{day.dayNumber}</span>
                                <span className="agenda-day-chip-dots" aria-hidden="true">
                                    {Array.from({ length: Math.min(count, 3) }).map((_, i) => (
                                        <span key={i} />
                                    ))}
                                </span>
                            </button>
                        );
                    })}
                </div>

                <div className="agenda-day-head">
                    <div className="agenda-day-heading">
                        <span className="agenda-day-eyebrow">
                            {isToday(selectedDay.date) ? "Hoy" : dayIsOpen ? "Día de atención" : "Sin atención"}
                        </span>
                        <h2 className="agenda-day-title">{dayLabel}</h2>
                        <p className="agenda-day-summary">
                            <strong>{plural(dayAppointments.length, "turno agendado", "turnos agendados")}</strong>
                            {dayIsOpen && <span className="is-free">{plural(dayFree, "libre", "libres")}</span>}
                            <span className="is-money">{formatMoney(sumPrices(dayAppointments))} est.</span>
                        </p>
                    </div>
                    {dayIsOpen && (
                        <Button
                            variant="primary"
                            icon="add"
                            onClick={() => openComposer({ initialBarberId: user.id, initialDate: selectedDay.iso })}
                        >
                            Turno
                        </Button>
                    )}
                </div>

                <DayTimeline
                    key={selectedDay.iso}
                    day={selectedDay}
                    isWorkDay={dayIsOpen}
                    slots={week.slots}
                    slotDuration={slotDuration}
                    appointments={dayAppointments}
                    durationsByService={durationsByService}
                    nextAppointmentId={nextAppointmentId}
                    now={now}
                    onSelectAppointment={setSelectedAppointment}
                    onSelectFreeSlot={openFreeSlot}
                />
            </div>
        );
    };

    return (
        <div className="agenda">
            <section className="agenda-control">
                <div className="agenda-control-top">
                    <div className="agenda-heading">
                        <span className="agenda-eyebrow">
                            <span className="agenda-eyebrow-dot" aria-hidden="true" />
                            Tu agenda · Semana {isoWeekNumber(weekStart)}
                        </span>
                        <h1 className="agenda-title">
                            Agenda{" "}
                            <span className="agenda-title-sep" aria-hidden="true">
                                //
                            </span>{" "}
                            {effectiveView === "week" ? "Semanal" : "Diaria"}
                        </h1>
                    </div>

                    <div className="agenda-barber">
                        <span className="agenda-barber-avatar" aria-hidden="true">
                            {getInitials(user.first_name, user.last_name)}
                        </span>
                        <span className="agenda-barber-text">
                            <span className="agenda-barber-name">
                                {user.first_name} {user.last_name}
                            </span>
                            {status && (
                                <span className={`agenda-barber-status is-${status.tone}`}>
                                    <span className="agenda-barber-dot" aria-hidden="true" />
                                    {status.label}
                                </span>
                            )}
                        </span>
                    </div>
                </div>

                <div className="agenda-control-bar">
                    <div className="agenda-week-nav">
                        <div className="agenda-week-stepper">
                            <button
                                type="button"
                                className="agenda-week-step"
                                aria-label="Semana anterior"
                                onClick={() => goToWeek(addDays(weekStart, -7))}
                            >
                                <Icon name="chevron_left" size={20} />
                            </button>
                            <span className="agenda-week-range" aria-live="polite">
                                <Icon name="calendar_today" size={18} />
                                {formatRange(weekStart, addDays(weekStart, 6))}
                            </span>
                            <button
                                type="button"
                                className="agenda-week-step"
                                aria-label="Semana siguiente"
                                onClick={() => goToWeek(addDays(weekStart, 7))}
                            >
                                <Icon name="chevron_right" size={20} />
                            </button>
                        </div>
                        <button type="button" className="agenda-today" onClick={() => goToWeek(new Date())}>
                            Hoy
                        </button>
                    </div>

                    <div className="agenda-control-actions">
                        {!isCompact && (
                            <SegmentedControl
                                label="Vista de la agenda"
                                value={view}
                                onChange={setView}
                                options={VIEW_OPTIONS}
                            />
                        )}
                        <Button variant="secondary" icon="edit_calendar" onClick={() => navigate("/schedule")}>
                            Editar horarios
                        </Button>
                    </div>
                </div>
            </section>

            {renderBody()}

            {!loading && !error && week.hasSchedule && (
                <footer className="agenda-footer">
                    <div className="agenda-metrics">
                        <div className="agenda-metric">
                            <span className="agenda-metric-icon">
                                <Icon name="content_cut" size={22} />
                            </span>
                            <span className="agenda-metric-text">
                                <span className="agenda-metric-title">
                                    {plural(appointments.length, "turno", "turnos")} en la semana
                                </span>
                                <span className="agenda-metric-sub">
                                    {weekHasToday
                                        ? `${todayList.length} hoy (${plural(todayList.filter(a => a.status === "completed").length, "completado", "completados")})`
                                        : plural(completedWeek.length, "completado", "completados")}
                                </span>
                            </span>
                        </div>

                        <div className="agenda-metric">
                            <OccupancyRing value={occupancy} />
                            <span className="agenda-metric-text">
                                <span className="agenda-metric-title">
                                    {occupancy === null ? "—" : `${occupancy}%`} ocupación
                                </span>
                                <span className="agenda-metric-sub">
                                    {appointments.length} de {capacity} horarios
                                </span>
                            </span>
                        </div>

                        <div className="agenda-metric">
                            <span className="agenda-metric-icon">
                                <Icon name="payments" size={22} />
                            </span>
                            <span className="agenda-metric-text">
                                <span className="agenda-metric-title is-money">
                                    {formatMoney(sumPrices(appointments))}
                                    <span className="agenda-metric-unit">ARS</span>
                                </span>
                                <span className="agenda-metric-sub">Facturación proyectada</span>
                            </span>
                        </div>

                        <div className="agenda-metric">
                            <span className="agenda-metric-icon">
                                <Icon name="point_of_sale" size={22} />
                            </span>
                            <span className="agenda-metric-text">
                                <span className="agenda-metric-title">{formatMoney(sumPrices(completedWeek))}</span>
                                <span className="agenda-metric-sub">
                                    Cobrado semana
                                    {home?.kind === "agenda" ? ` · mes ${formatMoney(home.revenueThisMonth)}` : ""}
                                </span>
                            </span>
                        </div>
                    </div>

                    <div className="agenda-footer-actions">
                        <Button variant="secondary" icon="print" onClick={() => window.print()}>
                            Imprimir planilla
                        </Button>
                    </div>
                </footer>
            )}

            <AppointmentDetailModal
                appointment={selectedAppointment}
                durationMinutes={
                    selectedAppointment
                        ? appointmentDuration(selectedAppointment, durationsByService, slotDuration)
                        : slotDuration
                }
                barberName={`${user.first_name} ${user.last_name}`.trim()}
                onClose={() => setSelectedAppointment(null)}
                onComplete={handleComplete}
                onCancel={handleCancel}
                onReschedule={handleReschedule}
                onViewClient={id => setHistoryClientId(id)}
                actionLoading={actionLoading}
            />

            <ClientHistoryModal clientId={historyClientId} onClose={() => setHistoryClientId(null)} />
        </div>
    );
};

const BusinessOverview = () => {
    const { user } = useAuth();
    const { loading, data: home } = useHomeData();
    const ready = !loading && home?.kind === "business";

    return (
        <div>
            <PageHeader
                eyebrow="Panel de negocio"
                title={`Hola, ${user?.first_name || "equipo"}`}
                description="Un vistazo al negocio de hoy."
            />

            {!ready ? (
                <div className="agenda-overview-skeleton">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} height="112px" />
                    ))}
                </div>
            ) : (
                <>
                    <section className="agenda-overview-section">
                        <h2 className="agenda-overview-title">Hoy</h2>
                        <div className="agenda-stats-grid">
                            <StatCard
                                icon={<Icon name="payments" />}
                                label="Ingresos de hoy"
                                value={home.revenueToday !== null ? formatMoney(home.revenueToday) : "—"}
                                highlight
                            />
                            <StatCard
                                icon={<Icon name="task_alt" />}
                                label="Turnos completados hoy"
                                value={home.appointmentsToday ?? "—"}
                            />
                            <StatCard
                                icon={<Icon name="groups" />}
                                label="Barberos activos hoy"
                                value={home.activeBarbersToday ?? "—"}
                                sub={`de ${home.totalBarbers} en el equipo`}
                            />
                            <StatCard
                                icon={<Icon name="military_tech" />}
                                label="Mejor barbero de hoy"
                                value={home.bestBarberToday ? home.bestBarberToday.name : "—"}
                                sub={
                                    home.bestBarberToday
                                        ? formatMoney(home.bestBarberToday.total_revenue)
                                        : "Sin turnos completados"
                                }
                            />
                        </div>
                    </section>

                    <section className="agenda-overview-section">
                        <h2 className="agenda-overview-title">Esta semana</h2>
                        <div className="agenda-stats-grid">
                            <StatCard
                                icon={<Icon name="payments" />}
                                label="Ingresos de la semana"
                                value={home.revenueThisWeek !== null ? formatMoney(home.revenueThisWeek) : "—"}
                            />
                            <StatCard
                                icon={<Icon name="date_range" />}
                                label="Turnos esta semana"
                                value={home.appointmentsThisWeek ?? "—"}
                            />
                            <StatCard
                                icon={<Icon name="person_add" />}
                                label="Clientes nuevos"
                                value={home.newClientsThisWeek}
                            />
                        </div>
                    </section>

                    <section className="agenda-overview-section">
                        <h2 className="agenda-overview-title">Este mes</h2>
                        <div className="agenda-stats-grid">
                            <StatCard
                                icon={<Icon name="payments" />}
                                label="Ingresos del mes"
                                value={home.revenueThisMonth !== null ? formatMoney(home.revenueThisMonth) : "—"}
                            />
                            <StatCard
                                icon={<Icon name="calendar_month" />}
                                label="Turnos del mes"
                                value={home.appointmentsThisMonth ?? "—"}
                            />
                            <StatCard
                                icon={<Icon name="group" />}
                                label="Clientes totales"
                                value={home.totalClients ?? "—"}
                            />
                        </div>
                    </section>
                </>
            )}
        </div>
    );
};

const AgendaHome = () => {
    const { user } = useAuth();
    const hasOwnAgenda = user?.role === "barber" || user?.role === "admin_barber";
    return hasOwnAgenda ? <BarberAgenda /> : <BusinessOverview />;
};

export default AgendaHome;
