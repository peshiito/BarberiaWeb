import { useRef } from "react";
import "./SegmentedControl.css";

const SegmentedControl = ({ value, onChange, options, label, size = "md", className = "" }) => {
    const refs = useRef([]);

    const handleKeyDown = (e, index) => {
        const step = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
        if (!step) return;
        e.preventDefault();
        let next = index;
        for (let tries = 0; tries < options.length; tries += 1) {
            next = (next + step + options.length) % options.length;
            if (!options[next].disabled) break;
        }
        onChange(options[next].value);
        refs.current[next]?.focus();
    };

    return (
        <div className={`segmented segmented-${size} ${className}`} role="radiogroup" aria-label={label}>
            {options.map((option, index) => {
                const checked = option.value === value;
                return (
                    <button
                        key={option.value}
                        ref={node => {
                            refs.current[index] = node;
                        }}
                        type="button"
                        role="radio"
                        aria-checked={checked}
                        tabIndex={checked ? 0 : -1}
                        disabled={option.disabled}
                        className={`segmented-option ${checked ? "is-checked" : ""}`}
                        onClick={() => onChange(option.value)}
                        onKeyDown={e => handleKeyDown(e, index)}
                    >
                        {option.label}
                    </button>
                );
            })}
        </div>
    );
};

export default SegmentedControl;
