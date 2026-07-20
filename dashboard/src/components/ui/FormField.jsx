import "./FormField.css";

const FormField = ({ label, children, hint }) => {
    return (
        <div className="form-field">
            <label className="form-field-label">{label}</label>
            {children}
            {hint && <span className="form-field-hint">{hint}</span>}
        </div>
    );
};

export default FormField;
