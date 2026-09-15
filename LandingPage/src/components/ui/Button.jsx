import "./Button.css";

export default function Button({
    as: Component = "button",
    variant = "primary",
    size = "md",
    loading = false,
    disabled = false,
    block = false,
    className = "",
    children,
    ...rest
}) {
    const isButton = Component === "button";
    return (
        <Component
            className={`btn btn-${variant} btn-${size} ${block ? "btn-block" : ""} ${className}`.trim()}
            disabled={isButton ? disabled || loading : undefined}
            type={isButton ? rest.type || "button" : undefined}
            aria-busy={loading || undefined}
            {...rest}
        >
            {loading && <span className="btn-spinner" aria-hidden="true" />}
            {children}
        </Component>
    );
}
