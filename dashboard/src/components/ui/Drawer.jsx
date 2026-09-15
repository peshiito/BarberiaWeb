import { useEffect, useId, useRef } from "react";
import Icon from "./Icon";
import "./Drawer.css";

const FOCUSABLE_SELECTOR =
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

// Panel lateral derecho en escritorio; hoja inferior en mobile.
const Drawer = ({ open, onClose, eyebrow, title, subtitle, footer, children, className = "" }) => {
    const panelRef = useRef(null);
    const titleId = useId();

    useEffect(() => {
        if (!open) return undefined;

        const previouslyFocused = document.activeElement;
        panelRef.current?.focus();

        const handleKeyDown = e => {
            if (e.key === "Escape") {
                onClose();
                return;
            }
            if (e.key !== "Tab") return;
            const nodes = Array.from(panelRef.current?.querySelectorAll(FOCUSABLE_SELECTOR) || []);
            if (!nodes.length) return;
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
        <div className="drawer-overlay" onMouseDown={e => e.target === e.currentTarget && onClose()}>
            <aside
                ref={panelRef}
                className={`drawer-panel ${className}`}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                tabIndex={-1}
            >
                <span className="drawer-grabber" aria-hidden="true" />
                <header className="drawer-header">
                    <div className="drawer-heading">
                        {eyebrow && <span className="drawer-eyebrow">{eyebrow}</span>}
                        <h2 id={titleId} className="drawer-title">
                            {title}
                        </h2>
                        {subtitle && <p className="drawer-subtitle">{subtitle}</p>}
                    </div>
                    <button type="button" className="drawer-close" onClick={onClose} aria-label="Cerrar">
                        <Icon name="close" size={22} />
                    </button>
                </header>
                <div className="drawer-body">{children}</div>
                {footer && <footer className="drawer-footer">{footer}</footer>}
            </aside>
        </div>
    );
};

export default Drawer;
