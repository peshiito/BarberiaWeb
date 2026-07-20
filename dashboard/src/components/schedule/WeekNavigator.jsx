import { formatWeekRange } from "../../utils/date";
import "./WeekNavigator.css";

const WeekNavigator = ({ weekStart, onPrev, onNext, onToday }) => {
    return (
        <div className="week-nav">
            <button className="week-nav-arrow" onClick={onPrev} aria-label="Semana anterior">
                <svg viewBox="0 0 20 20" fill="none">
                    <path
                        d="M12.5 15L7.5 10l5-5"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </button>

            <div className="week-nav-label">
                <span className="week-nav-range">{formatWeekRange(weekStart)}</span>
                <button className="week-nav-today" onClick={onToday}>
                    Hoy
                </button>
            </div>

            <button className="week-nav-arrow" onClick={onNext} aria-label="Semana siguiente">
                <svg viewBox="0 0 20 20" fill="none">
                    <path
                        d="M7.5 5l5 5-5 5"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </button>
        </div>
    );
};

export default WeekNavigator;
