import "./DayPicker.css";

const DAYS = [
    { key: "lunes", label: "Lun" },
    { key: "martes", label: "Mar" },
    { key: "miercoles", label: "Mié" },
    { key: "jueves", label: "Jue" },
    { key: "viernes", label: "Vie" },
    { key: "sabado", label: "Sáb" },
    { key: "domingo", label: "Dom" },
];

const DayPicker = ({ selected, onToggle }) => {
    return (
        <div className="day-picker">
            {DAYS.map(day => (
                <button
                    key={day.key}
                    type="button"
                    className={`day-picker-chip ${selected.includes(day.key) ? "is-selected" : ""}`}
                    onClick={() => onToggle(day.key)}
                >
                    {day.label}
                </button>
            ))}
        </div>
    );
};

export default DayPicker;
