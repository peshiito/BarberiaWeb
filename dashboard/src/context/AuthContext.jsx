import { createContext, useContext, useState } from "react";
import { getStoredUser, login as loginService, logout as logoutService } from "../services/auth";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(getStoredUser());

    const login = async (email, password) => {
        const loggedUser = await loginService(email, password);
        setUser(loggedUser);
        return loggedUser;
    };

    const logout = () => {
        logoutService();
        setUser(null);
    };

    const value = {
        user,
        login,
        logout,
        isAuthenticated: Boolean(user),
        isAdmin: user?.role === "admin" || user?.role === "admin_barber",
        isBarber: user?.role === "barber" || user?.role === "admin_barber",
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
    return ctx;
};
