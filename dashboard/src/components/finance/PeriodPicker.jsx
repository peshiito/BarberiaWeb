import Icon from "../ui/Icon";
import { PERIOD_PRESETS, todayIso } from "./financeUtils";
import "./PeriodPicker.css";

const PeriodPicker = ({ from, to, onChange }) => {
    const activePreset = PERIOD_PRESETS.find(preset => {
        const range = preset.range();
        return range.from === from && range.to === to;
    })?.value;

    return (
        <div className="period-picker">
            <div className="period-presets" role="group" aria-label="Atajos de período">
                {PERIOD_PRESETS.map(preset => (
                    <button
                        key={preset.value}
                        type="button"
                        className={`period-preset ${activePreset === preset.value ? "is-active" : ""}`}
                        aria-pressed={activePreset === preset.value}
                        onClick={() => onChange(preset.range())}
                    >
                        {preset.label}
                    </button>
                ))}
            </div>
            <div className="period-range">
                <Icon name="calendar_today" size={18} className="period-range-icon" />
                <label className="visually-hidden" htmlFor="period-from">
                    Desde
                </label>
                <input
                    id="period-from"
                    type="date"
                    value={from}
                    max={to}
                    onChange={e => e.target.value && onChange({ from: e.target.value, to })}
                />
                <span aria-hidden="true">—</span>
                <label className="visually-hidden" htmlFor="period-to">
                    Hasta
                </label>
                <input
                    id="period-to"
                    type="date"
                    value={to}
                    min={from}
                    max={todayIso()}
                    onChange={e => e.target.value && onChange({ from, to: e.target.value })}
                />
            </div>
        </div>
    );
};

export default PeriodPicker;
