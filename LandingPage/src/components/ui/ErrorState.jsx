import Button from "./Button";
import "./EmptyState.css";

export default function ErrorState({ title = "Algo salió mal", text, onRetry }) {
    return (
        <div className="state-box empty-state" role="alert">
            <p className="state-box-title">{title}</p>
            {text && <p className="state-box-text">{text}</p>}
            {onRetry && (
                <Button variant="secondary" size="sm" onClick={onRetry}>
                    Reintentar
                </Button>
            )}
        </div>
    );
}
