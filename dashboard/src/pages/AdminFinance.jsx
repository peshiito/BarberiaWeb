import { useEffect, useState } from "react";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import PageHeader from "../components/ui/PageHeader";
import Skeleton from "../components/ui/Skeleton";
import StatCard from "../components/ui/StatCard";
import { getFinancialSummary } from "../services/admin";
import { addDays, getMonday, parseDateOnly, toISODate } from "../utils/date";
import "./AdminFinance.css";

const formatMoney = value =>
    `$${Math.round(Number(value)).toLocaleString("es-AR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

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

const iconFlag = (
    <svg viewBox="0 0 20 20" fill="none">
        <path d="M5 17.5V3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M5 4h9l-2.5 3L14 10H5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
);

const sumSummary = rows =>
    rows.reduce(
        (acc, row) => ({
            total_appointments: acc.total_appointments + Number(row.total_appointments),
            total_revenue: acc.total_revenue + Number(row.total_revenue),
            total_barber_earnings: acc.total_barber_earnings + Number(row.barber_earnings),
            total_shop_earnings: acc.total_shop_earnings + Number(row.shop_earnings),
        }),
        { total_appointments: 0, total_revenue: 0, total_barber_earnings: 0, total_shop_earnings: 0 },
    );

const getPreviousPeriod = (fromIso, toIso) => {
    const from = parseDateOnly(fromIso);
    const to = parseDateOnly(toIso);
    const durationDays = Math.round((to - from) / 86400000) + 1;
    const prevTo = addDays(from, -1);
    const prevFrom = addDays(prevTo, -(durationDays - 1));
    return { prevFrom: toISODate(prevFrom), prevTo: toISODate(prevTo) };
};

const computeTrend = (current, previous) => {
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

const AdminFinance = () => {
    const [from, setFrom] = useState(() => toISODate(getMonday(new Date())));
    const [to, setTo] = useState(() => toISODate(addDays(getMonday(new Date()), 6)));
    const [summary, setSummary] = useState([]);
    const [period, setPeriod] = useState(null);
    const [prevPeriod, setPrevPeriod] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadSummary = async () => {
        setLoading(true);
        setError("");
        try {
            const { prevFrom, prevTo } = getPreviousPeriod(from, to);
            const [summaryData, prevSummaryData] = await Promise.all([
                getFinancialSummary(from, to),
                getFinancialSummary(prevFrom, prevTo),
            ]);
            setSummary(summaryData);
            setPeriod(sumSummary(summaryData));
            setPrevPeriod(sumSummary(prevSummaryData));
        } catch {
            setSummary([]);
            setPeriod(null);
            setPrevPeriod(null);
            setError("No se pudo cargar el resumen financiero.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSummary();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const activeBarbers = summary.filter(row => Number(row.total_appointments) > 0);
    const bestBarber = activeBarbers.length
        ? activeBarbers.reduce((best, row) => (Number(row.total_revenue) > Number(best.total_revenue) ? row : best))
        : null;

    const ticketPromedio =
        period && Number(period.total_appointments) > 0 ? Number(period.total_revenue) / Number(period.total_appointments) : null;
    const repartoPromedio =
        period && Number(period.total_revenue) > 0 ? (Number(period.total_barber_earnings) / Number(period.total_revenue)) * 100 : null;
    const hasActivity = period && Number(period.total_appointments) > 0;

    const revenueTrend = period && prevPeriod ? computeTrend(Number(period.total_revenue), Number(prevPeriod.total_revenue)) : null;
    const shopTrend =
        period && prevPeriod ? computeTrend(Number(period.total_shop_earnings), Number(prevPeriod.total_shop_earnings)) : null;
    const appointmentsTrend =
        period && prevPeriod ? computeTrend(Number(period.total_appointments), Number(prevPeriod.total_appointments)) : null;

    return (
        <div>
            <PageHeader eyebrow="Administración" title="Finanzas" description="Ingresos, división de ganancias y caja." />

            <Card className="finance-filters-card">
                <div className="finance-filters">
                    <div className="finance-filter-field">
                        <label>Desde</label>
                        <input type="date" value={from} onChange={e => setFrom(e.target.value)} />
                    </div>
                    <div className="finance-filter-field">
                        <label>Hasta</label>
                        <input type="date" value={to} onChange={e => setTo(e.target.value)} />
                    </div>
                    <Button variant="primary" size="md" loading={loading} onClick={loadSummary}>
                        Aplicar
                    </Button>
                </div>
            </Card>

            {error && <p className="error-message">{error}</p>}

            {loading ? (
                <div className="finance-metrics-skeleton">
                    <div className="finance-metrics-grid">
                        {Array.from({ length: 7 }).map((_, i) => (
                            <Skeleton key={i} height="112px" />
                        ))}
                    </div>
                    <Skeleton height="240px" />
                </div>
            ) : period ? (
                <>
                    <div className="finance-metrics-header">
                        <span className="finance-metrics-eyebrow">Métricas financieras</span>
                    </div>

                    <div className="finance-metrics-grid">
                        <StatCard icon={iconCoin} label="Ingresos" value={formatMoney(period.total_revenue)} trend={revenueTrend} highlight />
                        <StatCard
                            icon={iconVault}
                            label="Ganancia del local"
                            value={formatMoney(period.total_shop_earnings)}
                            trend={shopTrend}
                        />
                        <StatCard
                            icon={iconOutflow}
                            label="Pago a barberos"
                            value={`-${formatMoney(period.total_barber_earnings)}`}
                            trend={{ direction: "down", tone: "burgundy", label: "Egreso" }}
                        />
                        <StatCard
                            icon={iconScissors}
                            label="Turnos completados"
                            value={period.total_appointments}
                            trend={appointmentsTrend}
                        />
                        <StatCard
                            icon={iconReceipt}
                            label="Ticket promedio"
                            value={ticketPromedio !== null ? formatMoney(ticketPromedio) : "—"}
                        />
                        <StatCard
                            icon={iconGauge}
                            label="Reparto promedio"
                            value={repartoPromedio !== null ? `${Math.round(repartoPromedio)}%` : "—"}
                        />
                        <StatCard
                            icon={iconFlag}
                            label="Balance"
                            value={hasActivity ? "Positivo" : "Sin actividad"}
                            trend={{
                                direction: null,
                                tone: hasActivity ? "sage" : "neutral",
                                label: hasActivity ? "Con turnos completados" : "Sin turnos completados",
                            }}
                        />
                    </div>

                    <Card className="finance-table-card">
                        <div className="finance-table-wrapper">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Barbero</th>
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
                                            Number(row.total_appointments) > 0
                                                ? Number(row.total_revenue) / Number(row.total_appointments)
                                                : null;
                                        const rowSplit =
                                            Number(row.total_revenue) > 0
                                                ? (Number(row.barber_earnings) / Number(row.total_revenue)) * 100
                                                : null;

                                        return (
                                            <tr key={row.barber_id}>
                                                <td>
                                                    <span className="finance-table-name">
                                                        {row.name}
                                                        {bestBarber && row.barber_id === bestBarber.barber_id && (
                                                            <Badge tone="brass">Top</Badge>
                                                        )}
                                                    </span>
                                                </td>
                                                <td className="is-numeric">{row.total_appointments}</td>
                                                <td className="finance-table-amount is-numeric">{formatMoney(row.total_revenue)}</td>
                                                <td className="finance-table-amount is-numeric">
                                                    {rowTicket !== null ? formatMoney(rowTicket) : "—"}
                                                </td>
                                                <td className="finance-table-amount is-numeric">
                                                    {formatMoney(row.barber_earnings)}
                                                    {rowSplit !== null && (
                                                        <span className="finance-table-sub">{Math.round(rowSplit)}% reparto</span>
                                                    )}
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
            ) : null}
        </div>
    );
};

export default AdminFinance;
