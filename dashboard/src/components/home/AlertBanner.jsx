import { IconWarning } from "../ui/icons";
import "./AlertBanner.css";

const AlertBanner = ({ message, actionLabel, onAction }) => {
    return (
        <div className="alert-banner">
            <span className="alert-banner-icon">
                <IconWarning />
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
