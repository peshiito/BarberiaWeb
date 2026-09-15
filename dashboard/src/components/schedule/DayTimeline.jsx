import { isToday } from "../../utils/date";
import { formatMoney, formatPhone, minutesToTime, telLink, timeToMinutes, whatsappLink } from "../../utils/format";
import Icon from "../ui/Icon";
import { STATUS_LABEL, appointmentDuration, isPastSlot, minutesOfDay } from "./agendaUtils";
import "./DayTimeline.css";

// Arma la línea del día: turnos en su horario y los huecos libres futuros
// agrupados en bloques continuos. Los slots cubiertos por un servicio largo
// no aparecen como libres.
const buildItems = ({ dayIso, slots, slotDuration, appointments, durationsByService, now }) => {
    const byTime = new Map(appointments.map(a => [a.time.slice(0, 5), a]));
    const items = [];
    let coveredUntil = -1;
    let gap = null;

    const flushGap = () => {
        if (gap) items.push(gap);
        gap = null;
    };

    for (const slot of slots) {
        const start = timeToMinutes(slot);
        const appointment = byTime.get(slot);

        if (appointment) {
            flushGap();
            const end = start + appointmentDuration(appointment, durationsByService, slotDuration);
            items.push({ type: "appointment", key: `a-${appointment.id}`, appointment, start, end });
            coveredUntil = Math.max(coveredUntil, end);
            continue;
        }
        if (start < coveredUntil) continue;
        if (isPastSlot(dayIso, slot, now)) {
            flushGap();
            continue;
        }
        if (gap && gap.end === start) {
            gap.end = start + slotDuration;
        } else {
            flushGap();
            gap = { type: "gap", key: `g-${slot}`, slot, start, end: start + slotDuration };
        }
    }
    flushGap();

    // Turnos fuera de la grilla actual (por ejemplo, si se cambió el horario).
    appointments
        .filter(a => !slots.includes(a.time.slice(0, 5)))
        .forEach(appointment => {
            const start = timeToMinutes(appointment.time);
            const end = start + appointmentDuration(appointment, durationsByService, slotDuration);
            items.push({ type: "appointment", key: `a-${appointment.id}`, appointment, start, end });
        });

    return items.sort((a, b) => a.start - b.start);
};

const clientName = a => [a.client_first_name, a.client_last_name].filter(Boolean).join(" ");

const AppointmentCard = ({ item, isNext, onSelect }) => {
    const { appointment, start, end } = item;
    const isCompleted = appointment.status === "completed";
    const when = (
        <span className="day-card-when">
            <Icon name="schedule" size={15} />
            <span className="day-card-range">
                {minutesToTime(start)} – {minutesToTime(end)}
            </span>
            <span className="day-card-sep" aria-hidden="true">
                •
            </span>
            <span className="day-card-duration">{end - start} min</span>
        </span>
    );

    if (isNext) {
        const phone = appointment.client_phone;
        const message = `Hola ${appointment.client_first_name}, te esperamos hoy a las ${appointment.time.slice(0, 5)} en Oficio.`;
        return (
            <article className="day-card is-next">
                <div className="day-card-head">
                    <div className="day-card-titles">
                        <span className="day-card-kicker">
                            <span className="day-card-pulse" aria-hidden="true" />
                            Próximo turno
                        </span>
                        <h3 className="day-card-name is-lg">
                            <span className="day-card-name-text">{clientName(appointment)}</span>
                        </h3>
                        {phone && (
                            <a className="day-card-phone" href={telLink(phone)}>
                                <Icon name="call" size={13} />
                                {formatPhone(phone)}
                            </a>
                        )}
                    </div>
                    <span className="day-card-status">{STATUS_LABEL[appointment.status]}</span>
                </div>

                <div className="day-card-detail">
                    <span className="day-card-detail-service">{appointment.service_name || "Sin servicio"}</span>
                    {appointment.note && <q className="day-card-detail-note">{appointment.note}</q>}
                </div>

                <div className="day-card-foot">
                    {when}
                    <span className="day-card-price">{formatMoney(appointment.price)}</span>
                </div>

                <div className="day-card-actions">
                    {phone && (
                        <a className="day-card-action" href={telLink(phone)}>
                            <Icon name="call" size={18} />
                            Llamar
                        </a>
                    )}
                    {phone && (
                        <a className="day-card-action" href={whatsappLink(phone, message)} target="_blank" rel="noreferrer">
                            <Icon name="chat" size={18} />
                            WhatsApp
                        </a>
                    )}
                    <button type="button" className="day-card-action" onClick={() => onSelect(appointment)}>
                        <Icon name="info" size={18} />
                        Detalle
                    </button>
                </div>
            </article>
        );
    }

    return (
        <button
            type="button"
            className={`day-card ${isCompleted ? "is-completed" : ""}`}
            onClick={() => onSelect(appointment)}
        >
            <span className="day-card-head">
                <span className="day-card-titles">
                    <span className="day-card-name">
                        <span className="day-card-name-text">{clientName(appointment)}</span>
                        {appointment.note && (
                            <Icon name="sticky_note_2" size={16} className="day-card-note" label="Tiene referencia" />
                        )}
                    </span>
                    <span className="day-card-service">{appointment.service_name || "Sin servicio"}</span>
                </span>
                <span className="day-card-status">{STATUS_LABEL[appointment.status]}</span>
            </span>
            <span className="day-card-foot">
                {when}
                <span className="day-card-price">{formatMoney(appointment.price)}</span>
            </span>
        </button>
    );
};

