import { useEffect, useId, useRef } from "react";
import Icon from "./Icon";
import "./Modal.css";

const FOCUSABLE_SELECTOR =
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

const Modal = ({
    open,
    onClose,
    title,
    eyebrow,
    subtitle,
    badge,
    icon,
    footer,
    children,
    size = "md",
    accent = true,
    className = "",
}) => {
    const panelRef = useRef(null);
    const titleId = useId();

    useEffect(() => {
        if (!open) return undefined;

        const previouslyFocused = document.activeElement;
        const focusables = panelRef.current?.querySelectorAll(FOCUSABLE_SELECTOR) || [];
        // El primer foco va al primer control del cuerpo, no al botón de cerrar.
        const firstBodyControl = Array.from(focusables).find(node => !node.closest(".modal-header"));
        (firstBodyControl || panelRef.current)?.focus();

        const handleKeyDown = e => {
            if (e.key === "Escape") {
                onClose();
                return;
            }

            if (e.key !== "Tab") return;

            const nodes = Array.from(panelRef.current?.querySelectorAll(FOCUSABLE_SELECTOR) || []);
            if (nodes.length === 0) return;

            const first = nodes[0];
            const last = nodes[nodes.length - 1];

            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = previousOverflow;
            previouslyFocused?.focus?.();
        };
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div className="modal-overlay" onMouseDown={e => e.target === e.currentTarget && onClose()}>
            <div
                ref={panelRef}
                className={`modal-panel modal-panel-${size} ${accent ? "has-accent" : ""} ${className}`}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                tabIndex={-1}
            >
                <div className="modal-header">
                    <div className="modal-heading">
                        {icon && (
                            <span className="modal-heading-icon">
                                <Icon name={icon} size={22} />
                            </span>
                        )}
                        <div className="modal-heading-text">
                            {eyebrow && <span className="modal-eyebrow">{eyebrow}</span>}
                            <div className="modal-title-row">
                                <h2 className="modal-title" id={titleId}>
                                    {title}
                                </h2>
                                {badge}
                            </div>
                            {subtitle && <p className="modal-subtitle">{subtitle}</p>}
                        </div>
                    </div>
                    <button type="button" className="modal-close" onClick={onClose} aria-label="Cerrar">
                        <Icon name="close" size={22} />
                    </button>
                </div>
                <div className="modal-body">{children}</div>
                {footer && <div className="modal-footer">{footer}</div>}
            </div>
        </div>
    );
};

export default Modal;
