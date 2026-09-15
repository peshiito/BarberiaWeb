import { cloneElement, isValidElement, useId } from "react";
import "./FormField.css";

const LABELABLE_TAGS = new Set(["input", "select", "textarea"]);

const FormField = ({ label, children, hint, error, htmlFor, aside, required = false, className = "" }) => {
    const autoId = useId();
    const isLabelable = isValidElement(children) && LABELABLE_TAGS.has(children.type);
    const fieldId = htmlFor || (isLabelable ? children.props.id || autoId : undefined);
    const messageId = error || hint ? (isLabelable ? `${fieldId}-message` : undefined) : undefined;

    const control = isLabelable
        ? cloneElement(children, {
              id: fieldId,
              "aria-invalid": error ? true : undefined,
              "aria-describedby": messageId,
          })
        : children;

    return (
        <div className={`form-field ${error ? "is-invalid" : ""} ${className}`}>
            {(label || aside) && (
                <div className="form-field-head">
                    {label && (
                        <label className="form-field-label" htmlFor={fieldId}>
                            {label}
                            {required && (
                                <span className="form-field-required" aria-hidden="true">
                                    {" "}
                                    *
                                </span>
                            )}
                        </label>
                    )}
                    {aside && <span className="form-field-aside">{aside}</span>}
                </div>
            )}
            {control}
            {error ? (
                <span className="form-field-error" id={messageId} role="alert">
                    {error}
                </span>
            ) : (
                hint && (
                    <span className="form-field-hint" id={messageId}>
                        {hint}
                    </span>
                )
            )}
        </div>
    );
};

export default FormField;
