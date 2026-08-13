import { useEffect, useId, useRef } from "react";
import IconButton from "./IconButton";
import { IconClose } from "./icons";
import "./Modal.css";

const FOCUSABLE_SELECTOR =
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

const Modal = ({ open, onClose, title, children, size = "md" }) => {
    const panelRef = useRef(null);
    const titleId = useId();

    useEffect(() => {
        if (!open) return;

        const previouslyFocused = document.activeElement;
        const focusables = panelRef.current?.querySelectorAll(FOCUSABLE_SELECTOR) || [];
        (focusables[0] || panelRef.current)?.focus();

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
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            previouslyFocused?.focus?.();
        };
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                ref={panelRef}
                className={`modal-panel modal-panel-${size}`}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                tabIndex={-1}
                onClick={e => e.stopPropagation()}
            >
                <div className="modal-header">
                    <h3 className="modal-title" id={titleId}>
                        {title}
                    </h3>
                    <IconButton icon={<IconClose />} label="Cerrar" onClick={onClose} />
                </div>
                <div className="modal-body">{children}</div>
            </div>
        </div>
    );
};

export default Modal;
