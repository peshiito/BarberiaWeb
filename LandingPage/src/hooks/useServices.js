import { useEffect, useState } from "react";
import { fetchPublicServices } from "../services/services";
import { getErrorMessage } from "../utils/apiError";

export function useServices() {
    const [state, setState] = useState({ status: "loading", services: [], error: null });

    useEffect(() => {
        let mounted = true;

        fetchPublicServices()
            .then((services) => {
                if (mounted) setState({ status: "success", services, error: null });
            })
            .catch((error) => {
                if (mounted) setState({ status: "error", services: [], error: getErrorMessage(error) });
            });

        return () => {
            mounted = false;
        };
    }, []);

    return state;
}
