import Icon from "../ui/Icon";

const QuantityStepper = ({ id, value, min = 1, max, onChange, label }) => {
    const clamp = next => Math.max(min, max === undefined ? next : Math.min(max, next));

    return (
        <div className="fin-stepper">
            <button
                type="button"
                className="fin-stepper-btn"
                onClick={() => onChange(clamp(value - 1))}
                disabled={value <= min}
                aria-label={`Restar una unidad a ${label}`}
            >
                <Icon name="remove" size={20} />
            </button>
            <input
                id={id}
                type="number"
                inputMode="numeric"
                min={min}
                max={max}
                value={value}
                onChange={e => onChange(e.target.value === "" ? min : clamp(Math.round(Number(e.target.value))))}
                onWheel={e => e.currentTarget.blur()}
            />
            <button
                type="button"
                className="fin-stepper-btn"
                onClick={() => onChange(clamp(value + 1))}
                disabled={max !== undefined && value >= max}
                aria-label={`Sumar una unidad a ${label}`}
            >
                <Icon name="add" size={20} />
            </button>
        </div>
    );
};

export default QuantityStepper;
