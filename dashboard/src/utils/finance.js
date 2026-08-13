import { addDays, getMonday, parseDateOnly, toISODate } from "./date";

export const getPreviousPeriod = (fromIso, toIso) => {
    const from = parseDateOnly(fromIso);
    const to = parseDateOnly(toIso);
    const durationDays = Math.round((to - from) / 86400000) + 1;
    const prevTo = addDays(from, -1);
    const prevFrom = addDays(prevTo, -(durationDays - 1));
    return { prevFrom: toISODate(prevFrom), prevTo: toISODate(prevTo) };
};

export const computeTrend = (current, previous) => {
    if (previous === 0) {
        return current > 0 ? { direction: "up", tone: "sage", label: "Nuevo" } : null;
    }
    const change = ((current - previous) / previous) * 100;
    if (Math.abs(change) < 1) {
        return { direction: null, tone: "neutral", label: "Sin cambios" };
    }
    const direction = change > 0 ? "up" : "down";
    const tone = direction === "up" ? "sage" : "burgundy";
    return { direction, tone, label: `${change > 0 ? "+" : ""}${Math.round(change)}%` };
};

/**
 * Elige la granularidad del gráfico de evolución según el largo del rango:
 * diaria hasta 2 semanas, semanal hasta ~3 meses, mensual más allá. Debe
 * coincidir con el criterio de `GET /admin/finance/series?bucket=...` — el
 * backend no decide la granularidad, solo agrupa con la que se le pida.
 */
export const getBucketType = (fromIso, toIso) => {
    const from = parseDateOnly(fromIso);
    const to = parseDateOnly(toIso);
    const totalDays = Math.round((to - from) / 86400000) + 1;

    if (totalDays <= 14) return "day";
    if (totalDays <= 92) return "week";
    return "month";
};

/**
 * Genera los buckets esperados para el rango (con su `key` para cruzar contra
 * la respuesta de `/admin/finance/series`) y su `label` para el eje del
 * gráfico. Semanas alineadas a lunes (misma convención que `getMonday` usa
 * en el resto de la app, y que el backend usa vía `WEEKDAY()`); meses
 * alineados a calendario. Sirve para completar en cero los buckets que el
 * backend no devuelve por no tener turnos completados — así el gráfico no
 * pierde continuidad.
 */
export const buildTimeBuckets = (fromIso, toIso) => {
    const from = parseDateOnly(fromIso);
    const to = parseDateOnly(toIso);
    if (from > to) return [];

    const bucketType = getBucketType(fromIso, toIso);

    if (bucketType === "day") {
        const totalDays = Math.round((to - from) / 86400000) + 1;
        return Array.from({ length: totalDays }, (_, i) => {
            const d = addDays(from, i);
            const iso = toISODate(d);
            return { key: iso, label: d.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit" }) };
        });
    }

    if (bucketType === "week") {
        const buckets = [];
        let weekStart = getMonday(from);
        while (weekStart <= to) {
            const bucketFrom = weekStart < from ? from : weekStart;
            buckets.push({
                key: toISODate(weekStart),
                label: bucketFrom.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit" }),
            });
            weekStart = addDays(weekStart, 7);
        }
        return buckets;
    }

    const buckets = [];
    let cursor = new Date(from.getFullYear(), from.getMonth(), 1);
    while (cursor <= to) {
        buckets.push({
            key: toISODate(cursor),
            label: cursor.toLocaleDateString("es-AR", { month: "short" }),
        });
        cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
    }
    return buckets;
};

/** Cruza los buckets esperados del rango con la respuesta (posiblemente
 * dispersa) de `/admin/finance/series`, completando en cero lo que falte. */
export const mergeSeries = (buckets, seriesData) => {
    const byKey = new Map(seriesData.map(row => [row.bucket_start, row]));
    return buckets.map(bucket => {
        const match = byKey.get(bucket.key);
        return {
            label: bucket.label,
            total_revenue: match ? Number(match.total_revenue) : 0,
            total_barber_earnings: match ? Number(match.total_barber_earnings) : 0,
            total_shop_earnings: match ? Number(match.total_shop_earnings) : 0,
            total_appointments: match ? Number(match.total_appointments) : 0,
        };
    });
};
