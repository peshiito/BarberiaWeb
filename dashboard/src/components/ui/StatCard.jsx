import "./StatCard.css";

const TrendArrow = ({ direction }) => (
    <svg className="stat-card-trend-arrow" viewBox="0 0 10 10" fill="none" aria-hidden="true">
        {direction === "up" ? (
            <path d="M5 8.5V1.5M1.5 5L5 1.5 8.5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        ) : (
            <path d="M5 1.5v7M1.5 5.5 5 9l3.5-3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        )}
    </svg>
);

const StatCard = ({ icon, label, value, sub, highlight = false, trend }) => {
    return (
        <div className={`stat-card ${highlight ? "is-highlight" : ""}`}>
            <div className="stat-card-head">
                <span className="stat-card-label">{label}</span>
                {icon && <span className="stat-card-icon">{icon}</span>}
            </div>
            <span className="stat-card-value">{value}</span>
            {(trend || sub) && (
                <div className="stat-card-meta">
                    {trend && (
                        <span className={`stat-card-trend stat-card-trend-${trend.tone}`}>
                            {trend.direction && <TrendArrow direction={trend.direction} />}
                            {trend.label}
                        </span>
                    )}
                    {sub && <span className="stat-card-sub">{sub}</span>}
                </div>
            )}
        </div>
    );
};

export default StatCard;
