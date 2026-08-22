import "./DurationPicker.css";

const PRESETS = [15, 20, 30, 40, 45, 60];
const MIN = 5;
const MAX = 240;

const DurationPicker = ({ value, onChange, id }) => {
    const isPreset = PRESETS.includes(value);

    const handleCustomChange = e => {
        const raw = e.target.value;
        onChange(raw === "" ? "" : Number(raw));
    };

    return (
        <div className="duration-picker">
            <div className="duration-picker-chips">
                {PRESETS.map(min => (
                    <button
                        key={min}
                        type="button"
                        className={`duration-picker-chip ${value === min ? "is-selected" : ""}`}
                        onClick={() => onChange(min)}
                        aria-pressed={value === min}
                    >
                        {min}
                    </button>
                ))}
            </div>
            <label className={`duration-picker-custom ${!isPreset && value !== "" ? "is-active" : ""}`}>
                <span className="duration-picker-custom-label">Otro</span>
                <input
                    id={id}
                    type="number"
                    inputMode="numeric"
                    min={MIN}
                    max={MAX}
                    step={5}
                    value={value}
                    onChange={handleCustomChange}
                    // Chrome cambia el valor de un <input type="number"> enfocado
                    // al scrollear la página con el mouse encima — un footgun
                    // clásico que puede alterar la duración sin que el usuario
                    // toque nada a propósito.
                    onWheel={e => e.currentTarget.blur()}
                />
                <span className="duration-picker-suffix">min</span>
            </label>
        </div>
    );
};

export default DurationPicker;
export { MIN as DURATION_MIN, MAX as DURATION_MAX };
