import { useEffect } from "react";
import "./Modal.css";

const Modal = ({ open, onClose, title, children }) => {
    useEffect(() => {
        if (!open) return;

        const handleKeyDown = e => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-panel" role="dialog" aria-modal="true" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3 className="modal-title">{title}</h3>
                    <button type="button" className="modal-close" onClick={onClose} aria-label="Cerrar">
                        <svg viewBox="0 0 20 20" fill="none">
                            <path
                                d="M5 5l10 10M15 5L5 15"
                                stroke="currentColor"
                                strokeWidth="1.6"
                                strokeLinecap="round"
                            />
                        </svg>
                    </button>
                </div>
                <div className="modal-body">{children}</div>
            </div>
        </div>
    );
};

export default Modal;
