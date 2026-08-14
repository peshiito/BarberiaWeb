import "./Card.css";

export default function Card({ as: Component = "div", className = "", children, ...rest }) {
    return (
        <Component className={`card ${className}`.trim()} {...rest}>
            {children}
        </Component>
    );
}
