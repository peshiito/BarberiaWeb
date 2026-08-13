import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getAllUsers } from "../../services/admin";
import {
    createAppointmentByAdmin,
    createAppointmentByBarber,
    getBarberWeekAppointments,
    getBarberWeekAppointmentsForAdmin,
    updateAppointmentByAdmin,
} from "../../services/appointments";
import { searchClients } from "../../services/clients";
import { getScheduleSlots } from "../../services/schedules";
import { DAY_NAMES, getMonday, parseDateOnly, parseWorkDays, toISODate } from "../../utils/date";
import { getAvailableSlots } from "../../utils/slots";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import FormField from "../ui/FormField";
import InlineFeedback from "../ui/InlineFeedback";
import Modal from "../ui/Modal";
import { useToast } from "../ui/Toast";
import "./AppointmentFormModal.css";

const AppointmentFormModal = ({
    open,
    mode = "create",
    appointment = null,
    initialClient = null,
    initialBarberId = null,
    initialDate = null,
    initialTime = null,
    onClose,
    onSaved,
}) => {
    const { user, isAdmin } = useAuth();
    const { showToast } = useToast();
    const isReschedule = mode === "reschedule";

    const [barbers, setBarbers] = useState([]);
    const [barberId, setBarberId] = useState(null);
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");

    const [selectedClient, setSelectedClient] = useState(null);
    const [clientQuery, setClientQuery] = useState("");
    const [clientResults, setClientResults] = useState([]);
    const [searchingClients, setSearchingClients] = useState(false);

    const [slotsLoading, setSlotsLoading] = useState(false);
    const [availableSlots, setAvailableSlots] = useState([]);
    const [slotsError, setSlotsError] = useState("");

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!open) return;
        setError("");
        setBarberId(isReschedule ? appointment.barber_id : initialBarberId || (isAdmin ? null : user.id));
        setDate(isReschedule ? appointment.date.slice(0, 10) : initialDate || toISODate(new Date()));
        setTime(isReschedule ? appointment.time.slice(0, 5) : initialTime || "");
        setSelectedClient(
            isReschedule
                ? { id: appointment.client_id, first_name: appointment.client_first_name, last_name: appointment.client_last_name }
                : initialClient,
        );
        setClientQuery("");
        setClientResults([]);
    }, [open, mode, appointment, initialClient, initialBarberId, initialDate, initialTime, isAdmin, user]);

    useEffect(() => {
        if (!open || !isAdmin) return;
        getAllUsers(1, 50)
            .then(res => setBarbers(res.data.filter(u => u.role === "barber" || u.role === "admin_barber")))
            .catch(() => setBarbers([]));
    }, [open, isAdmin]);

    useEffect(() => {
        if (!open || isReschedule) return;
        if (!clientQuery.trim()) {
            setClientResults([]);
            return undefined;
        }
        setSearchingClients(true);
        const timeout = setTimeout(() => {
            searchClients(clientQuery.trim(), 1, 6)
                .then(res => setClientResults(res.data))
                .catch(() => setClientResults([]))
                .finally(() => setSearchingClients(false));
        }, 300);
        return () => clearTimeout(timeout);
    }, [clientQuery, open, isReschedule]);

    useEffect(() => {
        if (!open || !barberId || !date) {
            setAvailableSlots([]);
            return undefined;
        }
        let cancelled = false;

        const load = async () => {
            setSlotsLoading(true);
            setSlotsError("");
            setAvailableSlots([]);
            try {
                const weekStartIso = toISODate(getMonday(parseDateOnly(date)));
                const isOwnAgenda = barberId === user.id;
                const [slotsData, weekAppointments] = await Promise.all([
                    getScheduleSlots(barberId, weekStartIso),
                    isOwnAgenda
                        ? getBarberWeekAppointments(weekStartIso, 1, 100).then(r => r.data)
                        : getBarberWeekAppointmentsForAdmin(barberId, weekStartIso, 1, 100).then(r => r.data),
                ]);
                if (cancelled) return;

                if (!slotsData.has_schedule) {
                    setSlotsError("Ese barbero no abrió agenda para esa semana.");
                    return;
                }

                const workDays = parseWorkDays(slotsData.work_days);
                const dayName = DAY_NAMES[parseDateOnly(date).getDay()];
                if (!workDays.includes(dayName)) {
                    setSlotsError("Ese barbero no trabaja ese día.");
                    return;
                }

                const relevantAppointments = weekAppointments.filter(a => !(isReschedule && a.id === appointment.id));
                setAvailableSlots(getAvailableSlots(slotsData.slots, relevantAppointments, date));
            } catch (err) {
                if (!cancelled) {
                    setSlotsError(
                        err.response?.status === 404
                            ? "No se encontró el barbero seleccionado."
                            : "No se pudieron cargar los horarios disponibles.",
                    );
                }
            } finally {
                if (!cancelled) setSlotsLoading(false);
            }
        };

        load();
        return () => {
            cancelled = true;
        };
    }, [open, barberId, date, user.id, isReschedule, appointment]);

    const handleSubmit = async e => {
        e.preventDefault();
        setError("");

        if (!time) {
            setError("Elegí un horario disponible.");
            return;
        }

        setSaving(true);
        try {
            if (isReschedule) {
                await updateAppointmentByAdmin(appointment.id, { barber_id: barberId, date, time });
                showToast("Turno reprogramado correctamente.");
            } else if (isAdmin) {
                await createAppointmentByAdmin({ client_id: selectedClient.id, barber_id: barberId, date, time });
                showToast("Turno creado correctamente.");
            } else {
                await createAppointmentByBarber({ client_id: selectedClient.id, date, time });
                showToast("Turno creado correctamente.");
            }
            onSaved();
        } catch (err) {
            setError(err.response?.data?.error || "No se pudo guardar el turno.");
        } finally {
            setSaving(false);
        }
    };

    const canSubmit = barberId && date && time && selectedClient && !saving;

    return (
        <Modal open={open} onClose={onClose} title={isReschedule ? "Reprogramar turno" : "Nuevo turno"}>
            <form className="appt-form" onSubmit={handleSubmit}>
                {isReschedule ? (
                    <FormField label="Cliente">
                        <p className="appt-form-static-value">
                            {selectedClient?.first_name} {selectedClient?.last_name}
                        </p>
                    </FormField>
                ) : (
                    <FormField
                        label="Cliente"
                        htmlFor="appt-client-search"
                        hint={selectedClient ? undefined : "Buscá por nombre, apellido o teléfono"}
                    >
                        {selectedClient ? (
                            <div className="appt-form-selected-client">
                                <span>
                                    {selectedClient.first_name} {selectedClient.last_name}
                                </span>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        setSelectedClient(null);
                                        setClientQuery("");
                                    }}
                                >
                                    Cambiar
                                </Button>
                            </div>
                        ) : (
                            <>
                                <input
                                    id="appt-client-search"
                                    type="search"
                                    value={clientQuery}
                                    onChange={e => setClientQuery(e.target.value)}
                                    placeholder="Ej: Carlos Gomez"
                                />
                                {searchingClients && <p className="appt-form-search-status">Buscando…</p>}
                                {!searchingClients && clientResults.length > 0 && (
                                    <ul className="appt-form-client-results">
                                        {clientResults.map(c => (
                                            <li key={c.id}>
                                                <button type="button" onClick={() => setSelectedClient(c)}>
                                                    <span>
                                                        {c.first_name} {c.last_name}
                                                    </span>
                                                    <span className="appt-form-client-phone">{c.phone}</span>
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </>
                        )}
                    </FormField>
                )}

                {isAdmin ? (
                    <FormField label="Barbero">
                        <select value={barberId || ""} onChange={e => setBarberId(Number(e.target.value))}>
                            <option value="" disabled>
                                Elegí un barbero
                            </option>
                            {barbers.map(b => (
                                <option key={b.id} value={b.id}>
                                    {b.first_name} {b.last_name}
                                </option>
                            ))}
                        </select>
                    </FormField>
                ) : (
                    <FormField label="Barbero">
                        <p className="appt-form-static-value">
                            {user.first_name} {user.last_name} (vos)
                        </p>
                    </FormField>
                )}

                <FormField label="Fecha">
                    <input
                        type="date"
                        value={date}
                        min={toISODate(new Date())}
                        onChange={e => {
                            setDate(e.target.value);
                            setTime("");
                        }}
                        required
                    />
                </FormField>

                <FormField label="Horario">
                    {!barberId ? (
                        <p className="appt-form-search-status">Elegí un barbero para ver sus horarios disponibles.</p>
                    ) : slotsLoading ? (
                        <p className="appt-form-search-status">Consultando horarios disponibles…</p>
                    ) : slotsError ? (
                        <InlineFeedback tone="error">{slotsError}</InlineFeedback>
                    ) : availableSlots.length === 0 ? (
                        <p className="appt-form-search-status">No hay horarios libres ese día.</p>
                    ) : (
                        <div className="appt-form-slots">
                            {availableSlots.map(slot => (
                                <button
                                    key={slot}
                                    type="button"
                                    className={`appt-form-slot ${slot === time ? "is-selected" : ""}`}
                                    onClick={() => setTime(slot)}
                                    aria-pressed={slot === time}
                                >
                                    {slot}
                                </button>
                            ))}
                        </div>
                    )}
                    {time && !slotsLoading && !slotsError && <Badge tone="brass">{time} seleccionado</Badge>}
                </FormField>

                {error && <InlineFeedback tone="error">{error}</InlineFeedback>}

                <Button type="submit" loading={saving} disabled={!canSubmit} className="appt-form-submit">
                    {isReschedule ? "Guardar reprogramación" : "Crear turno"}
                </Button>
            </form>
        </Modal>
    );
};

export default AppointmentFormModal;
