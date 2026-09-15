import { useEffect, useMemo, useState } from "react";
import BarberForm from "../components/admin/BarberForm";
import DeleteBarberModal from "../components/admin/DeleteBarberModal";
import Button from "../components/ui/Button";
import Icon from "../components/ui/Icon";
import InlineFeedback from "../components/ui/InlineFeedback";
import PageHeader from "../components/ui/PageHeader";
import Skeleton from "../components/ui/Skeleton";
import { useAuth } from "../context/AuthContext";
import { getAllUsers } from "../services/admin";
import { getServices } from "../services/services";
import { getInitials } from "../utils/format";
import "./AdminBarbers.css";

const ROLE_LABEL = { admin: "Administrador", admin_barber: "Barbero admin", barber: "Barbero" };

const AdminBarbers = () => {
    const { user: currentUser } = useAuth();

    const [users, setUsers] = useState([]);
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    // null = lista; { barber: null } = alta; { barber } = edición.
    const [editor, setEditor] = useState(null);
    const [deletingBarber, setDeletingBarber] = useState(null);

    const serviceNameById = useMemo(() => new Map(services.map(s => [s.id, s.name])), [services]);

    const loadUsers = async () => {
        setLoading(true);
        setError("");
        try {
            const data = await getAllUsers(1, 50);
            setUsers(data.data);
        } catch {
            setError("No se pudo cargar el equipo. Intentá de nuevo.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
        getServices()
            .then(list => setServices(Array.isArray(list) ? list : []))
            .catch(() => setServices([]));
    }, []);

    if (editor) {
        return (
            <BarberForm
                key={editor.barber?.id ?? "new"}
                barber={editor.barber}
                services={services}
                isSelf={editor.barber?.id === currentUser?.id}
                onCancel={() => setEditor(null)}
                onSaved={() => {
                    setEditor(null);
                    loadUsers();
                }}
            />
        );
    }

    const barbers = users.filter(u => u.role === "barber" || u.role === "admin_barber");
    const withoutServices = barbers.filter(u => !u.service_ids?.length).length;

    return (
        <div>
            <PageHeader
                eyebrow="Administración"
                title="Barberos"
                titleAccent="Equipo"
                description="Accesos al panel, servicios que ofrece cada barbero y su comisión."
                action={
                    <Button icon="person_add" onClick={() => setEditor({ barber: null })}>
                        Nuevo barbero
                    </Button>
                }
            />

            {error && (
                <div className="team-error">
                    <InlineFeedback tone="error">{error}</InlineFeedback>
                    <Button variant="secondary" icon="refresh" onClick={loadUsers}>
                        Reintentar
                    </Button>
                </div>
            )}

            {!loading && !error && (
                <div className="team-summary">
                    <div className="team-metric">
                        <span className="team-metric-value">{users.length}</span>
                        <span className="team-metric-label">Integrantes</span>
                    </div>
                    <div className="team-metric">
                        <span className="team-metric-value">{barbers.length}</span>
                        <span className="team-metric-label">Con agenda</span>
                    </div>
                    <div className={`team-metric ${withoutServices > 0 ? "is-warning" : ""}`}>
                        <span className="team-metric-value">{withoutServices}</span>
                        <span className="team-metric-label">Sin servicios asignados</span>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="team-grid">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} height="220px" />
                    ))}
                </div>
            ) : users.length === 0 && !error ? (
                <div className="team-empty">
                    <Icon name="group_add" size={36} />
                    <p>Todavía no hay nadie en el equipo.</p>
                    <Button icon="person_add" onClick={() => setEditor({ barber: null })}>
                        Crear el primero
                    </Button>
                </div>
            ) : (
                <div className="team-grid">
                    {users.map((user, index) => {
                        const isBarberRole = user.role === "barber" || user.role === "admin_barber";
                        return (
                            <article
                                key={user.id}
                                className="team-card"
                                style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
                            >
                                <div className="team-card-head">
                                    <span className="team-avatar" aria-hidden="true">
                                        {getInitials(user.first_name, user.last_name)}
                                    </span>
                                    <div className="team-card-id">
                                        <h2 className="team-name">
                                            {user.first_name} {user.last_name}
                                            {user.id === currentUser?.id && <span className="team-you">Vos</span>}
                                        </h2>
                                        <span className="team-email">{user.email}</span>
                                    </div>
                                    <span className={`team-role is-${user.role}`}>{ROLE_LABEL[user.role] || user.role}</span>
                                </div>

                                {isBarberRole ? (
                                    <>
                                        <dl className="team-stats">
                                            <div>
                                                <dt>Comisión</dt>
                                                <dd>{Number(user.earnings_split_percentage)}%</dd>
                                            </div>
                                            <div>
                                                <dt>Servicios</dt>
                                                <dd>{user.service_ids?.length || 0}</dd>
                                            </div>
                                        </dl>
                                        <div className="team-tags">
                                            {user.service_ids?.length > 0 ? (
                                                user.service_ids.map(id => (
                                                    <span key={id} className="service-tag">
                                                        {serviceNameById.get(id) || `Servicio #${id}`}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="service-tag is-warning">
                                                    <Icon name="warning" size={14} />
                                                    Sin servicios: no puede recibir turnos
                                                </span>
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    <p className="team-note">Administra el panel, sin agenda propia.</p>
                                )}

                                {(
                                    <div className="team-actions">
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            icon="edit"
                                            onClick={() => setEditor({ barber: user })}
                                            aria-label={`Editar a ${user.first_name} ${user.last_name}`}
                                        >
                                            Editar
                                        </Button>
                                        {user.id !== currentUser?.id && (
                                            <Button
                                                variant="danger"
                                                size="sm"
                                                icon="delete"
                                                onClick={() => setDeletingBarber(user)}
                                                aria-label={`Eliminar a ${user.first_name} ${user.last_name}`}
                                            >
                                                Eliminar
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </article>
                        );
                    })}
                </div>
            )}

            <DeleteBarberModal
                barber={deletingBarber}
                onClose={() => setDeletingBarber(null)}
                onDeleted={() => {
                    setDeletingBarber(null);
                    loadUsers();
                }}
            />
        </div>
    );
};

export default AdminBarbers;
