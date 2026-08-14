import "./Button.css";

export default function Button({
    as: Component = "button",
    variant = "primary",
    size = "md",
    loading = false,
    disabled = false,
    className = "",
    children,
    ...rest
}) {
    return (
        <Component
            className={`btn btn-${variant} btn-${size} ${className}`.trim()}
            disabled={Component === "button" ? disabled || loading : undefined}
            aria-busy={loading || undefined}
            {...rest}
        >
            {loading && <span className="btn-spinner" aria-hidden="true" />}
            <span className="btn-label">{children}</span>
        </Component>
    );
}
