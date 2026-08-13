import { useCallback, useEffect, useState } from "react";
import { getFinancialPeriod, getFinancialSeries, getFinancialSummary } from "../services/admin";
import { buildTimeBuckets, getBucketType, getPreviousPeriod, mergeSeries } from "../utils/finance";

export const useFinanceDashboard = (from, to) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [data, setData] = useState(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError("");

        const { prevFrom, prevTo } = getPreviousPeriod(from, to);
        const bucketType = getBucketType(from, to);
        const buckets = buildTimeBuckets(from, to);

        // 4 requests fijas sin importar el largo del rango (antes: hasta ~17
        // en paralelo, uno por cada día/semana/mes del gráfico de evolución
        // — suficiente para acercarse al rate-limit de staff con uso
        // normal-intensivo). El backend agrega la serie en una sola query.
        const [summaryResult, periodResult, prevPeriodResult, seriesResult] = await Promise.allSettled([
            getFinancialSummary(from, to),
            getFinancialPeriod(from, to),
            getFinancialPeriod(prevFrom, prevTo),
            getFinancialSeries(from, to, bucketType),
        ]);

        if (summaryResult.status !== "fulfilled" || periodResult.status !== "fulfilled") {
            setData(null);
            setError("No se pudo cargar el resumen financiero.");
            setLoading(false);
            return;
        }

        const summary = summaryResult.value;
        const period = periodResult.value;
        const prevPeriod = prevPeriodResult.status === "fulfilled" ? prevPeriodResult.value : null;
        const series = seriesResult.status === "fulfilled" ? mergeSeries(buckets, seriesResult.value.data) : [];

        setData({ summary, period, prevPeriod, series });
        setLoading(false);
    }, [from, to]);

    useEffect(() => {
        load();
    }, [load]);

    return { loading, error, data, reload: load };
};
