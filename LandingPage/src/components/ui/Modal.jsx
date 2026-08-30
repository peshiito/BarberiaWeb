import { useEffect, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import "./Modal.css";

const FOCUSABLE = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';
const EASE_OUT = [0.23, 1, 0.32, 1];

export default function Modal({ open, onClose, title, children, size = "md" }) {
    const dialogRef = useRef(null);
    const previouslyFocused = useRef(null);
    const reduceMotion = useReducedMotion();

    useEffect(() => {
        if (!open) return;
        previouslyFocused.current = document.activeElement;
        const dialog = dialogRef.current;
        const focusables = dialog?.querySelectorAll(FOCUSABLE);
        (focusables?.[0] || dialog)?.focus();

        function onKeyDown(e) {
            if (e.key === "Escape") {
                onClose();
                return;
            }
            if (e.key !== "Tab" || !dialog) return;
            const list = dialog.querySelectorAll(FOCUSABLE);
            if (!list.length) return;
            const first = list[0];
            const last = list[list.length - 1];
            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        }

        document.addEventListener("keydown", onKeyDown);
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", onKeyDown);
            document.body.style.overflow = "";
            previouslyFocused.current?.focus?.();
        };
    }, [open, onClose]);

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    className="modal-overlay"
                    onMouseDown={(e) => e.target === e.currentTarget && onClose()}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, transition: { duration: 0.16, ease: EASE_OUT } }}
                    transition={{ duration: 0.22, ease: EASE_OUT }}
                >
                    <motion.div
                        className={`modal-dialog modal-${size}`}
                        role="dialog"
                        aria-modal="true"
                        aria-label={title}
                        ref={dialogRef}
                        tabIndex={-1}
                        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 8 }}
                        animate={reduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
                        exit={
                            reduceMotion
                                ? { opacity: 0, transition: { duration: 0.16 } }
                                : { opacity: 0, scale: 0.96, y: 8, transition: { duration: 0.16, ease: EASE_OUT } }
                        }
                        transition={{ duration: 0.22, ease: EASE_OUT }}
                    >
                        <div className="modal-header">
                            <h3 className="modal-title">{title}</h3>
                            <button type="button" className="modal-close" onClick={onClose} aria-label="Cerrar">
                                ×
                            </button>
                        </div>
                        <div className="modal-body">{children}</div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
