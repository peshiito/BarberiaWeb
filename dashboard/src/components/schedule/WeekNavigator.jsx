import IconButton from "../ui/IconButton";
import { formatWeekRange } from "../../utils/date";
import "./WeekNavigator.css";

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

const WeekNavigator = ({ weekStart, onPrev, onNext, onToday }) => {
    return (
        <div className="week-nav">
            <IconButton icon={iconPrev} label="Semana anterior" onClick={onPrev} bordered className="week-nav-arrow" />

            <div className="week-nav-label">
                <span className="week-nav-range">{formatWeekRange(weekStart)}</span>
                <button type="button" className="week-nav-today" onClick={onToday}>
                    Hoy
                </button>
            </div>

            <IconButton icon={iconNext} label="Semana siguiente" onClick={onNext} bordered className="week-nav-arrow" />
        </div>
    );
};

export default WeekNavigator;
