import Icon from "./Icon";
import "./Button.css";

const Button = ({
    variant = "primary",
    size = "md",
    loading = false,
    disabled = false,
    type = "button",
    icon,
    iconRight,
    block = false,
    className = "",
    children,
    ...rest
}) => {
    return (
        <button
            type={type}
            className={`btn btn-${variant} btn-${size} ${block ? "btn-block" : ""} ${className}`}
            disabled={disabled || loading}
            aria-busy={loading || undefined}
            {...rest}
        >
            {loading ? (
                <span className="btn-spinner" aria-hidden="true" />
            ) : (
                icon && <Icon name={icon} size={size === "sm" ? 16 : 18} className="btn-icon" />
            )}
            {children && <span className={loading ? "btn-label is-loading" : "btn-label"}>{children}</span>}
            {iconRight && !loading && <Icon name={iconRight} size={size === "sm" ? 16 : 18} className="btn-icon" />}
        </button>
    );
};

export default Button;
