import "./FormField.css";

export default function FormField({ id, label, error, hint, required, children }) {
    return (
        <div className="form-field">
            <label htmlFor={id} className="form-label">
                {label}
                {required && (
                    <span className="form-required" aria-hidden="true">
                        {" "}*
                    </span>
                )}
            </label>
            {children}
            {hint && !error && (
                <p id={`${id}-hint`} className="form-hint">
                    {hint}
                </p>
            )}
            {error && (
                <p id={`${id}-error`} className="form-error" role="alert">
                    {error}
                </p>
            )}
        </div>
    );
}
