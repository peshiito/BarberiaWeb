import Icon from "../ui/Icon";

// Un paso de la reserva: "done" se colapsa a una línea con "Cambiar",
// "active" muestra su contenido y "locked" queda atenuado hasta completar el anterior.
export default function StepBlock({ id, index, title, state, summary, onEdit, lockedHint, children }) {
    return (
        <section id={id} className={`step step-${state}`} aria-labelledby={`${id}-title`} tabIndex={-1}>
            <div className="step-head">
                <span className="step-badge" aria-hidden="true">
                    {state === "done" ? <Icon name="check" size={18} /> : index}
                </span>
                <div className="step-heading">
                    <h2 id={`${id}-title`} className="step-title">
                        <span className="visually-hidden">Paso {index}: </span>
                        {title}
                    </h2>
                    {state === "done" && summary && <div className="step-summary">{summary}</div>}
                    {state === "locked" && lockedHint && <p className="step-locked-hint">{lockedHint}</p>}
                </div>
                {state === "done" && onEdit && (
                    <button type="button" className="step-edit" onClick={onEdit}>
                        Cambiar<span className="visually-hidden"> {title.toLowerCase()}</span>
                    </button>
                )}
                {state === "locked" && <Icon name="lock" size={18} className="step-lock" />}
            </div>
            {state === "active" && <div className="step-body">{children}</div>}
        </section>
    );
}
