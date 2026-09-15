import { createContext, useContext } from "react";
import { useHomeDashboard } from "../hooks/useHomeDashboard";
import { useAuth } from "./AuthContext";

const HomeDashboardContext = createContext(null);

// Una sola carga de las métricas del día para todo el panel: el header
// (notificaciones), la barra lateral (estado del día) y la agenda la comparten.
export const HomeDashboardProvider = ({ children }) => {
    const { user } = useAuth();
    const value = useHomeDashboard(user);
    return <HomeDashboardContext.Provider value={value}>{children}</HomeDashboardContext.Provider>;
};

export const useHomeData = () => {
    const ctx = useContext(HomeDashboardContext);
    if (!ctx) throw new Error("useHomeData debe usarse dentro de HomeDashboardProvider");
    return ctx;
};
