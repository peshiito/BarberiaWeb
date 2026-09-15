import Switch from "../ui/Switch";
import "./WorkdayToggles.css";

export const WORK_DAYS = [
    { key: "lunes", short: "Lun", long: "lunes" },
    { key: "martes", short: "Mar", long: "martes" },
    { key: "miercoles", short: "Mié", long: "miércoles" },
    { key: "jueves", short: "Jue", long: "jueves" },
    { key: "viernes", short: "Vie", long: "viernes" },
    { key: "sabado", short: "Sáb", long: "sábado" },
    { key: "domingo", short: "Dom", long: "domingo" },
];

const shortHour = time => (time?.endsWith(":00") ? String(Number(time.slice(0, 2))) : time);

const WorkdayToggles = ({ selected, onToggle, startTime, endTime, todayKey }) => (
    <div className="workdays">
        {WORK_DAYS.map(day => {
            const on = selected.includes(day.key);
            const today = day.key === todayKey;
            return (
                <div key={day.key} className={`workday ${on ? "is-on" : ""} ${today ? "is-today" : ""}`}>
                    <span className="workday-name">{day.short}</span>
                    <span className="workday-hours">
                        {on ? `${shortHour(startTime)} – ${shortHour(endTime)} h` : "Franco"}
                    </span>
                    <Switch checked={on} onChange={() => onToggle(day.key)} label={`Atender los ${day.long}`} />
                    <span className="workday-state">
                        {today ? `Hoy (${on ? "abierto" : "franco"})` : on ? "Abierto" : "Cerrado"}
                    </span>
                </div>
            );
        })}
    </div>
);

export default WorkdayToggles;
