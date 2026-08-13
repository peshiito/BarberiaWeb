import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getAllUsers } from "../../services/admin";
import { getClientHistory } from "../../services/clients";
import { toISODate } from "../../utils/date";
import { formatMoney } from "../../utils/format";
import Badge from "../ui/Badge";
import InlineFeedback from "../ui/InlineFeedback";
import Modal from "../ui/Modal";
import Skeleton from "../ui/Skeleton";
import "./ClientHistoryModal.css";

const STATUS_LABEL = { active: "Activo", completed: "Completado", cancelled: "Cancelado" };
const STATUS_TONE = { active: "brass", completed: "sage", cancelled: "burgundy" };

const ClientHistoryModal = ({ clientId, onClose }) => {
    const { user, isAdmin } = useAuth();
    const open = clientId !== null;

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [appointments, setAppointments] = useState([]);
    const [barberNames, setBarberNames] = useState({});

    useEffect(() => {
        if (!open) return;
        setLoading(true);
        setError("");

        const load = async () => {
            try {
                const [history, usersResult] = await Promise.all([
                    getClientHistory(clientId),
                    isAdmin ? getAllUsers(1, 50) : Promise.resolve(null),
                ]);

                const sorted = [...history].sort((a, b) => `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`));
                setAppointments(sorted);

                if (usersResult) {
                    const map = {};
                    usersResult.data.forEach(u => {
                        map[u.id] = `${u.first_name} ${u.last_name}`;
                    });
                    setBarberNames(map);
                } else {
                    setBarberNames({ [user.id]: `${user.first_name} ${user.last_name}` });
                }
            } catch {
                setError("No se pudo cargar el historial de este cliente.");
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [open, clientId, isAdmin, user]);

    const todayIso = toISODate(new Date());
    const lastAppointment = appointments.find(a => a.date <= todayIso) || null;
    const nextAppointment =
        [...appointments]
            .filter(a => a.status === "active" && a.date >= todayIso)
            .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))[0] || null;

    return (
        <Modal open={open} onClose={onClose} title="Historial del cliente" size="lg">
            {loading ? (
                <div className="client-history-skeleton">
                    <Skeleton height="72px" />
                    <Skeleton height="220px" />
                </div>
            ) : error ? (
                <InlineFeedback tone="error">{error}</InlineFeedback>
            ) : appointments.length === 0 ? (
                <div className="state-box">
                    <span className="state-box-title">Sin turnos registrados</span>
                    <p className="state-box-text">Este cliente todavía no tiene turnos en el sistema.</p>
                </div>
            ) : (
                <>
                    <div className="client-history-summary">
                        <div className="client-history-summary-item">
                            <span className="eyebrow">Turnos totales</span>
                            <span className="client-history-summary-value">{appointments.length}</span>
                        </div>
                        <div className="client-history-summary-item">
                            <span className="eyebrow">Último turno</span>
                            <span className="client-history-summary-value">{lastAppointment ? lastAppointment.date : "—"}</span>
                        </div>
                        <div className="client-history-summary-item">
                            <span className="eyebrow">Próximo turno</span>
                            <span className="client-history-summary-value">{nextAppointment ? nextAppointment.date : "—"}</span>
                        </div>
                        <div className="client-history-summary-item">
                            <span className="eyebrow">Estado</span>
                            <Badge tone={nextAppointment ? "brass" : "neutral"}>
                                {nextAppointment ? "Con turno próximo" : "Sin turnos próximos"}
                            </Badge>
                        </div>
                    </div>

                    <div className="client-history-table-wrapper scroll-shadow-x">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Fecha</th>
                                    <th>Hora</th>
                                    <th>Barbero</th>
                                    <th>Estado</th>
                                    <th className="is-numeric">Precio</th>
                                </tr>
                            </thead>
                            <tbody>
                                {appointments.map(a => (
                                    <tr key={a.id}>
                                        <td>{a.date}</td>
                                        <td>{a.time.slice(0, 5)}</td>
                                        <td>{barberNames[a.barber_id] || `Barbero #${a.barber_id}`}</td>
                                        <td>
                                            <Badge tone={STATUS_TONE[a.status] || "neutral"}>
                                                {STATUS_LABEL[a.status] || a.status}
                                            </Badge>
                                        </td>
                                        <td className="is-numeric client-history-amount">{formatMoney(a.price)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </Modal>
    );
};

export default ClientHistoryModal;
