import "./StatCard.css";

const TREND_ARROWS = { up: "▲", down: "▼" };

const StatCard = ({ icon, label, value, sub, highlight = false, action, trend }) => {
    return (
        <div className={`stat-card ${highlight ? "is-highlight" : ""}`}>
            <div className="stat-card-head">
                <span className="stat-card-label">{label}</span>
                {icon && <span className="stat-card-icon">{icon}</span>}
            </div>
            <span className="stat-card-value">{value}</span>
            {trend && (
                <span className={`stat-card-trend is-${trend.tone}`}>
                    {trend.direction && <span className="stat-card-trend-arrow">{TREND_ARROWS[trend.direction]}</span>}
                    {trend.label}
                </span>
            )}
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
