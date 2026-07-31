import "./InlineFeedback.css";

const InlineFeedback = ({ tone = "error", children }) => {
    return <p className={`inline-feedback is-${tone}`}>{children}</p>;
};

export default InlineFeedback;
