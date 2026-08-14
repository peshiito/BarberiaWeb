import "./EmptyState.css";

export default function EmptyState({ icon, title, text, action }) {
    return (
        <div className="state-box empty-state" role="status">
            {icon && <div className="empty-state-icon">{icon}</div>}
            <p className="state-box-title">{title}</p>
            {text && <p className="state-box-text">{text}</p>}
            {action}
        </div>
    );
}
