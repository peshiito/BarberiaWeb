import { IconCheck } from "../ui/icons";
import "./StepIndicator.css";

export default function StepIndicator({ steps, currentIndex }) {
    return (
        <ol className="step-indicator" aria-label="Progreso de la reserva">
            {steps.map((step, i) => {
                const state = i < currentIndex ? "done" : i === currentIndex ? "current" : "upcoming";
                return (
                    <li key={step} className={`step-indicator-item step-${state}`}>
                        <span className="step-indicator-bullet" aria-hidden="true">
                            {state === "done" ? <IconCheck width={12} height={12} /> : i + 1}
                        </span>
                        <span className="step-indicator-label">{step}</span>
                    </li>
                );
            })}
        </ol>
    );
}
