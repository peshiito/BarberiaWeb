import "./Switch.css";

const Switch = ({ checked, onChange, label, id, disabled = false, className = "" }) => (
    <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        className={`switch ${checked ? "is-on" : ""} ${className}`}
        onClick={() => onChange(!checked)}
    >
        <span className="switch-thumb" aria-hidden="true" />
    </button>
);

export default Switch;
