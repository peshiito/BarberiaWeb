import { createContext, useCallback, useContext, useRef, useState } from "react";
import "./Toast.css";

const ToastContext = createContext(null);

let idCounter = 0;

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);
    const timers = useRef({});

    const dismiss = useCallback(id => {
        setToasts(prev => prev.filter(t => t.id !== id));
        clearTimeout(timers.current[id]);
        delete timers.current[id];
    }, []);

    const showToast = useCallback(
        (message, tone = "success") => {
            const id = ++idCounter;
            setToasts(prev => [...prev, { id, message, tone }]);
            timers.current[id] = setTimeout(() => dismiss(id), 3500);
        },
        [dismiss],
    );

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="toast-stack">
                {toasts.map(t => (
                    <div key={t.id} className={`toast toast-${t.tone}`} role="status">
                        <span className="toast-message">{t.message}</span>
                        <button type="button" className="toast-close" onClick={() => dismiss(t.id)} aria-label="Cerrar">
                            ×
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error("useToast debe usarse dentro de ToastProvider");
    return ctx;
};
