import "./AlertBanner.css";

const WarningIcon = () => (
    <svg viewBox="0 0 20 20" fill="none">
        <path d="M10 2.5l8 14H2l8-14z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M10 8v3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="10" cy="14.2" r="0.9" fill="currentColor" />
    </svg>
);

const AlertBanner = ({ message, actionLabel, onAction }) => {
    return (
        <div className="alert-banner">
            <span className="alert-banner-icon">
                <WarningIcon />
            </span>
            <span className="alert-banner-message">{message}</span>
            {actionLabel && (
                <button type="button" className="alert-banner-action" onClick={onAction}>
                    {actionLabel}
                </button>
            )}
        </div>
    );
};

export default AlertBanner;
