import { useEffect, useState } from "react";
import { fetchPublicBarbers } from "../services/barbers";
import { getErrorMessage } from "../utils/apiError";

export function useBarbers() {
    const [state, setState] = useState({ status: "loading", barbers: [], error: null });

    useEffect(() => {
        let mounted = true;

        fetchPublicBarbers()
            .then((barbers) => {
                if (mounted) setState({ status: "success", barbers, error: null });
            })
            .catch((error) => {
                if (mounted) setState({ status: "error", barbers: [], error: getErrorMessage(error) });
            });

        return () => {
            mounted = false;
        };
    }, []);

    return state;
}
