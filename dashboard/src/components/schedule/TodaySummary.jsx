import { toISODate } from "../../utils/date";
import "./TodaySummary.css";

const formatMoney = value => `$${Number(value).toLocaleString("es-AR", { minimumFractionDigits: 0 })}`;

const TodaySummary = ({ appointments }) => {
    const todayIso = toISODate(new Date());
    const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes();

    const todayAppointments = appointments
        .filter(a => a.date.slice(0, 10) === todayIso && a.status !== "cancelled")
        .sort((a, b) => a.time.localeCompare(b.time));

    const activeToday = todayAppointments.filter(a => a.status === "active");
    const completedToday = todayAppointments.filter(a => a.status === "completed");

    const nextClient = activeToday.find(a => {
        const [h, m] = a.time.split(":").map(Number);
        return h * 60 + m >= nowMinutes;
    });

    const todayIncome = todayAppointments.reduce((sum, a) => sum + Number(a.price), 0);

    return (
        <div className="today-summary">
            <div className="today-summary-stat">
                <span className="today-summary-label">Turnos hoy</span>
                <span className="today-summary-value">{todayAppointments.length}</span>
                <span className="today-summary-sub">
                    {completedToday.length} completados · {activeToday.length} pendientes
                </span>
            </div>

            <div className="today-summary-stat">
                <span className="today-summary-label">Próximo cliente</span>
                {nextClient ? (
                    <>
                        <span className="today-summary-value today-summary-value-sm">
                            {nextClient.client_first_name} {nextClient.client_last_name}
                        </span>
                        <span className="today-summary-sub">{nextClient.time.slice(0, 5)}</span>
                    </>
                ) : (
                    <span className="today-summary-sub">Sin turnos pendientes</span>
                )}
            </div>

            <div className="today-summary-stat">
                <span className="today-summary-label">Ingresos de hoy</span>
                <span className="today-summary-value">{formatMoney(todayIncome)}</span>
            </div>
        </div>
    );
};

export default TodaySummary;
