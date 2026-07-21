import { useEffect, useState } from "react";
import Card from "../components/ui/Card";
import PageHeader from "../components/ui/PageHeader";
import { getFinancialSummary } from "../services/admin";
import { addDays, getMonday, toISODate } from "../utils/date";
import "./AdminFinance.css";

const formatMoney = value => `$${Number(value).toLocaleString("es-AR", { minimumFractionDigits: 0 })}`;

const AdminFinance = () => {
    const [from, setFrom] = useState(() => toISODate(getMonday(new Date())));
    const [to, setTo] = useState(() => toISODate(addDays(getMonday(new Date()), 6)));
    const [summary, setSummary] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadSummary = async () => {
        setLoading(true);
        setError("");
        try {
            const data = await getFinancialSummary(from, to);
            setSummary(data);
        } catch {
            setError("No se pudo cargar el resumen financiero.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSummary();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const totals = summary.reduce(
        (acc, row) => ({
            appointments: acc.appointments + Number(row.total_appointments),
            revenue: acc.revenue + Number(row.total_revenue),
            shop: acc.shop + Number(row.shop_earnings),
        }),
        { appointments: 0, revenue: 0, shop: 0 },
    );

    return (
        <div>
            <PageHeader
                eyebrow="Administración"
                title="Finanzas"
                description="Ingresos, división de ganancias y caja."
            />

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
                    <button className="admin-new-btn" onClick={loadSummary}>
                        Aplicar
                    </button>
                </div>
            </Card>

            {error && <p style={{ color: "var(--burgundy-bright)", margin: "var(--space-4) 0" }}>{error}</p>}

            {loading ? (
                <p style={{ color: "var(--text-secondary)" }}>Cargando...</p>
            ) : (
                <>
                    <div className="finance-summary-row">
                        <div className="finance-stat">
                            <span className="finance-stat-label">Turnos completados</span>
                            <span className="finance-stat-value">{totals.appointments}</span>
                        </div>
                        <div className="finance-stat">
                            <span className="finance-stat-label">Ingresos totales</span>
                            <span className="finance-stat-value">{formatMoney(totals.revenue)}</span>
                        </div>
                        <div className="finance-stat">
                            <span className="finance-stat-label">Ganancia del local</span>
                            <span className="finance-stat-value">{formatMoney(totals.shop)}</span>
                        </div>
                    </div>

                    <Card>
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Barbero</th>
                                    <th>Turnos</th>
                                    <th>Ingresos</th>
                                    <th>Gana el barbero</th>
                                    <th>Gana el local</th>
                                </tr>
                            </thead>
                            <tbody>
                                {summary.map(row => (
                                    <tr key={row.barber_id}>
                                        <td>{row.name}</td>
                                        <td>{row.total_appointments}</td>
                                        <td className="finance-table-amount">{formatMoney(row.total_revenue)}</td>
                                        <td className="finance-table-amount">{formatMoney(row.barber_earnings)}</td>
                                        <td className="finance-table-amount">{formatMoney(row.shop_earnings)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </Card>
                </>
            )}
        </div>
    );
};

export default AdminFinance;
