import "./Button.css";

const Button = ({
    variant = "primary",
    size = "md",
    loading = false,
    disabled = false,
    type = "button",
    className = "",
    children,
    ...rest
}) => {
    return (
        <button
            type={type}
            className={`btn btn-${variant} btn-${size} ${className}`}
            disabled={disabled || loading}
            {...rest}
        >
            {loading && <span className="btn-spinner" aria-hidden="true" />}
            <span className={loading ? "btn-label is-loading" : "btn-label"}>{children}</span>
        </button>
    );
};

export default Button;
