import { useReveal } from "../../hooks/useReveal";

export default function Reveal({ as: Component = "div", delay = 0, className = "", children, ...rest }) {
    const [ref, inView] = useReveal();

    return (
        <Component
            ref={ref}
            className={`reveal ${inView ? "is-inview" : ""} ${className}`.trim()}
            style={{ transitionDelay: inView ? `${delay}ms` : "0ms" }}
            {...rest}
        >
            {children}
        </Component>
    );
}
