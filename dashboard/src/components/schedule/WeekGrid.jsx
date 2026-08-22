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

    // Con turnos cortos (15-20 min) un día de agenda genera muchas más filas
    // que con turnos de 30-60 min. Sin esto cada fila mide 64px fijos y la
    // grilla se vuelve una tira larguísima — acá se compacta la fila y se
    // recorta contenido secundario a medida que hay más slots por día.
    const isDense = slots.length > 20;
    const isVeryDense = slots.length > 28;

    const findAppointment = (dayIso, slot) => {
        return appointments.find(a => {
            const aDate = a.date.slice(0, 10);
            return aDate === dayIso && normalizeTime(a.time) === slot;
        });
    };

    return (
        <div
            className={`week-grid-wrapper scroll-shadow-x ${isDense ? "is-dense" : ""} ${
                isVeryDense ? "is-very-dense" : ""
            }`}
            style={{ "--slot-count": slots.length }}
        >
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

                {slots.map((slot, slotIndex) => {
                    const isHourMark = slot.endsWith(":00");
                    return (
                        <Fragment key={slot}>
                            <div className={`week-grid-time ${isHourMark ? "is-hour-mark" : ""}`}>{slot}</div>
                            {weekDays.map(day => {
                                const isWorkDay = workDays.includes(day.dayName);
                                const appointment = isWorkDay ? findAppointment(day.iso, slot) : null;
                                const isNow = isToday(day.date) && isCurrentSlot(slot, slotIndex, slots);
                                const hourClass = isHourMark ? "is-hour-mark" : "";

                                if (!isWorkDay) {
                                    return (
                                        <div
                                            key={`${day.iso}-${slot}`}
                                            className={`week-grid-cell is-closed ${hourClass}`}
                                        />
                                    );
                                }

                                if (!appointment) {
                                    if (isPastSlot(day.date, slot)) {
                                        return (
                                            <div
                                                key={`${day.iso}-${slot}`}
                                                className={`week-grid-cell is-past ${hourClass}`}
                                            >
                                                <span className="week-grid-free-label">pasado</span>
                                            </div>
                                        );
                                    }

                                    return (
                                        <button
                                            key={`${day.iso}-${slot}`}
                                            type="button"
                                            className={`week-grid-cell is-free ${hourClass} ${isNow ? "is-now" : ""}`}
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
                                        className={`week-grid-cell is-booked ${hourClass} ${
                                            isCompleted ? "is-completed" : ""
                                        } ${isNow ? "is-now" : ""}`}
                                        onClick={() => onSelectAppointment(appointment)}
                                        title={
                                            isVeryDense
                                                ? `${appointment.client_first_name} ${appointment.client_last_name} · ${appointment.client_phone}`
                                                : undefined
                                        }
                                    >
                                        <span className="week-grid-client">
                                            {appointment.client_first_name} {appointment.client_last_name}
                                        </span>
                                        {!isVeryDense && (
                                            <span className="week-grid-phone">{appointment.client_phone}</span>
                                        )}
                                        <Badge tone={isCompleted ? "sage" : "brass"}>
                                            {isCompleted ? "Completado" : "Activo"}
                                        </Badge>
                                    </button>
                                );
                            })}
                        </Fragment>
                    );
                })}
            </div>
        </div>
    );
};

export default WeekGrid;
