import { useEffect, useState } from "react";
import { addDays, getMonday, toISODate } from "../../utils/date";
import Icon from "../ui/Icon";
import "./WeekPicker.css";

const WEEKDAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

const startOfMonth = date => new Date(date.getFullYear(), date.getMonth(), 1);

// Filas lunes-domingo que tocan el mes visible.
const buildWeeks = month => {
    const first = getMonday(month);
    const last = new Date(month.getFullYear(), month.getMonth() + 1, 0);
    const weeks = [];
    for (let cursor = first; cursor <= last; cursor = addDays(cursor, 7)) {
        weeks.push(Array.from({ length: 7 }, (_, i) => addDays(cursor, i)));
    }
    return weeks;
};

export const formatWeekSpan = monday => {
    const sunday = addDays(monday, 6);
    const month = d => d.toLocaleDateString("es-AR", { month: "short" }).replace(".", "");
    return monday.getMonth() === sunday.getMonth()
        ? `${monday.getDate()} al ${sunday.getDate()}`
        : `${monday.getDate()} ${month(monday)} al ${sunday.getDate()} ${month(sunday)}`;
};

// La unidad que se elige acá es la semana completa, así que cada fila es un
// único botón (no siete días sueltos).
const WeekPicker = ({ weekStart, onChange, openedWeeks, minWeek }) => {
    const [month, setMonth] = useState(() => startOfMonth(weekStart));

    useEffect(() => {
        setMonth(startOfMonth(weekStart));
    }, [weekStart]);

    const todayIso = toISODate(new Date());
    const selectedIso = toISODate(weekStart);
    const title = month.toLocaleDateString("es-AR", { month: "long", year: "numeric" });

    return (
        <div className="week-picker">
            <div className="week-picker-nav">
                <button
                    type="button"
                    className="week-picker-step"
                    aria-label="Mes anterior"
                    onClick={() => setMonth(m => new Date(m.getFullYear(), m.getMonth() - 1, 1))}
                >
                    <Icon name="chevron_left" size={20} />
                </button>
                <div className="week-picker-title" aria-live="polite">
                    <span className="week-picker-month">{title}</span>
                    <span className="week-picker-selected">
                        <span className="week-picker-selected-dot" aria-hidden="true" />
                        Semana seleccionada: {formatWeekSpan(weekStart)}
                    </span>
                </div>
                <button
                    type="button"
                    className="week-picker-step"
                    aria-label="Mes siguiente"
                    onClick={() => setMonth(m => new Date(m.getFullYear(), m.getMonth() + 1, 1))}
                >
                    <Icon name="chevron_right" size={20} />
                </button>
            </div>

            <div className="week-picker-weekdays" aria-hidden="true">
                {WEEKDAYS.map(day => (
                    <span key={day}>{day}</span>
                ))}
            </div>

            <div className="week-picker-rows">
                {buildWeeks(month).map(week => {
                    const mondayIso = toISODate(week[0]);
                    const selected = mondayIso === selectedIso;
                    const opened = openedWeeks.has(mondayIso);
                    const past = minWeek && week[0] < minWeek;
                    return (
                        <button
                            key={mondayIso}
                            type="button"
                            className={`week-picker-row ${selected ? "is-selected" : ""} ${opened ? "is-opened" : ""}`}
                            disabled={past}
                            aria-pressed={selected}
                            aria-label={`Semana del ${formatWeekSpan(week[0])}${opened ? ", ya abierta" : ""}${past ? ", ya pasó" : ""}`}
                            onClick={() => onChange(week[0])}
                        >
                            {week.map(day => {
                                const iso = toISODate(day);
                                return (
                                    <span
                                        key={iso}
                                        className={`week-picker-day ${day.getMonth() !== month.getMonth() ? "is-outside" : ""} ${
                                            iso === todayIso ? "is-today" : ""
                                        }`}
                                    >
                                        {String(day.getDate()).padStart(2, "0")}
                                    </span>
                                );
                            })}
                            {opened && (
                                <span className="week-picker-opened" aria-hidden="true">
                                    <Icon name="check" size={14} />
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default WeekPicker;
