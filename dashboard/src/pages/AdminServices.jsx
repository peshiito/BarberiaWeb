import { useEffect, useMemo, useState } from "react";
import ServiceForm from "../components/admin/ServiceForm";
import Button from "../components/ui/Button";
import Icon from "../components/ui/Icon";
import InlineFeedback from "../components/ui/InlineFeedback";
import PageHeader from "../components/ui/PageHeader";
import Skeleton from "../components/ui/Skeleton";
import { useToast } from "../components/ui/Toast";
import { getAllUsers } from "../services/admin";
import { getServices, updateService } from "../services/services";
import { formatMoney } from "../utils/format";
import "./ServiceCatalog.css";

const AdminServices = () => {
    const { showToast } = useToast();
    const [services, setServices] = useState([]);
    const [users, setUsers] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    // null = catálogo; { service: null } = alta; { service } = edición.
    const [editor, setEditor] = useState(null);
    const [togglingId, setTogglingId] = useState(null);

    const loadServices = async () => {
        setLoading(true);
        setError("");
        try {
            const data = await getServices();
            setServices(Array.isArray(data) ? data : []);
        } catch {
            setError("No se pudo cargar el catálogo. Intentá de nuevo.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadServices();
        getAllUsers(1, 50)
            .then(res => setUsers(res.data))
            .catch(() => setUsers(null));
    }, []);

    // Cuántos barberos ofrecen cada servicio (null si no se pudo consultar).
    const barbersByService = useMemo(() => {
        if (!users) return null;
        const counts = new Map();
        users.forEach(u => (u.service_ids || []).forEach(id => counts.set(id, (counts.get(id) || 0) + 1)));
        return counts;
    }, [users]);

    const handleToggleActive = async service => {
        setTogglingId(service.id);
        try {
            await updateService(service.id, { active: !service.active });
            showToast(service.active ? `“${service.name}” quedó oculto en la reserva.` : `“${service.name}” volvió a la reserva.`);
            await loadServices();
        } catch {
            showToast("No se pudo actualizar el servicio.", "error");
        } finally {
            setTogglingId(null);
        }
    };

    if (editor) {
        return (
            <ServiceForm
                key={editor.service?.id ?? "new"}
                service={editor.service}
                barbersOffering={
                    editor.service && barbersByService ? barbersByService.get(editor.service.id) || 0 : null
                }
                onCancel={() => setEditor(null)}
                onSaved={() => {
                    setEditor(null);
                    loadServices();
                }}
            />
        );
    }

    const activeServices = services.filter(s => s.active);
    const average = (list, pick) => (list.length ? list.reduce((sum, s) => sum + Number(pick(s)), 0) / list.length : null);
    const avgPrice = average(activeServices, s => s.price);
    const avgDuration = average(activeServices, s => s.duration_minutes);

    return (
        <div>
            <PageHeader
                eyebrow="Administración"
                title="Servicios"
                titleAccent="Tarifas"
                description="El catálogo de cortes y precios: se refleja tal cual en la reserva online."
                action={
                    <Button icon="add" onClick={() => setEditor({ service: null })}>
                        Nuevo servicio
                    </Button>
                }
            />

            {error && (
                <div className="catalog-error">
                    <InlineFeedback tone="error">{error}</InlineFeedback>
                    <Button variant="secondary" icon="refresh" onClick={loadServices}>
                        Reintentar
                    </Button>
                </div>
            )}

            {!loading && !error && services.length > 0 && (
                <div className="catalog-summary">
                    <div className="catalog-metric">
                        <span className="catalog-metric-label">Activos en la reserva</span>
                        <span className="catalog-metric-value">
                            {activeServices.length}
                            <span className="catalog-metric-unit">de {services.length}</span>
                        </span>
                    </div>
                    <div className="catalog-metric">
                        <span className="catalog-metric-label">Precio promedio</span>
                        <span className="catalog-metric-value is-accent">
                            {avgPrice === null ? "—" : formatMoney(Math.round(avgPrice))}
                        </span>
                    </div>
                    <div className="catalog-metric">
                        <span className="catalog-metric-label">Duración promedio</span>
                        <span className="catalog-metric-value">
                            {avgDuration === null ? "—" : Math.round(avgDuration)}
                            <span className="catalog-metric-unit">min</span>
                        </span>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="catalog-grid">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} height="200px" />
                    ))}
                </div>
            ) : services.length === 0 && !error ? (
                <div className="catalog-empty">
                    <Icon name="content_cut" size={36} />
                    <p>Todavía no cargaste ningún servicio.</p>
                    <Button icon="add" onClick={() => setEditor({ service: null })}>
                        Crear el primero
                    </Button>
                </div>
            ) : (
                <div className="catalog-grid">
                    {services.map((service, index) => {
                        const barbers = barbersByService ? barbersByService.get(service.id) || 0 : null;
                        return (
                            <article
                                key={service.id}
                                className={`catalog-card ${service.active ? "" : "is-inactive"}`}
                                style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
                            >
                                <div className="catalog-card-head">
                                    <span className="catalog-card-icon" aria-hidden="true">
                                        <Icon name="content_cut" size={20} />
                                    </span>
                                    <h2 className="catalog-card-name">{service.name}</h2>
                                    <span className={`catalog-status ${service.active ? "is-on" : ""}`}>
                                        {service.active ? "Activo" : "Oculto"}
                                    </span>
                                </div>

                                <p className="catalog-card-desc">{service.description || "Sin descripción."}</p>

                                <div className="catalog-card-meta">
                                    <span className="catalog-card-price">{formatMoney(service.price)}</span>
                                    <span className="catalog-card-chip">
                                        <Icon name="schedule" size={14} />
                                        {service.duration_minutes} min
                                    </span>
                                    {barbers !== null && (
                                        <span className={`catalog-card-chip ${barbers === 0 ? "is-warning" : ""}`}>
                                            <Icon name="group" size={14} />
                                            {barbers === 0 ? "Sin barberos" : `${barbers} ${barbers === 1 ? "barbero" : "barberos"}`}
                                        </span>
                                    )}
                                </div>

                                <div className="catalog-card-actions">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        icon={service.active ? "visibility_off" : "visibility"}
                                        loading={togglingId === service.id}
                                        onClick={() => handleToggleActive(service)}
                                    >
                                        {service.active ? "Ocultar" : "Activar"}
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        icon="edit"
                                        onClick={() => setEditor({ service })}
                                        aria-label={`Editar ${service.name}`}
                                    >
                                        Editar
                                    </Button>
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default AdminServices;
