// Íconos de Google Material Symbols (misma familia que el dashboard).
export default function Icon({ name, size = 20, filled = false, className = "", label, style, ...rest }) {
    return (
        <span
            className={`material-symbols-outlined ${filled ? "is-filled" : ""} ${className}`.trim()}
            style={{ fontSize: size, ...style }}
            aria-hidden={label ? undefined : true}
            role={label ? "img" : undefined}
            aria-label={label}
            {...rest}
        >
            {name}
        </span>
    );
}
