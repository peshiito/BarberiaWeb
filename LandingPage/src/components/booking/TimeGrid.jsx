import { timeToMinutes } from "../../utils/format";
import Icon from "../ui/Icon";

const AFTERNOON_FROM = 13 * 60;

export default function TimeGrid({ slots, selected, onSelect }) {
    const groups = [
        { key: "morning", label: "Mañana", icon: "wb_sunny", items: slots.filter((s) => timeToMinutes(s.time) < AFTERNOON_FROM) },
        { key: "afternoon", label: "Tarde", icon: "wb_twilight", items: slots.filter((s) => timeToMinutes(s.time) >= AFTERNOON_FROM) },
    ].filter((group) => group.items.length > 0);

    return (
        <div className="timegrid-groups">
            {groups.map((group) => (
                <div key={group.key} className="timegrid-group" role="group" aria-labelledby={`timegrid-${group.key}`}>
                    <p id={`timegrid-${group.key}`} className="timegrid-label">
                        <Icon name={group.icon} size={18} />
                        {group.label}
                        <span className="mono">
                            {group.items[0].time} a {group.items[group.items.length - 1].time}
                        </span>
                    </p>
                    <ul className="timegrid">
                        {group.items.map((slot) => {
                            const isSelected = slot.time === selected;
                            return (
                                <li key={slot.time}>
                                    <button
                                        type="button"
                                        className={`slot ${isSelected ? "is-selected" : ""} ${slot.taken ? "is-taken" : ""}`}
                                        disabled={slot.taken}
                                        aria-pressed={isSelected}
                                        aria-label={slot.taken ? `${slot.time}, ocupado` : undefined}
                                        onClick={() => onSelect(slot.time)}
                                    >
                                        {slot.time}
                                        {isSelected && <Icon name="check" size={16} />}
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            ))}
        </div>
    );
}
