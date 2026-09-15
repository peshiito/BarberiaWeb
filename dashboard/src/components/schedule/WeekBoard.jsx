import { useEffect, useRef } from "react";
import { isToday } from "../../utils/date";
import { formatMoney, formatPhone, minutesToTime, timeToMinutes } from "../../utils/format";
import Icon from "../ui/Icon";
import { STATUS_LABEL, appointmentDuration, isPastSlot, minutesOfDay } from "./agendaUtils";
import "./WeekBoard.css";

const TIME_COL = 80;

const WeekBoard = ({
    days,
    workDays,
    slots,
    slotDuration,
    appointments,
    durationsByService,
    nextAppointmentId,
    now,
    onSelectAppointment,
    onSelectFreeSlot,
    onSelectDay,
}) => {
    const rowHeight = slots.length > 24 ? 64 : 80;
    const columns = days.length;
    const colWidth = `((100% - ${TIME_COL}px) / ${columns})`;

    // Un servicio largo ocupa varios slots: esas celdas no se ofrecen para reservar.
    const spanOf = appointment =>
        Math.max(1, Math.round(appointmentDuration(appointment, durationsByService, slotDuration) / slotDuration));
    const occupied = new Set();
    appointments.forEach(a => {
        const startIndex = slots.indexOf(a.time.slice(0, 5));
        if (startIndex < 0) return;
        for (let i = 0; i < spanOf(a); i += 1) {
            if (slots[startIndex + i]) occupied.add(`${a.date.slice(0, 10)}|${slots[startIndex + i]}`);
        }
    });

    const firstMinutes = slots.length ? timeToMinutes(slots[0]) : 0;
    const lastMinutes = slots.length ? timeToMinutes(slots[slots.length - 1]) + slotDuration : 0;
    const todayIndex = days.findIndex(d => isToday(d.date));
    const nowMinutes = minutesOfDay(now);
    const showNow = todayIndex >= 0 && nowMinutes >= firstMinutes && nowMinutes <= lastMinutes;
    const nowTop = ((nowMinutes - firstMinutes) / slotDuration) * rowHeight;

    const scrollRef = useRef(null);
    const weekKey = days[0]?.iso;
    const firstRow = appointments.reduce((min, a) => {
        const index = slots.indexOf(a.time.slice(0, 5));
        return index >= 0 && (min === null || index < min) ? index : min;
    }, null);
    const initialScrollTop = showNow ? nowTop : firstRow !== null ? firstRow * rowHeight : null;

    // Al entrar a una semana, llevar la vista a la hora actual o al primer turno.
    useEffect(() => {
        if (scrollRef.current && initialScrollTop !== null) {
            scrollRef.current.scrollTop = Math.max(0, initialScrollTop - rowHeight * 1.5);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [weekKey]);

    return (
        <div ref={scrollRef} className="week-board" style={{ "--row-h": `${rowHeight}px`, "--cols": columns }}>
            <div className="week-board-inner">
                <div className="week-board-head" role="row">
                    <div className="week-board-corner">
                        <span className="t-label">Hora</span>
                    </div>
                    {days.map(day => {
                        const open = workDays.includes(day.dayName);
                        const today = isToday(day.date);
                        const count = appointments.filter(a => a.date.slice(0, 10) === day.iso).length;
                        return (
                            <button
                                key={day.iso}
                                type="button"
                                className={`week-board-day ${today ? "is-today" : ""} ${open ? "" : "is-closed"}`}
                                onClick={() => onSelectDay(day.iso)}
                                aria-label={`Ver ${day.date.toLocaleDateString("es-AR", { weekday: "long", day: "numeric" })}, ${count} turnos`}
                            >
                                {today && <span className="week-board-today-tag">Hoy</span>}
                                <span className="week-board-day-name">
                                    {day.date.toLocaleDateString("es-AR", { weekday: "long" })}
                                </span>
                                <span className="week-board-day-number">{day.dayNumber}</span>
                            </button>
                        );
                    })}
                </div>

                <div className="week-board-body" style={{ height: slots.length * rowHeight }}>
                    {slots.map((slot, rowIndex) => (
                        <div
                            key={slot}
                            className={`week-board-row ${rowIndex % 2 === 0 ? "is-even" : ""} ${slot.endsWith(":00") ? "is-hour" : ""}`}
                            style={{ top: rowIndex * rowHeight }}
                        >
                            <span className="week-board-time">{slot}</span>
                            {days.map(day => {
                                const open = workDays.includes(day.dayName);
                                const booked = occupied.has(`${day.iso}|${slot}`);
                                if (!open || booked) {
                                    return <span key={day.iso} className="week-board-cell" aria-hidden="true" />;
                                }
                                if (isPastSlot(day.iso, slot, now)) {
                                    return <span key={day.iso} className="week-board-cell is-past" aria-hidden="true" />;
                                }
                                return (
                                    <button
                                        key={day.iso}
                                        type="button"
                                        className="week-board-cell is-free"
                                        onClick={() => onSelectFreeSlot(day.iso, slot)}
                                        aria-label={`Reservar ${day.date.toLocaleDateString("es-AR", { weekday: "long", day: "numeric" })} a las ${slot}`}
                                    >
                                        <span className="week-board-free-label">+ Reservar</span>
                                    </button>
                                );
                            })}
                        </div>
                    ))}

                    {days.map((day, index) =>
                        workDays.includes(day.dayName) ? null : (
                            <div
                                key={`closed-${day.iso}`}
                                className="week-board-closed"
                                style={{ left: `calc(${TIME_COL}px + ${index} * ${colWidth})`, width: `calc(${colWidth})` }}
                            >
                                <span className="week-board-closed-tag">
                                    <Icon name="lock" size={22} />
                                    <span className="t-headline-sm">Cerrado</span>
                                    <span className="t-mono-sm">Sin atención</span>
                                </span>
                            </div>
                        ),
                    )}

                    {appointments.map((appointment, i) => {
                        const dayIndex = days.findIndex(d => d.iso === appointment.date.slice(0, 10));
                        const rowIndex = slots.indexOf(appointment.time.slice(0, 5));
                        if (dayIndex < 0 || rowIndex < 0) return null;

                        const duration = appointmentDuration(appointment, durationsByService, slotDuration);
                        const start = timeToMinutes(appointment.time);
                        const isNext = appointment.id === nextAppointmentId;
                        const isCompleted = appointment.status === "completed";
                        const height = spanOf(appointment) * rowHeight;
                        const lines = Math.floor((height - 24) / 17);

                        return (
                            <button
                                key={appointment.id}
                                type="button"
                                className={`week-board-appt ${isCompleted ? "is-completed" : ""} ${isNext ? "is-next" : ""}`}
                                style={{
                                    left: `calc(${TIME_COL}px + ${dayIndex} * ${colWidth})`,
                                    width: `calc(${colWidth})`,
                                    top: rowIndex * rowHeight,
                                    height,
                                    animationDelay: `${Math.min(i, 12) * 30}ms`,
                                }}
                                onClick={() => onSelectAppointment(appointment)}
                            >
                                <span className="week-board-appt-card">
                                    <span className="week-board-appt-top">
                                        <span className="week-board-appt-name">
                                            {appointment.client_first_name} {appointment.client_last_name}
                                        </span>
                                        {isNext && <span className="week-board-appt-ping" aria-hidden="true" />}
                                        {appointment.note && (
                                            <Icon
                                                name="sticky_note_2"
                                                size={15}
                                                className="week-board-appt-note"
                                                label="Tiene referencia"
                                            />
                                        )}
                                        {isCompleted && <Icon name="task_alt" size={15} className="week-board-appt-done" />}
                                        <span className="visually-hidden">, {STATUS_LABEL[appointment.status]}</span>
                                    </span>
                                    {lines >= 4 && appointment.client_phone && (
                                        <span className="week-board-appt-phone">{formatPhone(appointment.client_phone)}</span>
                                    )}
                                    {lines >= 3 && (
                                        <span className="week-board-appt-service">
                                            {appointment.service_name || "Sin servicio"}
                                        </span>
                                    )}
                                    <span className="week-board-appt-meta">
                                        <span>
                                            {minutesToTime(start)}
                                            <span className="week-board-appt-end"> – {minutesToTime(start + duration)}</span>
                                        </span>
                                        <span className="week-board-appt-price">{formatMoney(appointment.price)}</span>
                                    </span>
                                </span>
                            </button>
                        );
                    })}

                    {showNow && (
                        <div className="week-board-now" style={{ top: nowTop }} aria-hidden="true">
                            <span className="week-board-now-tag">{minutesToTime(nowMinutes)}</span>
                            <span className="week-board-now-line">
                                <span
                                    className="week-board-now-today"
                                    style={{ left: `calc(${todayIndex} * (100% / ${columns}))`, width: `calc(100% / ${columns})` }}
                                />
                                <span className="week-board-now-dot" style={{ left: `calc(${todayIndex} * (100% / ${columns}))` }} />
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WeekBoard;
