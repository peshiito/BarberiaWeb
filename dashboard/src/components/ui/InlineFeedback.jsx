import "./InlineFeedback.css";

const InlineFeedback = ({ tone = "error", children, className = "" }) => {
    return (
        <p
            className={`inline-feedback inline-feedback-${tone} ${className}`}
            role={tone === "error" ? "alert" : "status"}
        >
            {children}
        </p>
    );
};

export default InlineFeedback;
