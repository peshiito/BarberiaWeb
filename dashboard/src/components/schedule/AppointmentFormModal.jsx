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
import { createClient, searchClients } from "../../services/clients";
import { getScheduleSlots } from "../../services/schedules";
import { getServicesByBarber } from "../../services/services";
import { DAY_NAMES, getMonday, parseDateOnly, parseWorkDays, toISODate } from "../../utils/date";
import { formatMoney, formatPhone, getInitials, minutesToTime, timeToMinutes } from "../../utils/format";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import FormField from "../ui/FormField";
import Icon from "../ui/Icon";
import InlineFeedback from "../ui/InlineFeedback";
import Modal from "../ui/Modal";
import Select from "../ui/Select";
import { useToast } from "../ui/Toast";
import DateCalendar from "./DateCalendar";
import { deriveSlotDuration, isPastSlot } from "./agendaUtils";
import "./AppointmentFormModal.css";

const PHONE_REGEX = /^[0-9+\-\s]{8,30}$/;
const NOTE_MAX = 300;
const FREQUENT_VISITS = 3;

const plural = (count, singular, pluralForm) => `${count} ${count === 1 ? singular : pluralForm}`;

// Prellena el alta rápida con lo que se buscó: si parece un teléfono va a
// ese campo, si no, al nombre.
const draftFromQuery = query => {
    const q = query.trim();
    return /^[0-9+\-\s]+$/.test(q) ? { name: "", phone: q } : { name: q, phone: "" };
};

const lastVisitLabel = client => {
    if (!client.last_visit) return "Sin visitas registradas";
    const date = parseDateOnly(client.last_visit);
    const days = Math.round((parseDateOnly(toISODate(new Date())) - date) / 86400000);
    const when = days === 0 ? "hoy" : days === 1 ? "ayer" : `hace ${days} días`;
    return `Última visita: ${date.toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" })} (${when})`;
};

