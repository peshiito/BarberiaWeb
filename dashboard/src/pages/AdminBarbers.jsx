import { useEffect, useState } from "react";
import Badge from "../components/ui/Badge";
import Card from "../components/ui/Card";
import FormField from "../components/ui/FormField";
import PageHeader from "../components/ui/PageHeader";
import { createBarber, getAllUsers } from "../services/admin";
import "./AdminBarbers.css";

const AdminBarbers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        role: "barber",
        bio: "",
        service_price: 0,
        earnings_split_percentage: 50,
    });
    const [feedback, setFeedback] = useState(null);

    const loadUsers = async () => {
        setLoading(true);
        try {
            const data = await getAllUsers(1, 50);
            setUsers(data.data);
        } catch {
            setFeedback({ type: "error", message: "No se pudieron cargar los usuarios" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const handleInputChange = e => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === "service_price" || name === "earnings_split_percentage" ? Number(value) : value,
        }));
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setFeedback(null);
        setCreating(true);

        if (!formData.email || !formData.password) {
            setFeedback({ type: "error", message: "Email y contraseña son requeridos" });
            setCreating(false);
            return;
        }

        try {
            await createBarber(formData);
            setFeedback({ type: "success", message: "Barbero creado correctamente" });
            setFormData({
                first_name: "",
                last_name: "",
                email: "",
                password: "",
                role: "barber",
                bio: "",
                service_price: 0,
                earnings_split_percentage: 50,
            });
            loadUsers();
        } catch (err) {
            const message = err.response?.data?.error || "No se pudo crear el barbero";
            setFeedback({ type: "error", message });
        } finally {
            setCreating(false);
        }
    };

    return (
        <div>
            <PageHeader
                eyebrow="Administración"
                title="Barberos"
                description="Gestioná el equipo de la barbería y los barberos registrados."
            />

            <div className="admin-barbers-layout">
                <Card>
                    <h3 className="admin-section-title">Crear nuevo barbero</h3>
                    <form onSubmit={handleSubmit} className="barber-form">
                        <div className="barber-form-row">
                            <FormField label="Nombre">
                                <input
                                    type="text"
                                    name="first_name"
                                    value={formData.first_name}
                                    onChange={handleInputChange}
                                    required
                                />
                            </FormField>
                            <FormField label="Apellido">
                                <input
                                    type="text"
                                    name="last_name"
                                    value={formData.last_name}
                                    onChange={handleInputChange}
                                    required
                                />
                            </FormField>
                        </div>

                        <FormField label="Email">
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                required
                            />
                        </FormField>

                        <FormField label="Contraseña">
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                required
                            />
                        </FormField>

                        <div className="barber-form-row">
                            <FormField label="Precio del servicio">
                                <input
                                    type="number"
                                    name="service_price"
                                    value={formData.service_price}
                                    onChange={handleInputChange}
                                    min="0"
                                    step="0.01"
                                />
                            </FormField>
                            <FormField label="Porcentaje de división">
                                <input
                                    type="number"
                                    name="earnings_split_percentage"
                                    value={formData.earnings_split_percentage}
                                    onChange={handleInputChange}
                                    min="0"
                                    max="100"
                                />
                            </FormField>
                        </div>

                        <FormField label="Bio">
                            <textarea
                                name="bio"
                                value={formData.bio}
                                onChange={handleInputChange}
                                rows="3"
                            />
                        </FormField>

                        {feedback && (
                            <p className={`feedback ${feedback.type === "error" ? "is-error" : "is-success"}`}>{feedback.message}</p>
                        )}

                        <button className="barber-submit-btn" type="submit" disabled={creating}>
                            {creating ? "Creando..." : "Crear barbero"}
                        </button>
                    </form>
                </Card>

                <Card>
                    <h3 className="admin-section-title">Barberos existentes ({users.length})</h3>
                    {loading ? (
                        <p style={{ color: "var(--text-secondary)" }}>Cargando...</p>
                    ) : users.length === 0 ? (
                        <p style={{ color: "var(--text-secondary)" }}>No hay barberos registrados.</p>
                    ) : (
                        <div className="barbers-grid">
                            {users.map(user => (
                                <div key={user.id} className="barber-card">
                                    <div className="barber-info">
                                        <h4>{user.first_name} {user.last_name}</h4>
                                        <p className="barber-email">{user.email}</p>
                                        <div className="barber-meta">
                                            <Badge tone="neutral">ID: {user.id}</Badge>
                                            <Badge tone="blue">{user.role}</Badge>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default AdminBarbers;
