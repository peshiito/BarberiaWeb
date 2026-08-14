import { useContext } from "react";
import { ClientAuthContext } from "../context/clientAuthContext";

export function useClientAuth() {
    const ctx = useContext(ClientAuthContext);
    if (!ctx) throw new Error("useClientAuth debe usarse dentro de ClientAuthProvider");
    return ctx;
}