const ClientCard = ({ client, action }) => (
    <div className="appt-client-card">
        <span className="appt-avatar" aria-hidden="true">
            {getInitials(client.first_name, client.last_name)}
        </span>
        <span className="appt-client-card-text">
            <span className="appt-client-name">
                {client.first_name} {client.last_name}
            </span>
            {client.phone && <span className="appt-client-meta">{formatPhone(client.phone)}</span>}
        </span>
        {action}
    </div>
);

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
    const [note, setNote] = useState("");

    const [services, setServices] = useState([]);
    const [servicesLoading, setServicesLoading] = useState(false);
    const [serviceId, setServiceId] = useState(null);

    const [selectedClient, setSelectedClient] = useState(null);
    const [clientQuery, setClientQuery] = useState("");
    const [clientResults, setClientResults] = useState([]);
    const [clientTotal, setClientTotal] = useState(0);
    const [searchingClients, setSearchingClients] = useState(false);

    const [newClient, setNewClient] = useState(null);
    const [newClientError, setNewClientError] = useState("");
    const [savingClient, setSavingClient] = useState(false);

    const [slotsLoading, setSlotsLoading] = useState(false);
    const [daySlots, setDaySlots] = useState([]);
    const [takenSlots, setTakenSlots] = useState(() => new Set());
    const [slotsError, setSlotsError] = useState("");

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const todayIso = toISODate(new Date());

    useEffect(() => {
        if (!open) return;
        setError("");
        setBarberId(isReschedule ? appointment.barber_id : initialBarberId || (isAdmin ? null : user.id));
        setDate(isReschedule ? appointment.date.slice(0, 10) : initialDate || todayIso);
        setTime(isReschedule ? appointment.time.slice(0, 5) : initialTime || "");
        setSelectedClient(
            isReschedule
                ? {
                      id: appointment.client_id,
                      first_name: appointment.client_first_name,
                      last_name: appointment.client_last_name,
                      phone: appointment.client_phone,
                  }
                : initialClient,
        );
        setNote("");
        setClientQuery("");
        setClientResults([]);
        setNewClient(null);
        setNewClientError("");
        setServiceId(null);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, mode, appointment, initialClient, initialBarberId, initialDate, initialTime, isAdmin, user]);

    useEffect(() => {
        if (!open || !isAdmin) return;
        getAllUsers(1, 50)
            .then(res => setBarbers(res.data.filter(u => u.role === "barber" || u.role === "admin_barber")))
            .catch(() => setBarbers([]));
    }, [open, isAdmin]);

    // Cada barbero ofrece un subconjunto del catálogo. Al reprogramar el
    // servicio no cambia, pero se cargan igual para mostrar su duración.
    const servicesBarberId = isReschedule ? appointment?.barber_id : barberId;
    useEffect(() => {
        if (!open || !servicesBarberId) {
            setServices([]);
            return;
        }
        setServicesLoading(true);
        getServicesByBarber(servicesBarberId)
            .then(list => setServices(Array.isArray(list) ? list : []))
            .catch(() => setServices([]))
            .finally(() => setServicesLoading(false));
    }, [open, servicesBarberId]);

    useEffect(() => {
        if (serviceId && !services.some(s => s.id === serviceId)) setServiceId(null);
    }, [services, serviceId]);

    useEffect(() => {
        if (!open || isReschedule) return undefined;
        if (!clientQuery.trim()) {
            setClientResults([]);
            setClientTotal(0);
            setSearchingClients(false);
            return undefined;
        }
        setSearchingClients(true);
        const timeout = setTimeout(() => {
            searchClients(clientQuery.trim(), 1, 6)
                .then(res => {
                    setClientResults(res.data);
                    setClientTotal(res.pagination?.total ?? res.data.length);
                })
                .catch(() => setClientResults([]))
                .finally(() => setSearchingClients(false));
        }, 300);
        return () => clearTimeout(timeout);
    }, [clientQuery, open, isReschedule]);

    useEffect(() => {
        if (!open || !barberId || !date) {
            setDaySlots([]);
            return undefined;
        }
        let cancelled = false;

        const load = async () => {
            setSlotsLoading(true);
            setSlotsError("");
            setDaySlots([]);
            try {
                const weekStartIso = toISODate(getMonday(parseDateOnly(date)));
                const [slotsData, weekAppointments] = await Promise.all([
                    getScheduleSlots(barberId, weekStartIso),
                    barberId === user.id
                        ? getBarberWeekAppointments(weekStartIso, 1, 100).then(r => r.data)
                        : getBarberWeekAppointmentsForAdmin(barberId, weekStartIso, 1, 100).then(r => r.data),
                ]);
                if (cancelled) return;

                if (!slotsData.has_schedule) {
                    setSlotsError("Ese barbero no abrió agenda para esa semana.");
                    return;
                }
                if (!parseWorkDays(slotsData.work_days).includes(DAY_NAMES[parseDateOnly(date).getDay()])) {
                    setSlotsError("Ese barbero no atiende ese día.");
                    return;
                }

                const taken = new Set(
                    weekAppointments
                        .filter(a => !(isReschedule && a.id === appointment.id))
                        .filter(a => a.date.slice(0, 10) === date)
                        .map(a => a.time.slice(0, 5)),
                );
                const now = new Date();
                setDaySlots(slotsData.slots);
                setTakenSlots(taken);
                setTime(prev => (prev && !taken.has(prev) && !isPastSlot(date, prev, now) ? prev : ""));
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

    const openNewClientForm = () => {
        setNewClient(draftFromQuery(clientQuery));
        setNewClientError("");
    };

    const handleCreateClient = async () => {
        const [first_name = "", ...rest] = newClient.name.trim().split(/\s+/);
        const payload = { first_name, last_name: rest.join(" "), phone: newClient.phone.trim() };
        if (first_name.length < 2) {
            setNewClientError("Ingresá el nombre del cliente.");
            return;
        }
        if (!PHONE_REGEX.test(payload.phone)) {
            setNewClientError("Ingresá un teléfono válido (entre 8 y 30 dígitos).");
            return;
        }

        setSavingClient(true);
        setNewClientError("");
        try {
            const { client, created } = await createClient(payload);
            setSelectedClient(client);
            setNewClient(null);
            setClientQuery("");
            setClientResults([]);
            showToast(created ? "Cliente creado." : "Ya existía un cliente con ese teléfono: quedó seleccionado.");
        } catch (err) {
            setNewClientError(err.response?.data?.error || "No se pudo crear el cliente.");
        } finally {
            setSavingClient(false);
        }
    };

    const handleSubmit = async e => {
        e?.preventDefault();
        setError("");

        if (!time) {
            setError("Elegí un horario disponible.");
            return;
        }

        setSaving(true);
        try {
            const trimmedNote = note.trim() || undefined;
            if (isReschedule) {
                await updateAppointmentByAdmin(appointment.id, { barber_id: barberId, date, time });
                showToast("Turno reprogramado.");
            } else if (isAdmin) {
                await createAppointmentByAdmin({
                    client_id: selectedClient.id,
                    barber_id: barberId,
                    service_id: serviceId,
                    date,
                    time,
                    note: trimmedNote,
                });
                showToast("Turno creado.");
            } else {
                await createAppointmentByBarber({
                    client_id: selectedClient.id,
                    service_id: serviceId,
                    date,
                    time,
                    note: trimmedNote,
                });
                showToast("Turno creado.");
            }
            onSaved();
        } catch (err) {
            setError(err.response?.data?.error || "No se pudo guardar el turno.");
        } finally {
            setSaving(false);
        }
    };

    const trimmedQuery = clientQuery.trim();
    const canSubmit = barberId && date && time && selectedClient && (isReschedule || serviceId) && !saving;

    const service = isReschedule
        ? services.find(s => s.id === appointment?.service_id)
        : services.find(s => s.id === serviceId);
    const price = isReschedule ? appointment?.price : service?.price;
    const duration = service ? Number(service.duration_minutes) : null;
    const slotDuration = deriveSlotDuration(daySlots);
    const now = new Date();
    const freeSlots = daySlots.filter(s => !takenSlots.has(s) && !isPastSlot(date, s, now));

    const noServicesMessage = `${
        barberId === user.id ? "Todavía no tenés servicios asignados" : "Ese barbero no tiene servicios asignados"
    }, así que no se pueden crear turnos. ${
        isAdmin ? "Asignalos en Barberos → Editar." : "Pedile a un administrador que te los asigne en Barberos."
    }`;

    const barberOptions = barbers.map(b => ({
        value: b.id,
        label: `${b.first_name} ${b.last_name}`,
        description: b.id === user.id ? "Tu agenda" : b.role === "admin_barber" ? "Barbero admin" : "Barbero",
        leading: <span className="select-avatar">{getInitials(b.first_name, b.last_name)}</span>,
    }));

    const serviceOptions = services.map(s => ({
        value: s.id,
        label: s.name,
        trailing: `${formatMoney(s.price)} · ${s.duration_minutes} min`,
    }));

    const renderSlots = () => {
        if (!barberId) return <p className="appt-muted">Elegí un barbero para ver sus horarios.</p>;
        if (slotsLoading) {
            return (
                <div className="appt-slots" aria-busy="true" aria-label="Cargando horarios">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <span key={i} className="appt-slot is-skeleton" />
                    ))}
                </div>
            );
        }
        if (slotsError) return <InlineFeedback tone="error">{slotsError}</InlineFeedback>;
        if (daySlots.length === 0) return <p className="appt-muted">No hay horarios para ese día.</p>;

        return (
            <div className="appt-slots" role="group" aria-label="Horarios del día">
                {daySlots.map(slot => {
                    const taken = takenSlots.has(slot);
                    const past = isPastSlot(date, slot, now);
                    const selected = slot === time;
                    return (
                        <button
                            key={slot}
                            type="button"
                            className={`appt-slot ${selected ? "is-selected" : ""} ${taken ? "is-taken" : ""} ${
                                past && !taken ? "is-past" : ""
                            }`}
                            disabled={taken || past}
                            aria-pressed={selected}
                            aria-label={taken ? `${slot}, ocupado` : past ? `${slot}, ya pasó` : slot}
                            onClick={() => setTime(slot)}
                        >
                            {selected && <span className="appt-slot-dot" aria-hidden="true" />}
                            {slot}
                            {taken && <span className="appt-slot-taken" aria-hidden="true" />}
                        </button>
                    );
                })}
            </div>
        );
    };

    const renderClientSection = () => {
        if (isReschedule) return selectedClient && <ClientCard client={selectedClient} />;

        if (selectedClient) {
            return (
                <ClientCard
                    client={selectedClient}
                    action={
                        <Button
                            variant="ghost"
                            size="sm"
                            icon="swap_horiz"
                            onClick={() => {
                                setSelectedClient(null);
                                setClientQuery("");
                            }}
                        >
                            Cambiar
                        </Button>
                    }
                />
            );
        }

        return (
            <>
                <div className="appt-search">
                    <Icon name="search" size={20} className="appt-search-icon" />
                    <input
                        id="appt-client-search"
                        type="search"
                        autoComplete="off"
                        value={clientQuery}
                        onChange={e => setClientQuery(e.target.value)}
                        placeholder="Buscar por nombre, apellido o teléfono…"
                    />
                    {clientQuery && (
                        <button
                            type="button"
                            className="appt-search-clear"
                            aria-label="Limpiar búsqueda"
                            onClick={() => setClientQuery("")}
                        >
                            <Icon name="cancel" size={18} />
                        </button>
                    )}
                </div>

                <div className="appt-client-panel">
                    {trimmedQuery && (
                        <>
                            {searchingClients ? (
                                <p className="appt-client-status">Buscando…</p>
                            ) : (
                                <>
                                    {clientResults.length > 0 && (
                                        <ul className="appt-client-results">
                                            {clientResults.map(client => {
                                                const visits = Number(client.completed_visits || 0);
                                                return (
                                                    <li key={client.id}>
                                                        <button
                                                            type="button"
                                                            className="appt-client-option"
                                                            onClick={() => setSelectedClient(client)}
                                                        >
                                                            <span className="appt-avatar" aria-hidden="true">
                                                                {getInitials(client.first_name, client.last_name)}
                                                            </span>
                                                            <span className="appt-client-card-text">
                                                                <span className="appt-client-name">
                                                                    {client.first_name} {client.last_name}
                                                                    {visits >= FREQUENT_VISITS && (
                                                                        <span className="appt-tag">Frecuente</span>
                                                                    )}
                                                                </span>
                                                                <span className="appt-client-meta">
                                                                    {lastVisitLabel(client)}
                                                                </span>
                                                            </span>
                                                            <span className="appt-client-phone">
                                                                {formatPhone(client.phone)}
                                                            </span>
                                                            <Icon
                                                                name="check_circle"
                                                                size={22}
                                                                className="appt-client-check"
                                                            />
                                                        </button>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    )}
                                    <p className="appt-client-status">
                                        {clientResults.length === 0
                                            ? `No hay clientes que coincidan con “${trimmedQuery}”.`
                                            : clientTotal > clientResults.length
                                              ? `Mostrando ${clientResults.length} de ${clientTotal}. Afiná la búsqueda para ver el resto.`
                                              : `No hay más clientes que coincidan con “${trimmedQuery}”.`}
                                    </p>
                                </>
                            )}
                        </>
                    )}

                    <div
                        className="appt-new-client"
                        onKeyDown={e => {
                            // Enter acá crea el cliente, no envía el turno.
                            if (e.key === "Enter" && newClient) {
                                e.preventDefault();
                                handleCreateClient();
                            }
                        }}
                    >
                        <div className="appt-new-client-head">
                            <button
                                type="button"
                                className="appt-new-client-toggle"
                                aria-expanded={Boolean(newClient)}
                                onClick={() => (newClient ? setNewClient(null) : openNewClientForm())}
                            >
                                <Icon name="person_add" size={18} />
                                Registrar cliente nuevo
                            </button>
                            <span className="appt-new-client-hint">Solo nombre y teléfono</span>
                        </div>

                        {newClient && (
                            <div className="appt-new-client-body">
                                <div className="appt-grid-2">
                                    <FormField label="Nombre y apellido" htmlFor="appt-new-client-name">
                                        <input
                                            id="appt-new-client-name"
                                            type="text"
                                            autoComplete="off"
                                            placeholder="Ej: Juan Pérez"
                                            value={newClient.name}
                                            onChange={e => setNewClient(prev => ({ ...prev, name: e.target.value }))}
                                            maxLength={200}
                                            autoFocus
                                        />
                                    </FormField>
                                    <FormField label="Teléfono (WhatsApp)" htmlFor="appt-new-client-phone">
                                        <div className="field-affix">
                                            <span className="field-affix-prefix">+54 9</span>
                                            <input
                                                id="appt-new-client-phone"
                                                type="tel"
                                                inputMode="tel"
                                                autoComplete="off"
                                                className="is-mono"
                                                placeholder="11 4820 9182"
                                                value={newClient.phone}
                                                onChange={e => setNewClient(prev => ({ ...prev, phone: e.target.value }))}
                                                maxLength={30}
                                            />
                                        </div>
                                    </FormField>
                                </div>
                                {newClientError && <InlineFeedback tone="error">{newClientError}</InlineFeedback>}
                                <div className="appt-new-client-actions">
                                    <Button variant="ghost" size="sm" onClick={() => setNewClient(null)}>
                                        Cancelar
                                    </Button>
                                    <Button size="sm" icon="check" loading={savingClient} onClick={handleCreateClient}>
                                        Crear y seleccionar
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </>
        );
    };

    const selectedDateLabel = date
        ? parseDateOnly(date).toLocaleDateString("es-AR", { weekday: "short", day: "numeric", month: "short" })
        : "";

    const footer = (
        <div className="appt-footer">
            <div className="appt-summary">
                <div className="appt-summary-item">
                    <span className="appt-summary-label">Total a cobrar</span>
                    <span className="appt-summary-total">
                        {price != null ? formatMoney(price) : "—"}
                        <span className="appt-summary-unit">ARS</span>
                    </span>
                </div>
                <span className="appt-summary-divider" aria-hidden="true" />
                <div className="appt-summary-item">
                    <span className="appt-summary-label">Duración</span>
                    <span className="appt-summary-value">
                        <Icon name="schedule" size={16} />
                        {duration ? `${duration} min` : "—"}
                    </span>
                </div>
                <div className="appt-summary-item">
                    <span className="appt-summary-label">Fin estimado</span>
                    <span className="appt-summary-value is-muted">
                        {time && duration ? `${minutesToTime(timeToMinutes(time) + duration)} hs` : "—"}
                    </span>
                </div>
            </div>
            <div className="appt-footer-actions">
                <Button variant="ghost" onClick={onClose}>
                    Cancelar
                </Button>
                <Button icon="check" loading={saving} disabled={!canSubmit} onClick={handleSubmit}>
                    {isReschedule ? "Guardar cambios" : "Crear turno"}
                </Button>
            </div>
        </div>
    );

    return (
        <Modal
            open={open}
            onClose={onClose}
            size="xl"
            icon={isReschedule ? "edit_calendar" : "event_available"}
            title={isReschedule ? "Reprogramar turno" : "Nuevo turno"}
            badge={
                isReschedule ? (
                    <Badge tone="brass-soft">TRN-{appointment?.id}</Badge>
                ) : barberId ? (
                    <Badge tone="brass-soft">{barberId === user.id ? "Tu agenda" : "Agenda del equipo"}</Badge>
                ) : undefined
            }
            subtitle={
                isReschedule
                    ? "Cambiá barbero, día u horario. El servicio y el precio se mantienen."
                    : "Buscá o registrá al cliente, elegí servicio y horario."
            }
            footer={footer}
            className="appt-modal"
        >
            <form id="appt-form" className="appt-form" onSubmit={handleSubmit}>
                <section className="appt-section">
                    <div className="appt-label-row">
                        <label className="appt-label" htmlFor={isReschedule || selectedClient ? undefined : "appt-client-search"}>
                            Cliente
                        </label>
                        {!selectedClient && trimmedQuery && !searchingClients && clientResults.length > 0 && (
                            <span className="appt-count">
                                <span className="appt-count-dot" aria-hidden="true" />
                                {plural(clientTotal, "coincidencia", "coincidencias")}
                            </span>
                        )}
                    </div>
                    {renderClientSection()}
                </section>

                <div className="appt-grid-2">
                    <section className="appt-section">
                        <span className="appt-label">Barbero</span>
                        {isAdmin ? (
                            <Select
                                value={barberId}
                                onChange={value => setBarberId(value)}
                                options={barberOptions}
                                placeholder="Elegí un barbero"
                                aria-label="Barbero"
                            />
                        ) : (
                            <div className="appt-static">
                                <span className="select-avatar">{getInitials(user.first_name, user.last_name)}</span>
                                <span className="appt-static-text">
                                    <span className="appt-static-title">
                                        {user.first_name} {user.last_name}
                                    </span>
                                    <span className="appt-static-sub">Tu agenda</span>
                                </span>
                            </div>
                        )}
                    </section>

                    <section className="appt-section">
                        <span className="appt-label">Servicio y tarifa</span>
                        {isReschedule ? (
                            <div className="appt-static">
                                <Icon name="content_cut" size={18} className="appt-static-icon" />
                                <span className="appt-static-text">
                                    <span className="appt-static-title">{appointment?.service_name || "Sin servicio"}</span>
                                    <span className="appt-static-sub">
                                        {formatMoney(appointment?.price)}
                                        {duration ? ` · ${duration} min` : ""}
                                    </span>
                                </span>
                            </div>
                        ) : !barberId ? (
                            <div className="appt-static is-muted">Elegí un barbero para ver sus servicios.</div>
                        ) : servicesLoading ? (
                            <div className="appt-static is-muted">Cargando servicios…</div>
                        ) : services.length === 0 ? (
                            <InlineFeedback tone="error">{noServicesMessage}</InlineFeedback>
                        ) : (
                            <Select
                                value={serviceId}
                                onChange={value => setServiceId(value)}
                                options={serviceOptions}
                                leadingIcon="content_cut"
                                placeholder="Elegí un servicio"
                                aria-label="Servicio"
                            />
                        )}
                    </section>
                </div>

                <div className="appt-schedule">
                    <DateCalendar
                        value={date}
                        min={todayIso}
                        label="Fecha del turno"
                        onChange={iso => {
                            setDate(iso);
                            setTime("");
                        }}
                        footer={
                            <>
                                <span className="appt-avail-label">Disponibilidad {selectedDateLabel}</span>
                                <span className="appt-avail-value">
                                    {!barberId || slotsLoading
                                        ? "—"
                                        : slotsError
                                          ? "Sin atención"
                                          : plural(freeSlots.length, "libre", "libres")}
                                </span>
                            </>
                        }
                    />

                    <div className="appt-schedule-side">
                        <section className="appt-section">
                            <div className="appt-label-row">
                                <span className="appt-label">Horario</span>
                                {daySlots.length > 1 && !slotsLoading && !slotsError && (
                                    <span className="appt-aside">Intervalos de {slotDuration} min</span>
                                )}
                            </div>
                            {renderSlots()}
                        </section>

                        {!isReschedule && (
                            <FormField
                                label="Referencia o preferencia (opcional)"
                                htmlFor="appt-note"
                                aside={`${note.length}/${NOTE_MAX}`}
                            >
                                <textarea
                                    id="appt-note"
                                    rows={2}
                                    maxLength={NOTE_MAX}
                                    value={note}
                                    onChange={e => setNote(e.target.value)}
                                    placeholder="Ej: degradé bajo, dejar largo arriba"
                                />
                            </FormField>
                        )}
                    </div>
                </div>

                {error && <InlineFeedback tone="error">{error}</InlineFeedback>}
            </form>
        </Modal>
    );
};

export default AppointmentFormModal;
