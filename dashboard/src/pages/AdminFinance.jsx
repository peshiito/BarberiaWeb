import { useMemo, useState } from "react";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import ChartCanvas from "../components/ui/ChartCanvas";
import FormField from "../components/ui/FormField";
import InlineFeedback from "../components/ui/InlineFeedback";
import PageHeader from "../components/ui/PageHeader";
import Skeleton from "../components/ui/Skeleton";
import StatCard from "../components/ui/StatCard";
import { useFinanceDashboard } from "../hooks/useFinanceDashboard";
import { chartAnimation, chartColors, chartFont, chartTooltipBase, hexToRgba } from "../utils/chartTheme";
import { addDays, getMonday, toISODate } from "../utils/date";
import { computeTrend } from "../utils/finance";
import { formatMoney } from "../utils/format";
import "./AdminFinance.css";

const iconCoin = (
    <svg viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" />
        <path
            d="M10 6.5v7M8 8h2.75a1.25 1.25 0 010 2.5H9.5a1.25 1.25 0 000 2.5H12"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

const iconVault = (
    <svg viewBox="0 0 20 20" fill="none">
        <rect x="3" y="4" width="14" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M6 4V2.5M14 4V2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
);

const iconOutflow = (
    <svg viewBox="0 0 20 20" fill="none">
        <path d="M10 4v10M6 10.5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const iconScissors = (
    <svg viewBox="0 0 20 20" fill="none">
        <circle cx="5.5" cy="6" r="2" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="5.5" cy="14" r="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M7 7.3L16 15M7 12.7L16 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
);

const iconReceipt = (
    <svg viewBox="0 0 20 20" fill="none">
        <path d="M5 2.5h10v15l-2-1.3-1.5 1.3-1.5-1.3-1.5 1.3-1.5-1.3-2 1.3v-15z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M7.5 7h5M7.5 10.5h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
);

const iconGauge = (
    <svg viewBox="0 0 20 20" fill="none">
        <path d="M3 14a7 7 0 1114 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M10 14l3.5-4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
);

const defaultFrom = toISODate(getMonday(new Date()));
const defaultTo = toISODate(addDays(getMonday(new Date()), 6));

const AdminFinance = () => {
    const [draftFrom, setDraftFrom] = useState(defaultFrom);
    const [draftTo, setDraftTo] = useState(defaultTo);
    const [appliedFrom, setAppliedFrom] = useState(defaultFrom);
    const [appliedTo, setAppliedTo] = useState(defaultTo);

    const { loading, error, data, reload } = useFinanceDashboard(appliedFrom, appliedTo);

    const handleSubmit = e => {
        e.preventDefault();
        if (draftFrom === appliedFrom && draftTo === appliedTo) {
            reload();
        } else {
            setAppliedFrom(draftFrom);
            setAppliedTo(draftTo);
        }
    };

    const period = data?.period ?? null;
    const prevPeriod = data?.prevPeriod ?? null;
    const summary = data?.summary ?? [];
    const hasActivity = Boolean(period && Number(period.total_appointments) > 0);

    const activeBarbers = summary.filter(row => Number(row.total_appointments) > 0);
    const bestBarber = activeBarbers.length
        ? activeBarbers.reduce((best, row) => (Number(row.total_revenue) > Number(best.total_revenue) ? row : best))
        : null;

    const ticketPromedio =
        period && Number(period.total_appointments) > 0 ? Number(period.total_revenue) / Number(period.total_appointments) : null;
    const repartoPromedio =
        period && Number(period.total_revenue) > 0 ? (Number(period.total_barber_earnings) / Number(period.total_revenue)) * 100 : null;

    const revenueTrend = period && prevPeriod ? computeTrend(Number(period.total_revenue), Number(prevPeriod.total_revenue)) : null;
    const shopTrend = period && prevPeriod ? computeTrend(Number(period.total_shop_earnings), Number(prevPeriod.total_shop_earnings)) : null;
    const appointmentsTrend =
        period && prevPeriod ? computeTrend(Number(period.total_appointments), Number(prevPeriod.total_appointments)) : null;

    const revenueSeriesConfig = useMemo(() => {
        if (!data || !hasActivity) return null;
        const colors = chartColors();
        return {
            type: "line",
            data: {
                labels: data.series.map(s => s.label),
                datasets: [
                    {
                        label: "Ingresos",
                        data: data.series.map(s => s.total_revenue),
                        borderColor: colors.brass,
                        backgroundColor: hexToRgba(colors.brass, 0.14),
                        borderWidth: 2,
                        pointRadius: 0,
                        pointHoverRadius: 4,
                        pointBackgroundColor: colors.brass,
                        pointBorderColor: colors.bgSurface,
                        pointBorderWidth: 2,
                        tension: 0.35,
                        fill: true,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: chartAnimation(),
                interaction: { mode: "index", intersect: false },
                plugins: {
                    legend: { display: false },
                    tooltip: { ...chartTooltipBase(colors), callbacks: { label: ctx => formatMoney(ctx.parsed.y) } },
                },
                scales: {
                    x: { grid: { display: false }, ticks: { color: colors.textMuted, font: chartFont() } },
                    y: {
                        grid: { color: colors.borderSubtle },
                        ticks: { color: colors.textMuted, font: chartFont(), callback: value => formatMoney(value) },
                    },
                },
            },
        };
    }, [data, hasActivity]);

    const splitConfig = useMemo(() => {
        if (!period || !hasActivity) return null;
        const colors = chartColors();
        return {
            type: "doughnut",
            data: {
                labels: ["Gana el local", "Gana el barbero"],
                datasets: [
                    {
                        data: [period.total_shop_earnings, period.total_barber_earnings],
                        backgroundColor: [colors.sage, colors.burgundy],
                        borderColor: colors.bgSurface,
                        borderWidth: 2,
                        hoverOffset: 4,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: chartAnimation(),
                cutout: "68%",
                plugins: {
                    legend: {
                        position: "bottom",
                        labels: {
                            color: colors.textSecondary,
                            font: chartFont(12, "body"),
                            boxWidth: 10,
                            boxHeight: 10,
                            padding: 16,
                            usePointStyle: true,
                            pointStyle: "circle",
                        },
                    },
                    tooltip: {
                        ...chartTooltipBase(colors),
                        callbacks: { label: ctx => `${ctx.label}: ${formatMoney(ctx.parsed)}` },
                    },
                },
            },
        };
    }, [period, hasActivity]);

    const barberBarConfig = useMemo(() => {
        if (!summary.length || !hasActivity) return null;
        const colors = chartColors();
        const sorted = [...summary].filter(r => Number(r.total_revenue) > 0).sort((a, b) => Number(b.total_revenue) - Number(a.total_revenue));
        const maxRevenue = Math.max(...sorted.map(r => Number(r.total_revenue)), 0);
        return {
            type: "bar",
            data: {
                labels: sorted.map(r => r.name),
                datasets: [
                    {
                        data: sorted.map(r => Number(r.total_revenue)),
                        backgroundColor: sorted.map(r =>
                            Number(r.total_revenue) === maxRevenue && maxRevenue > 0 ? colors.brassBright : hexToRgba(colors.brass, 0.55),
                        ),
                        borderRadius: 4,
                        maxBarThickness: 28,
                    },
                ],
            },
            options: {
                indexAxis: "y",
                responsive: true,
                maintainAspectRatio: false,
                animation: chartAnimation(),
                plugins: {
                    legend: { display: false },
                    tooltip: { ...chartTooltipBase(colors), callbacks: { label: ctx => formatMoney(ctx.parsed.x) } },
                },
                scales: {
                    x: {
                        grid: { color: colors.borderSubtle },
                        ticks: { color: colors.textMuted, font: chartFont(), callback: value => formatMoney(value) },
                    },
                    y: { grid: { display: false }, ticks: { color: colors.textSecondary, font: chartFont(12, "body") } },
                },
            },
        };
    }, [summary, hasActivity]);

    const comparisonConfig = useMemo(() => {
        if (!period || !prevPeriod || !hasActivity) return null;
        const colors = chartColors();
        return {
            type: "bar",
            data: {
                labels: ["Ingresos", "Ganancia local", "Pago a barberos"],
                datasets: [
                    {
                        label: "Período actual",
                        data: [period.total_revenue, period.total_shop_earnings, period.total_barber_earnings],
                        backgroundColor: colors.brass,
                        borderRadius: 4,
                        maxBarThickness: 32,
                    },
                    {
                        label: "Período anterior",
                        data: [prevPeriod.total_revenue, prevPeriod.total_shop_earnings, prevPeriod.total_barber_earnings],
                        backgroundColor: colors.borderStrong,
                        borderRadius: 4,
                        maxBarThickness: 32,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: chartAnimation(),
                plugins: {
                    legend: {
                        position: "bottom",
                        labels: {
                            color: colors.textSecondary,
                            font: chartFont(12, "body"),
                            boxWidth: 10,
                            boxHeight: 10,
                            padding: 16,
                            usePointStyle: true,
                            pointStyle: "circle",
                        },
                    },
                    tooltip: {
                        ...chartTooltipBase(colors),
                        callbacks: { label: ctx => `${ctx.dataset.label}: ${formatMoney(ctx.parsed.y)}` },
                    },
                },
                scales: {
                    x: { grid: { display: false }, ticks: { color: colors.textMuted, font: chartFont(11, "body") } },
                    y: {
                        grid: { color: colors.borderSubtle },
                        ticks: { color: colors.textMuted, font: chartFont(), callback: value => formatMoney(value) },
                    },
                },
            },
        };
    }, [period, prevPeriod, hasActivity]);

    return (
        <div>
            <PageHeader eyebrow="Administración" title="Finanzas" description="Ingresos, división de ganancias y caja." />

            <Card className="finance-filters-card is-elevated">
                <form className="finance-filters" onSubmit={handleSubmit}>
                    <FormField label="Desde">
                        <input type="date" value={draftFrom} onChange={e => setDraftFrom(e.target.value)} required />
                    </FormField>
                    <FormField label="Hasta">
                        <input type="date" value={draftTo} onChange={e => setDraftTo(e.target.value)} required />
                    </FormField>
                    <Button type="submit" variant="primary" size="md" loading={loading}>
                        Aplicar
                    </Button>
                </form>
            </Card>

            {error && (
                <InlineFeedback tone="error" className="finance-error">
                    {error}
                </InlineFeedback>
            )}

            {loading ? (
                <div className="finance-metrics-skeleton">
                    <div className="finance-metrics-grid">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <Skeleton key={i} height="112px" />
                        ))}
                    </div>
                    <div className="finance-metrics-grid finance-metrics-grid-ops">
                        {Array.from({ length: 2 }).map((_, i) => (
                            <Skeleton key={i} height="112px" />
                        ))}
                    </div>
                    <div className="finance-charts-grid">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <Skeleton key={i} height="280px" />
                        ))}
                    </div>
                    <Skeleton height="240px" />
                </div>
            ) : !hasActivity ? (
                <div className="state-box">
                    <span className="state-box-title">Sin datos para este rango</span>
                    <p className="state-box-text">No hay turnos completados entre esas fechas. Probá con otro período.</p>
                </div>
            ) : (
                <>
                    <div className="finance-balance">
                        <span className="eyebrow finance-balance-label">Balance del período</span>
                        <Badge tone="sage">Positivo · con turnos completados</Badge>
                    </div>

                    <div className="finance-metrics-header">
                        <span className="eyebrow">Ingresos y reparto</span>
                    </div>
                    <div className="finance-metrics-grid">
                        <StatCard icon={iconCoin} label="Ingresos" value={formatMoney(period.total_revenue)} trend={revenueTrend} highlight />
                        <StatCard icon={iconVault} label="Ganancia del local" value={formatMoney(period.total_shop_earnings)} trend={shopTrend} />
                        <StatCard
                            icon={iconOutflow}
                            label="Pago a barberos"
                            value={`-${formatMoney(period.total_barber_earnings)}`}
                            trend={{ direction: "down", tone: "burgundy", label: "Egreso" }}
                        />
                        <StatCard icon={iconReceipt} label="Ticket promedio" value={ticketPromedio !== null ? formatMoney(ticketPromedio) : "—"} />
                    </div>

                    <div className="finance-metrics-header">
                        <span className="eyebrow">Actividad</span>
                    </div>
                    <div className="finance-metrics-grid finance-metrics-grid-ops">
                        <StatCard icon={iconScissors} label="Turnos completados" value={period.total_appointments} trend={appointmentsTrend} />
                        <StatCard
                            icon={iconGauge}
                            label="Reparto promedio"
                            value={repartoPromedio !== null ? `${Math.round(repartoPromedio)}%` : "—"}
                        />
                    </div>

                    <div className="finance-charts-grid">
                        <Card className="finance-chart-card">
                            <h3 className="card-section-title">Evolución de ingresos</h3>
                            {revenueSeriesConfig && (
                                <ChartCanvas config={revenueSeriesConfig} height={260} ariaLabel="Evolución de ingresos en el período seleccionado" />
                            )}
                        </Card>

                        <Card className="finance-chart-card">
                            <h3 className="card-section-title">Reparto local vs. barberos</h3>
                            {splitConfig && (
                                <ChartCanvas config={splitConfig} height={260} ariaLabel="Reparto de ingresos entre el local y los barberos" />
                            )}
                        </Card>

                        <Card className="finance-chart-card">
                            <h3 className="card-section-title">Ingresos por barbero</h3>
                            {barberBarConfig ? (
                                <ChartCanvas config={barberBarConfig} height={260} ariaLabel="Ingresos por barbero en el período seleccionado" />
                            ) : (
                                <p className="finance-chart-empty">Sin turnos por barbero en este período.</p>
                            )}
                        </Card>

                        <Card className="finance-chart-card">
                            <h3 className="card-section-title">Período actual vs. anterior</h3>
                            {comparisonConfig ? (
                                <ChartCanvas config={comparisonConfig} height={260} ariaLabel="Comparación del período actual contra el período anterior" />
                            ) : (
                                <p className="finance-chart-empty">Sin datos del período anterior para comparar.</p>
                            )}
                        </Card>
                    </div>

                    <Card className="finance-table-card">
                        <div className="finance-table-wrapper scroll-shadow-x">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th className="table-sticky-col">Barbero</th>
                                        <th className="is-numeric">Turnos</th>
                                        <th className="is-numeric">Ingresos</th>
                                        <th className="is-numeric">Ticket promedio</th>
                                        <th className="is-numeric">Gana el barbero</th>
                                        <th className="is-numeric">Gana el local</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {summary.map(row => {
                                        const rowTicket =
                                            Number(row.total_appointments) > 0 ? Number(row.total_revenue) / Number(row.total_appointments) : null;
                                        const rowSplit =
                                            Number(row.total_revenue) > 0 ? (Number(row.barber_earnings) / Number(row.total_revenue)) * 100 : null;

                                        return (
                                            <tr key={row.barber_id}>
                                                <td className="table-sticky-col">
                                                    <span className="finance-table-name">
                                                        {row.name}
                                                        {bestBarber && row.barber_id === bestBarber.barber_id && <Badge tone="brass">Top</Badge>}
                                                    </span>
                                                </td>
                                                <td className="is-numeric">{row.total_appointments}</td>
                                                <td className="finance-table-amount is-numeric">{formatMoney(row.total_revenue)}</td>
                                                <td className="finance-table-amount is-numeric">{rowTicket !== null ? formatMoney(rowTicket) : "—"}</td>
                                                <td className="finance-table-amount is-numeric">
                                                    {formatMoney(row.barber_earnings)}
                                                    {rowSplit !== null && <span className="finance-table-sub">{Math.round(rowSplit)}% reparto</span>}
                                                </td>
                                                <td className="finance-table-amount is-numeric">{formatMoney(row.shop_earnings)}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </>
            )}
        </div>
    );
};

export default AdminFinance;
