import { useEffect, useState } from "react";
import { fetchWeekSlots } from "../services/schedules";
import { toISODate } from "../utils/date";
import { getErrorMessage } from "../utils/apiError";

const IDLE = { status: "idle", data: null, error: null };
const LOADING = { status: "loading", data: null, error: null };

// `nonce` permite forzar un refetch (ej: tras un 409 al reservar) sin
// necesidad de que cambien barberId/weekStartDate.
export function useWeekSlots(barberId, weekStartDate, nonce = 0) {
    const key = barberId && weekStartDate ? `${barberId}:${toISODate(weekStartDate)}:${nonce}` : null;
    const [result, setResult] = useState({ key: null, ...IDLE });

    useEffect(() => {
        if (!barberId || !weekStartDate) return;
        const controller = new AbortController();
        const currentKey = `${barberId}:${toISODate(weekStartDate)}:${nonce}`;

        fetchWeekSlots(barberId, toISODate(weekStartDate), controller.signal)
            .then((data) => setResult({ key: currentKey, status: "success", data, error: null }))
            .catch((error) => {
                if (controller.signal.aborted) return;
                setResult({ key: currentKey, status: "error", data: null, error: getErrorMessage(error) });
            });

        return () => controller.abort();
    }, [barberId, weekStartDate, nonce]);

    if (!key) return IDLE;
    // Todavía no llegó la respuesta para esta combinación barbero+semana+nonce:
    // se deriva "loading" comparando claves en vez de setState dentro del efecto.
    if (result.key !== key) return LOADING;
    return result;
}
