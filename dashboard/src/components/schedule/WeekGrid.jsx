import { Fragment } from "react";
import { isToday, parseWorkDays } from "../../utils/date";
import Badge from "../ui/Badge";
import "./WeekGrid.css";

const normalizeTime = time => time.slice(0, 5);

const timeToMinutes = time => {
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
};

const isCurrentSlot = (slot, index, slots) => {
    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    const slotMinutes = timeToMinutes(slot);
    const nextSlot = slots[index + 1];
    const nextMinutes = nextSlot ? timeToMinutes(nextSlot) : slotMinutes + 60;
    return nowMinutes >= slotMinutes && nowMinutes < nextMinutes;
};

const isPastSlot = (date, slot) => {
    const [h, m] = slot.split(":").map(Number);
    const slotDateTime = new Date(date);
    slotDateTime.setHours(h, m, 0, 0);
    return slotDateTime < new Date();
};

const WeekGrid = ({ weekDays, schedule, slots, appointments, onSelectAppointment, onSelectFreeSlot }) => {
    if (!schedule) {
        return (
            <div className="state-box">
                <span className="state-box-title">No abriste agenda para esta semana</span>
                <p className="state-box-text">Andá a "Mis horarios" para definir tus días y horarios de atención.</p>
            </div>
        );
    }

    const workDays = parseWorkDays(schedule.work_days);

    const findAppointment = (dayIso, slot) => {
        return appointments.find(a => {
            const aDate = a.date.slice(0, 10);
            return aDate === dayIso && normalizeTime(a.time) === slot;
        });
    };

    return (
        <div className="week-grid-wrapper scroll-shadow-x">
            <div className="week-grid" style={{ gridTemplateColumns: `72px repeat(${weekDays.length}, 1fr)` }}>
                <div className="week-grid-corner" />
                {weekDays.map(day => {
                    const isWorkDay = workDays.includes(day.dayName);
                    return (
                        <div
                            key={day.iso}
                            className={`week-grid-day-header ${isToday(day.date) ? "is-today" : ""} ${
                                !isWorkDay ? "is-closed" : ""
                            }`}
                        >
                            <span className="week-grid-day-label">{day.label}</span>
                            <span className="week-grid-day-number">{day.dayNumber}</span>
                        </div>
                    );
                })}

                {slots.map((slot, slotIndex) => (
                    <Fragment key={slot}>
                        <div className="week-grid-time">{slot}</div>
                        {weekDays.map(day => {
                            const isWorkDay = workDays.includes(day.dayName);
                            const appointment = isWorkDay ? findAppointment(day.iso, slot) : null;
                            const isNow = isToday(day.date) && isCurrentSlot(slot, slotIndex, slots);

                            if (!isWorkDay) {
                                return <div key={`${day.iso}-${slot}`} className="week-grid-cell is-closed" />;
                            }

                            if (!appointment) {
                                if (isPastSlot(day.date, slot)) {
                                    return (
                                        <div key={`${day.iso}-${slot}`} className="week-grid-cell is-past">
                                            <span className="week-grid-free-label">pasado</span>
                                        </div>
                                    );
                                }

                                return (
                                    <button
                                        key={`${day.iso}-${slot}`}
                                        type="button"
                                        className={`week-grid-cell is-free ${isNow ? "is-now" : ""}`}
                                        onClick={() => onSelectFreeSlot(day.iso, slot)}
                                    >
                                        <span className="week-grid-free-label">libre</span>
                                    </button>
                                );
                            }

                            const isCompleted = appointment.status === "completed";

                            return (
                                <button
                                    key={`${day.iso}-${slot}`}
                                    type="button"
                                    className={`week-grid-cell is-booked ${isCompleted ? "is-completed" : ""} ${
                                        isNow ? "is-now" : ""
                                    }`}
                                    onClick={() => onSelectAppointment(appointment)}
                                >
                                    <span className="week-grid-client">
                                        {appointment.client_first_name} {appointment.client_last_name}
                                    </span>
                                    <span className="week-grid-phone">{appointment.client_phone}</span>
                                    <Badge tone={isCompleted ? "sage" : "brass"}>
                                        {isCompleted ? "Completado" : "Activo"}
                                    </Badge>
                                </button>
                            );
                        })}
                    </Fragment>
                ))}
            </div>
        </div>
    );
};

export default WeekGrid;
