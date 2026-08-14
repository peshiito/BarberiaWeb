import { useCallback, useEffect, useMemo, useState } from "react";
import { ClientAuthContext } from "./clientAuthContext";
import { CLIENT_SESSION_EXPIRED_EVENT } from "../services/api";
import {
    getStoredClient,
    isClientAuthenticated,
    logoutClient,
    registerOrLoginClient,
} from "../services/clientAuth";

export function ClientAuthProvider({ children }) {
    const [client, setClient] = useState(getStoredClient);

    const login = useCallback(async (payload) => {
        const nextClient = await registerOrLoginClient(payload);
        setClient(nextClient);
        return nextClient;
    }, []);

    const logout = useCallback(() => {
        logoutClient();
        setClient(null);
    }, []);

    // Un 401 del backend ya limpia localStorage (ver services/api.js), pero
    // sin esto el estado de React seguiría creyendo que hay sesión activa
    // hasta el próximo login/logout manual — las rutas protegidas no
    // redirigirían a /ingresar cuando el token expira en medio del uso.
    useEffect(() => {
        function handleExpired() {
            setClient(null);
        }
        window.addEventListener(CLIENT_SESSION_EXPIRED_EVENT, handleExpired);
        return () => window.removeEventListener(CLIENT_SESSION_EXPIRED_EVENT, handleExpired);
    }, []);

    const value = useMemo(
        () => ({
            client,
            isAuthenticated: Boolean(client) && isClientAuthenticated(),
            login,
            logout,
        }),
        [client, login, logout],
    );

    return <ClientAuthContext.Provider value={value}>{children}</ClientAuthContext.Provider>;
}
