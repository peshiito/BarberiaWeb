import { useEffect, useState } from "react";
import ServiceEditModal from "../components/admin/ServiceEditModal";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import FormField from "../components/ui/FormField";
import InlineFeedback from "../components/ui/InlineFeedback";
import PageHeader from "../components/ui/PageHeader";
import Skeleton from "../components/ui/Skeleton";
import { IconScissors } from "../components/ui/icons";
import { createService, getServices, updateService } from "../services/services";
import "./AdminServices.css";

const EMPTY_FORM = { name: "", description: "", price: 0, duration_minutes: 30 };

const AdminServices = () => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [formData, setFormData] = useState(EMPTY_FORM);
    const [feedback, setFeedback] = useState(null);
    const [fieldErrors, setFieldErrors] = useState({});
    const [editingService, setEditingService] = useState(null);

    const loadServices = async () => {
        setLoading(true);
        try {
            const data = await getServices();
            setServices(data);
        } catch {
            setFeedback({ type: "error", message: "No se pudieron cargar los servicios" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadServices();
    }, []);

    const handleInputChange = e => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === "price" || name === "duration_minutes" ? Number(value) : value,
        }));
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setFeedback(null);
        setFieldErrors({});
        setCreating(true);

        try {
            await createService(formData);
            setFeedback({ type: "success", message: "Servicio creado correctamente" });
            setFormData(EMPTY_FORM);
            loadServices();
        } catch (err) {
            const details = err.response?.data?.details;
            if (Array.isArray(details) && details.length > 0) {
                setFieldErrors(Object.fromEntries(details.map(d => [d.field, d.message])));
                setFeedback({ type: "error", message: "Revisá los campos marcados." });
            } else {
                const message = err.response?.data?.error || "No se pudo crear el servicio";
                setFeedback({ type: "error", message });
            }
        } finally {
            setCreating(false);
        }
    };

    const handleToggleActive = async service => {
        try {
            await updateService(service.id, { active: !service.active });
            loadServices();
        } catch {
            setFeedback({ type: "error", message: "No se pudo actualizar el servicio" });
        }
    };

    return (
        <div>
            <PageHeader
                eyebrow="Administración"
                title="Servicios"
                description="Cargá el catálogo de cortes y precios: se refleja tal cual en la reserva de turnos de la landing."
            />

            <div className="admin-services-layout">
                <Card>
                    <h3 className="card-section-title">Nuevo servicio</h3>
                    <form onSubmit={handleSubmit} className="service-form">
                        <FormField label="Nombre" error={fieldErrors.name}>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                minLength={2}
                                maxLength={100}
                                required
                            />
                        </FormField>

                        <FormField label="Descripción" error={fieldErrors.description} hint="Opcional">
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                maxLength={255}
                                rows="2"
                            />
                        </FormField>

                        <div className="service-form-row">
                            <FormField label="Precio" error={fieldErrors.price}>
                                <div className="input-affix">
                                    <span className="input-affix-symbol">$</span>
                                    <input
                                        type="number"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleInputChange}
                                        min="0"
                                        step="0.01"
                                        required
                                    />
                                </div>
                            </FormField>
                            <FormField label="Duración" error={fieldErrors.duration_minutes} hint="En minutos">
                                <input
                                    type="number"
                                    name="duration_minutes"
                                    value={formData.duration_minutes}
                                    onChange={handleInputChange}
                                    min="1"
                                    max="600"
                                    required
                                />
                            </FormField>
                        </div>

                        {feedback && (
                            <InlineFeedback tone={feedback.type === "error" ? "error" : "success"}>
                                {feedback.message}
                            </InlineFeedback>
                        )}

                        <Button type="submit" loading={creating}>
                            Crear servicio
                        </Button>
                    </form>
                </Card>

                <Card>
                    <h3 className="card-section-title">Catálogo ({services.length})</h3>
                    {loading ? (
                        <div className="services-grid">
                            <Skeleton height="120px" />
                            <Skeleton height="120px" />
                        </div>
                    ) : services.length === 0 ? (
                        <div className="state-box">Todavía no cargaste ningún servicio.</div>
                    ) : (
                        <div className="services-grid">
                            {services.map(service => (
                                <div key={service.id} className={`service-card ${!service.active ? "is-inactive" : ""}`}>
                                    <span className="service-card-icon">
                                        <IconScissors />
                                    </span>
                                    <div className="service-card-header">
                                        <h4>{service.name}</h4>
                                        <Badge tone={service.active ? "sage" : "neutral"}>
                                            {service.active ? "Activo" : "Inactivo"}
                                        </Badge>
                                    </div>
                                    {service.description && <p className="service-card-desc">{service.description}</p>}
                                    <div className="service-card-meta">
                                        <span className="service-card-price">
                                            ${Number(service.price).toLocaleString("es-AR")}
                                        </span>
                                        <span className="service-card-duration">{service.duration_minutes} min</span>
                                    </div>
                                    <div className="service-card-actions">
                                        <Button variant="ghost" size="sm" onClick={() => setEditingService(service)}>
                                            Editar
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleToggleActive(service)}
                                        >
                                            {service.active ? "Desactivar" : "Activar"}
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            </div>

            <ServiceEditModal
                service={editingService}
                onClose={() => setEditingService(null)}
                onSaved={() => {
                    setEditingService(null);
                    loadServices();
                }}
            />
        </div>
    );
};

export default AdminServices;
