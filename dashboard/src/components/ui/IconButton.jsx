import "./IconButton.css";

const IconButton = ({ icon, label, size = "sm", variant = "default", bordered = false, className = "", ...rest }) => {
    return (
        <button
            type="button"
            className={`icon-btn icon-btn-${size} icon-btn-${variant} ${bordered ? "is-bordered" : ""} ${className}`}
            aria-label={label}
            title={label}
            {...rest}
        >
            {icon}
        </button>
    );
};

export default IconButton;
