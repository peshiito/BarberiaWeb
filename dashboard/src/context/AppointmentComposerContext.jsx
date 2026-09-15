import { createContext, useCallback, useContext, useMemo, useState } from "react";
import AppointmentFormModal from "../components/schedule/AppointmentFormModal";
import { useHomeData } from "./HomeDashboardContext";

const AppointmentComposerContext = createContext(null);

// "Nuevo turno" se abre desde el header, la barra inferior, la agenda y
// clientes. `version` sube en cada guardado para que las vistas recarguen.
export const AppointmentComposerProvider = ({ children }) => {
    const { reload } = useHomeData();
    const [state, setState] = useState(null);
    const [version, setVersion] = useState(0);

    const openComposer = useCallback((options = {}) => setState({ mode: "create", ...options }), []);
    const closeComposer = useCallback(() => setState(null), []);
    const handleSaved = useCallback(() => {
        setState(null);
        setVersion(v => v + 1);
        reload();
    }, [reload]);

    const value = useMemo(() => ({ openComposer, closeComposer, version }), [openComposer, closeComposer, version]);

    return (
        <AppointmentComposerContext.Provider value={value}>
            {children}
            <AppointmentFormModal
                open={Boolean(state)}
                mode={state?.mode || "create"}
                appointment={state?.appointment || null}
                initialClient={state?.initialClient || null}
                initialBarberId={state?.initialBarberId || null}
                initialDate={state?.initialDate || null}
                initialTime={state?.initialTime || null}
                onClose={closeComposer}
                onSaved={handleSaved}
            />
        </AppointmentComposerContext.Provider>
    );
};

export const useAppointmentComposer = () => {
    const ctx = useContext(AppointmentComposerContext);
    if (!ctx) throw new Error("useAppointmentComposer debe usarse dentro de AppointmentComposerProvider");
    return ctx;
};
