import { useState } from "react";
import Icon from "../ui/Icon";
import "./SlotDurationPicker.css";

const PRESETS = [15, 20, 30, 40, 45, 60];
export const DURATION_MIN = 5;
export const DURATION_MAX = 240;

const SlotDurationPicker = ({ value, onChange }) => {
    const [customOpen, setCustomOpen] = useState(() => value !== "" && !PRESETS.includes(value));
    const customActive = customOpen || (value !== "" && !PRESETS.includes(value));

    return (
        <div className="slot-duration">
            <div className="slot-duration-options" role="group" aria-label="Duración de cada turno">
                {PRESETS.map(minutes => {
                    const selected = !customActive && value === minutes;
                    return (
                        <button
                            key={minutes}
                            type="button"
                            className={`slot-duration-option ${selected ? "is-selected" : ""}`}
                            aria-pressed={selected}
                            onClick={() => {
                                setCustomOpen(false);
                                onChange(minutes);
                            }}
                        >
                            {selected && <Icon name="check" size={16} />}
                            {minutes} min
                        </button>
                    );
                })}
                <button
                    type="button"
                    className={`slot-duration-option is-custom ${customActive ? "is-selected" : ""}`}
                    aria-pressed={customActive}
                    aria-expanded={customActive}
                    onClick={() => setCustomOpen(true)}
                >
                    <Icon name="tune" size={16} />
                    Personalizado
                </button>
            </div>

            {customActive && (
                <label className="slot-duration-custom">
                    <span className="slot-duration-custom-label">Minutos por turno</span>
                    <input
                        type="number"
                        inputMode="numeric"
                        min={DURATION_MIN}
                        max={DURATION_MAX}
                        step={5}
                        value={value}
                        autoFocus
                        onChange={e => onChange(e.target.value === "" ? "" : Number(e.target.value))}
                        // Chrome cambia el valor de un number enfocado al scrollear encima.
                        onWheel={e => e.currentTarget.blur()}
                    />
                    <span className="slot-duration-custom-suffix">min</span>
                </label>
            )}
        </div>
    );
};

export default SlotDurationPicker;