const DayTimeline = ({
    day,
    isWorkDay,
    slots,
    slotDuration,
    appointments,
    durationsByService,
    nextAppointmentId,
    now,
    onSelectAppointment,
    onSelectFreeSlot,
}) => {
    if (!isWorkDay && appointments.length === 0) {
        return (
            <div className="day-closed">
                <Icon name="lock" size={24} />
                <span className="day-closed-title">Día sin atención</span>
                <span className="day-closed-text">No abriste horarios para este día.</span>
            </div>
        );
    }

    const items = buildItems({
        dayIso: day.iso,
        slots: isWorkDay ? slots : [],
        slotDuration,
        appointments,
        durationsByService,
        now,
    });

    const showNow = isToday(day.date);
    const nowMinutes = minutesOfDay(now);
    let nowIndex = showNow ? items.findIndex(item => item.start > nowMinutes) : -1;
    if (showNow && nowIndex === -1) nowIndex = items.length;

    if (items.length === 0) {
        return (
            <div className="day-closed is-soft">
                <Icon name="event_available" size={24} />
                <span className="day-closed-title">Sin horarios pendientes</span>
                <span className="day-closed-text">Ya pasaron todos los horarios de este día.</span>
            </div>
        );
    }

    const rows = [];
    items.forEach((item, index) => {
        if (index === nowIndex) rows.push({ type: "now", key: "now" });
        rows.push(item);
    });
    if (nowIndex === items.length) rows.push({ type: "now", key: "now" });

    return (
        <ol className="day-timeline">
            {rows.map((row, index) => {
                const delay = { animationDelay: `${Math.min(index, 10) * 35}ms` };

                if (row.type === "now") {
                    return (
                        <li key={row.key} className="day-timeline-row is-now" style={delay}>
                            <span className="day-timeline-time is-now">{minutesToTime(nowMinutes)}</span>
                            <span className="day-timeline-now-track" aria-label={`Ahora, ${minutesToTime(nowMinutes)}`}>
                                <span className="day-timeline-now-dot" />
                                <span className="day-timeline-now-line" />
                                <span className="day-timeline-now-tag">Ahora</span>
                            </span>
                        </li>
                    );
                }

                if (row.type === "gap") {
                    return (
                        <li key={row.key} className="day-timeline-row" style={delay}>
                            <span className="day-timeline-time">{minutesToTime(row.start)}</span>
                            <div className="day-gap">
                                <span className="day-gap-dot" aria-hidden="true" />
                                <span className="day-gap-text">
                                    <span className="day-gap-title">Hueco disponible</span>
                                    <span className="day-gap-range">
                                        <span>
                                            {minutesToTime(row.start)} – {minutesToTime(row.end)}
                                        </span>
                                        <span>({row.end - row.start} min)</span>
                                    </span>
                                </span>
                                <button
                                    type="button"
                                    className="day-gap-action"
                                    onClick={() => onSelectFreeSlot(day.iso, row.slot)}
                                    aria-label={`Agendar a las ${row.slot}`}
                                >
                                    <Icon name="add" size={16} />
                                    Agendar
                                </button>
                            </div>
                        </li>
                    );
                }

                const isNext = row.appointment.id === nextAppointmentId;
                return (
                    <li key={row.key} className="day-timeline-row" style={delay}>
                        <span className={`day-timeline-time ${isNext ? "is-next" : ""}`}>{minutesToTime(row.start)}</span>
                        <AppointmentCard item={row} isNext={isNext} onSelect={onSelectAppointment} />
                    </li>
                );
            })}
        </ol>
    );
};

export default DayTimeline;
