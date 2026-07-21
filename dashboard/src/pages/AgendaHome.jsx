import { useCallback, useEffect, useState } from "react";
import WeekGrid from "../components/schedule/WeekGrid";
import WeekNavigator from "../components/schedule/WeekNavigator";
import PageHeader from "../components/ui/PageHeader";
import { useAuth } from "../context/AuthContext";
import { completeAppointment, getBarberWeekAppointments } from "../services/appointments";
import { getScheduleSlots } from "../services/schedules";
import { addDays, getMonday, getWeekDays, toISODate } from "../utils/date";
import { registerOrLoginClient, isClientAuthenticated, getStoredClient } from "../services/client";

const AgendaHome = () => {
    const { user } = useAuth();
    const [client, setClient] = useState(null);
    const [weekStart, setWeekStart] = useState(() => getMonday(new Date()));
    const [schedule, setSchedule] = useState(null);
    const [slots, setSlots] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [completingId, setCompletingId] = useState(null);
    const [showClientLogin, setShowClientLogin] = useState(false);
    const [clientForm, setClientForm] = useState({ first_name: "", last_name: "", phone: "" });

    const weekStartIso = toISODate(weekStart);
    const weekDays = getWeekDays(weekStart);

    useEffect(() => {
        const storedClient = getStoredClient();
        if (storedClient) {
            setClient(storedClient);
        } else if (!user) {
            setShowClientLogin(true);
        }
    }, [user]);

    const loadWeek = useCallback(async () => {
        if (!client) {
            setError("Cliente no autenticado");
            setLoading(false);
            return;
        }

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
    }, [client, user?.id, weekStartIso]);

    useEffect(() => {
        if (client) {
            loadWeek();
        }
    }, [loadWeek, client]);

    const handlePrevWeek = () => setWeekStart(prev => addDays(prev, -7));
    const handleNextWeek = () => setWeekStart(prev => addDays(prev, 7));
    const handleToday = () => setWeekStart(getMonday(new Date()));

    const handleClientLogin = async e => {
        e.preventDefault();
        try {
            const loggedClient = await registerOrLoginClient(clientForm);
            setClient(loggedClient);
            setShowClientLogin(false);
            setClientForm({ first_name: "", last_name: "", phone: "" });
        } catch (err) {
            setError("No se pudo iniciar sesión como cliente. Intentá nuevamente.");
        }
    };

    const handleComplete = async appointmentId => {
        if (!client) return;

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

    const handleClientLogout = () => {
        localStorage.removeItem("barberia_client_token");
        localStorage.removeItem("barberia_client");
        setClient(null);
        setAppointments([]);
        setSchedule(null);
        setSlots([]);
        setShowClientLogin(true);
    };

    return (
        <div>
            <PageHeader
                eyebrow="Agenda"
                title={`Hola, ${user?.first_name || "Barbero"}`}
                description={client ? "Tu libro de turnos de la semana." : "Iniciá sesión como cliente para ver tu agenda."}
                action={
                    <WeekNavigator
                        weekStart={weekStart}
                        onPrev={handlePrevWeek}
                        onNext={handleNextWeek}
                        onToday={handleToday}
                    />
                }
            />

            {showClientLogin && !client && (
                <div className="client-login-modal">
                    <div className="client-login-content">
                        <h3>Iniciar sesión como Cliente</h3>
                        <p>Ingresá tus datos para ver tu agenda personal</p>
                        <form onSubmit={handleClientLogin}>
                            <div className="form-group">
                                <label>Nombre</label>
                                <input
                                    type="text"
                                    value={clientForm.first_name}
                                    onChange={e => setClientForm(prev => ({ ...prev, first_name: e.target.value }))}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Apellido</label>
                                <input
                                    type="text"
                                    value={clientForm.last_name}
                                    onChange={e => setClientForm(prev => ({ ...prev, last_name: e.target.value }))}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Teléfono</label>
                                <input
                                    type="tel"
                                    value={clientForm.phone}
                                    onChange={e => setClientForm(prev => ({ ...prev, phone: e.target.value }))}
                                    required
                                />
                            </div>
                            <button type="submit">Iniciar sesión</button>
                            {error && <p className="error">{error}</p>}
                        </form>
                        <div className="client-login-footer">
                            <button
                                className="client-logout-btn"
                                onClick={handleClientLogout}
                                style={{ marginTop: "var(--space-4)" }}
                            >
                                Cerrar sesión como barbero
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {error && !showClientLogin && <p className="error-message">{error}</p>}

            {loading ? (
                <div className="loading-state">
                    <p>Cargando agenda...</p>
                </div>
            ) : client && schedule ? (
                <WeekGrid
                    weekDays={weekDays}
                    schedule={schedule}
                    slots={slots}
                    appointments={appointments}
                    onComplete={handleComplete}
                    completingId={completingId}
                />
            ) : client && !loading ? (
                <div className="no-schedule-message">
                    <p>No tenés agenda asignada para esta semana.</p>
                    <p>Por favor contactá con tu barbero para configurar tus horarios.</p>
                </div>
            ) : null}
        </div>
    );
};

export default AgendaHome;
