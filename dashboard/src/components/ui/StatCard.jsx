import "./StatCard.css";

const StatCard = ({ icon, label, value, sub, highlight = false, action }) => {
    return (
        <div className={`stat-card ${highlight ? "is-highlight" : ""}`}>
            <div className="stat-card-head">
                <span className="stat-card-label">{label}</span>
                {icon && <span className="stat-card-icon">{icon}</span>}
            </div>
            <span className="stat-card-value">{value}</span>
            {sub && <span className="stat-card-sub">{sub}</span>}
            {action && (
                <button type="button" className="stat-card-action" onClick={action.onClick}>
                    {action.label}
                </button>
            )}
        </div>
    );
};

export default StatCard;
