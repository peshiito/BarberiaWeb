import { useCallback, useEffect, useMemo, useState } from "react";
import { ClientAuthContext } from "./clientAuthContext";
import { CLIENT_KEY, CLIENT_SESSION_EXPIRED_EVENT } from "../services/api";
import {
    claimLegacyClient,
    getStoredClient,
    isClientAuthenticated,
    loginClient,
    logoutClient,
    registerClient,
    updateMyClientProfile,
    uploadClientPhoto,
} from "../services/clientAuth";

export function ClientAuthProvider({ children }) {
    const [client, setClient] = useState(getStoredClient);

    const register = useCallback(async (payload) => {
        const nextClient = await registerClient(payload);
        setClient(nextClient);
        return nextClient;
    }, []);

    const login = useCallback(async (payload) => {
        const nextClient = await loginClient(payload);
        setClient(nextClient);
        return nextClient;
    }, []);

    const claimLegacy = useCallback(async (payload) => {
        const nextClient = await claimLegacyClient(payload);
        setClient(nextClient);
        return nextClient;
    }, []);

    const updateProfile = useCallback(async (payload) => {
        const nextClient = await updateMyClientProfile(payload);
        setClient(nextClient);
        return nextClient;
    }, []);

    const uploadPhoto = useCallback(async (file) => {
        const url = await uploadClientPhoto(file);
        setClient((prev) => {
            if (!prev) return prev;
            const next = { ...prev, photo_url: url };
            localStorage.setItem(CLIENT_KEY, JSON.stringify(next));
            return next;
        });
        return url;
    }, []);

    const logout = useCallback(() => {
        logoutClient();
        setClient(null);
    }, []);

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
            register,
            login,
            claimLegacy,
            updateProfile,
            uploadPhoto,
            logout,
        }),
        [client, register, login, claimLegacy, updateProfile, uploadPhoto, logout],
    );

    return <ClientAuthContext.Provider value={value}>{children}</ClientAuthContext.Provider>;
}
