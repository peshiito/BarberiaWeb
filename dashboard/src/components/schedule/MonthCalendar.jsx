import { useEffect, useState } from "react";
import { addDays, getMonday, isSameDate, toISODate } from "../../utils/date";
import IconButton from "../ui/IconButton";
import "./MonthCalendar.css";

const WEEKDAY_LABELS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

const iconPrev = (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M12.5 15L7.5 10l5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const iconNext = (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M7.5 5l5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const startOfMonth = date => new Date(date.getFullYear(), date.getMonth(), 1);

// La grilla siempre arranca en lunes (aunque el mes empiece otro día) para
// que cada fila sea una semana completa lunes-domingo — así se puede pintar
// la fila entera como "la semana seleccionada", que es la unidad real que
// se elige acá (no un día suelto).
const buildWeeks = monthDate => {
    const firstWeekday = (monthDate.getDay() + 6) % 7;
    const gridStart = addDays(monthDate, -firstWeekday);
    return Array.from({ length: 6 }, (_, w) => Array.from({ length: 7 }, (_, d) => addDays(gridStart, w * 7 + d)));
};

const capitalize = text => text.charAt(0).toUpperCase() + text.slice(1);

const MonthCalendar = ({ weekStart, onSelectWeek }) => {
    const [viewMonth, setViewMonth] = useState(() => startOfMonth(weekStart));

    // Si `weekStart` cambia desde afuera (botón "Hoy"), el mes visible tiene
    // que seguirlo aunque el usuario esté navegando otro mes en la grilla.
    useEffect(() => {
        setViewMonth(startOfMonth(weekStart));
    }, [weekStart]);

    const today = new Date();
    const weeks = buildWeeks(viewMonth);
    const title = capitalize(viewMonth.toLocaleDateString("es-AR", { month: "long", year: "numeric" }));

    return (
        <div className="month-cal">
            <div className="month-cal-header">
                <IconButton
                    icon={iconPrev}
                    label="Mes anterior"
                    bordered
                    onClick={() => setViewMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
                />
                <span className="month-cal-title">{title}</span>
                <IconButton
                    icon={iconNext}
                    label="Mes siguiente"
                    bordered
                    onClick={() => setViewMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
                />
            </div>

            <div className="month-cal-weekdays">
                {WEEKDAY_LABELS.map(label => (
                    <span key={label}>{label}</span>
                ))}
            </div>

            <div className="month-cal-grid">
                {weeks.map(week => {
                    const isSelectedWeek = isSameDate(week[0], weekStart);
                    return (
                        <div key={toISODate(week[0])} className={`month-cal-week ${isSelectedWeek ? "is-selected" : ""}`}>
                            {week.map(date => {
                                const isOutside = date.getMonth() !== viewMonth.getMonth();
                                const isToday = isSameDate(date, today);
                                const isAnchor = isSameDate(date, weekStart);

                                return (
                                    <button
                                        key={toISODate(date)}
                                        type="button"
                                        className={`month-cal-day ${isOutside ? "is-outside" : ""} ${
                                            isToday ? "is-today" : ""
                                        } ${isAnchor ? "is-anchor" : ""}`}
                                        onClick={() => onSelectWeek(getMonday(date))}
                                        aria-pressed={isAnchor}
                                        aria-label={date.toLocaleDateString("es-AR", {
                                            day: "numeric",
                                            month: "long",
                                            year: "numeric",
                                        })}
                                    >
                                        {date.getDate()}
                                    </button>
                                );
                            })}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default MonthCalendar;
