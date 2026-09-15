import Icon from "../ui/Icon";

const STATUS_LABEL = {
    past: "Pasado",
    closed: "Cerrado",
    full: "Completo",
    none: "—",
    loading: "…",
};

function freeLabel(count) {
    return count === 1 ? "1 libre" : `${count} libres`;
}

export default function DayStrip({ days, selectedIso, onSelect, onPrev, onNext, prevDisabled, rangeLabel }) {
    return (
        <div className="daystrip">
            <div className="daystrip-head">
                <p className="daystrip-range">{rangeLabel}</p>
                <div className="daystrip-nav">
                    <button type="button" className="icon-btn" onClick={onPrev} disabled={prevDisabled} aria-label="Semana anterior">
                        <Icon name="chevron_left" size={22} />
                    </button>
                    <button type="button" className="icon-btn" onClick={onNext} aria-label="Semana siguiente">
                        <Icon name="chevron_right" size={22} />
                    </button>
                </div>
            </div>

            <ul className="daystrip-days">
                {days.map((day) => {
                    const selected = day.iso === selectedIso;
                    const label = selected ? "Elegido" : day.status === "free" ? freeLabel(day.free) : STATUS_LABEL[day.status];
                    return (
                        <li key={day.iso}>
                            <button
                                type="button"
                                className={`day is-${day.status} ${selected ? "is-selected" : ""}`}
                                disabled={day.status !== "free"}
                                aria-pressed={selected}
                                aria-label={`${day.fullLabel}: ${label}`}
                                onClick={() => onSelect(day.iso)}
                            >
                                <span className="day-name">{day.label}</span>
                                <span className="day-number">{day.dayNumber}</span>
                                <span className="day-status">{label}</span>
                            </button>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
