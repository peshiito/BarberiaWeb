const Icon = ({ name, size = 20, filled = false, className = "", label, style, ...rest }) => (
    <span
        className={`material-symbols-outlined ${filled ? "is-filled" : ""} ${className}`}
        style={{ fontSize: size, ...style }}
        aria-hidden={label ? undefined : true}
        role={label ? "img" : undefined}
        aria-label={label}
        {...rest}
    >
        {name}
    </span>
);

export default Icon;
