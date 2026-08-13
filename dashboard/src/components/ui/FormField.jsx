import { cloneElement, isValidElement, useId } from "react";
import "./FormField.css";

const LABELABLE_TAGS = new Set(["input", "select", "textarea"]);

const FormField = ({ label, children, hint, error, htmlFor }) => {
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
        <div className={`form-field ${error ? "is-invalid" : ""}`}>
            <label className="form-field-label" htmlFor={fieldId}>
                {label}
            </label>
            {control}
            {error ? (
                <span className="form-field-error" id={messageId}>
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
