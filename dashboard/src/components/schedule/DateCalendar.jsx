import { useEffect, useState } from "react";
import { addDays, parseDateOnly, toISODate } from "../../utils/date";
import Icon from "../ui/Icon";
import "./DateCalendar.css";

const WEEKDAYS = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sá", "Do"];

const startOfMonth = date => new Date(date.getFullYear(), date.getMonth(), 1);

// Grilla lunes-domingo con solo las semanas que el mes necesita.
const buildDays = month => {
    const offset = (month.getDay() + 6) % 7;
    const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    const cells = Math.ceil((offset + daysInMonth) / 7) * 7;
    const start = addDays(month, -offset);
    return Array.from({ length: cells }, (_, i) => addDays(start, i));
};

const DateCalendar = ({ value, onChange, min, footer, label = "Fecha" }) => {
    const [month, setMonth] = useState(() => startOfMonth(value ? parseDateOnly(value) : new Date()));

    useEffect(() => {
        if (value) setMonth(startOfMonth(parseDateOnly(value)));
    }, [value]);

    const todayIso = toISODate(new Date());
    const minMonth = min ? startOfMonth(parseDateOnly(min)) : null;
    const canGoBack = !minMonth || month > minMonth;
    const title = month.toLocaleDateString("es-AR", { month: "long", year: "numeric" });
    const shiftMonth = step => setMonth(m => new Date(m.getFullYear(), m.getMonth() + step, 1));

    return (
        <div className="date-cal" role="group" aria-label={label}>
            <div className="date-cal-head">
                <span className="date-cal-title" aria-live="polite">
                    <Icon name="calendar_month" size={18} />
                    {title}
                </span>
                <div className="date-cal-nav">
                    <button
                        type="button"
                        className="date-cal-step"
                        aria-label="Mes anterior"
                        disabled={!canGoBack}
                        onClick={() => shiftMonth(-1)}
                    >
                        <Icon name="chevron_left" size={18} />
                    </button>
                    <button type="button" className="date-cal-step" aria-label="Mes siguiente" onClick={() => shiftMonth(1)}>
                        <Icon name="chevron_right" size={18} />
                    </button>
                </div>
            </div>

            <div className="date-cal-weekdays" aria-hidden="true">
                {WEEKDAYS.map(day => (
                    <span key={day}>{day}</span>
                ))}
            </div>

            <div className="date-cal-grid">
                {buildDays(month).map(day => {
                    const iso = toISODate(day);
                    const selected = iso === value;
                    return (
                        <button
                            key={iso}
                            type="button"
                            className={`date-cal-day ${day.getMonth() !== month.getMonth() ? "is-outside" : ""} ${
                                selected ? "is-selected" : ""
                            } ${iso === todayIso ? "is-today" : ""}`}
                            disabled={Boolean(min) && iso < min}
                            aria-pressed={selected}
                            aria-label={day.toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" })}
                            onClick={() => onChange(iso)}
                        >
                            {day.getDate()}
                        </button>
                    );
                })}
            </div>

            {footer && <div className="date-cal-foot">{footer}</div>}
        </div>
    );
};

export default DateCalendar;
