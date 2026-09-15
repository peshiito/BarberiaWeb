import { minutesToTime, timeToMinutes } from "../../utils/format";
import Icon from "../ui/Icon";
import "./TimeStepper.css";

const DAY_MINUTES = 24 * 60;

const TimeStepper = ({ id, label, icon, value, onChange, step = 30 }) => {
    const shift = amount => {
        const next = Math.min(DAY_MINUTES - step, Math.max(0, timeToMinutes(value) + amount));
        onChange(minutesToTime(next));
    };

    return (
        <div className="time-stepper">
            <label className="time-stepper-label" htmlFor={id}>
                {label}
            </label>
            <div className="time-stepper-control">
                <div className="time-stepper-value">
                    <Icon name={icon} size={20} className="time-stepper-icon" />
                    <input
                        id={id}
                        type="time"
                        step={step * 60}
                        value={value}
                        onChange={e => e.target.value && onChange(e.target.value)}
                    />
                    <span className="time-stepper-unit">hs</span>
                </div>
                <div className="time-stepper-buttons">
                    <button
                        type="button"
                        className="time-stepper-btn"
                        aria-label={`${label}: restar ${step} minutos`}
                        onClick={() => shift(-step)}
                    >
                        <Icon name="remove" size={18} />
                    </button>
                    <button
                        type="button"
                        className="time-stepper-btn"
                        aria-label={`${label}: sumar ${step} minutos`}
                        onClick={() => shift(step)}
                    >
                        <Icon name="add" size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TimeStepper;
