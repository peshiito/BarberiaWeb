import { useEffect, useState } from "react";
import DeleteBarberModal from "../components/admin/DeleteBarberModal";
import EditBarberModal from "../components/admin/EditBarberModal";
import SpecialtiesInput from "../components/admin/SpecialtiesInput";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import FormField from "../components/ui/FormField";
import InlineFeedback from "../components/ui/InlineFeedback";
import PageHeader from "../components/ui/PageHeader";
import Skeleton from "../components/ui/Skeleton";
import { useAuth } from "../context/AuthContext";
import { createBarber, getAllUsers } from "../services/admin";
import "./AdminBarbers.css";

const EMPTY_FORM = {
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    role: "barber",
    bio: "",
    earnings_split_percentage: 50,
    phone: "",
    specialties: [],
    social_media: "",
    birth_date: "",
    address: "",
};

const ROLE_TONE = { admin: "brass", admin_barber: "brass", barber: "sage" };
const ROLE_LABEL = { admin: "Administrador", admin_barber: "Barbero admin", barber: "Barbero" };

const AdminBarbers = () => {
    const { user: currentUser } = useAuth();
    const isPureAdmin = currentUser?.role === "admin";

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [formData, setFormData] = useState(EMPTY_FORM);
    const [feedback, setFeedback] = useState(null);
    const [fieldErrors, setFieldErrors] = useState({});
    const [editingBarber, setEditingBarber] = useState(null);
    const [deletingBarber, setDeletingBarber] = useState(null);

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
            [name]: name === "earnings_split_percentage" ? Number(value) : value,
        }));
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setFeedback(null);
        setFieldErrors({});
        setCreating(true);

        if (!formData.email || !formData.password) {
            setFeedback({ type: "error", message: "Email y contraseña son requeridos" });
            setCreating(false);
            return;
        }

        try {
            // Campos opcionales con formato estricto (ej. birth_date) fallan
            // la validación Zod si van como string vacío en vez de ausentes.
            const { phone, social_media, birth_date, address, specialties, ...rest } = formData;
            const payload = {
                ...rest,
                ...(phone && { phone }),
                ...(social_media && { social_media }),
                ...(birth_date && { birth_date }),
                ...(address && { address }),
                ...(specialties.length > 0 && { specialties }),
            };
            await createBarber(payload);
            setFeedback({ type: "success", message: "Barbero creado correctamente" });
            setFormData(EMPTY_FORM);
            loadUsers();
        } catch (err) {
            const details = err.response?.data?.details;
            if (Array.isArray(details) && details.length > 0) {
                setFieldErrors(Object.fromEntries(details.map(d => [d.field, d.message])));
                setFeedback({ type: "error", message: "Revisá los campos marcados." });
            } else {
                const message = err.response?.data?.error || "No se pudo crear el barbero";
                setFeedback({ type: "error", message });
            }
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
                    <h3 className="card-section-title">Crear nuevo barbero</h3>
                    <form onSubmit={handleSubmit} className="barber-form">
                        <div className="barber-form-row">
                            <FormField label="Nombre" error={fieldErrors.first_name}>
                                <input
                                    type="text"
                                    name="first_name"
                                    value={formData.first_name}
                                    onChange={handleInputChange}
                                    minLength={2}
                                    maxLength={100}
                                    required
                                />
                            </FormField>
                            <FormField label="Apellido" error={fieldErrors.last_name}>
                                <input
                                    type="text"
                                    name="last_name"
                                    value={formData.last_name}
                                    onChange={handleInputChange}
                                    minLength={2}
                                    maxLength={100}
                                    required
                                />
                            </FormField>
                        </div>

                        <FormField label="Email" error={fieldErrors.email}>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                required
                            />
                        </FormField>

                        <FormField label="Contraseña" error={fieldErrors.password} hint="Mínimo 6 caracteres">
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                minLength={6}
                                maxLength={100}
                                required
                            />
                        </FormField>

                        <FormField
                            label="Rol"
                            error={fieldErrors.role}
                            hint={isPureAdmin ? undefined : "Solo un administrador puede crear otros administradores"}
                        >
                            <select name="role" value={formData.role} onChange={handleInputChange}>
                                <option value="barber">Barbero</option>
                                {isPureAdmin && <option value="admin_barber">Barbero admin</option>}
                                {isPureAdmin && <option value="admin">Administrador</option>}
                            </select>
                        </FormField>

                        {formData.role !== "admin" && (
                            <FormField label="Porcentaje de división" error={fieldErrors.earnings_split_percentage}>
                                <input
                                    type="number"
                                    name="earnings_split_percentage"
                                    value={formData.earnings_split_percentage}
                                    onChange={handleInputChange}
                                    min="0"
                                    max="100"
                                />
                            </FormField>
                        )}

                        <FormField label="Bio" error={fieldErrors.bio}>
                            <textarea
                                name="bio"
                                value={formData.bio}
                                onChange={handleInputChange}
                                maxLength={1000}
                                rows="3"
                            />
                        </FormField>

                        <details className="additional-fields">
                            <summary>Datos adicionales (opcional)</summary>
                            <div className="additional-fields-body">
                                <FormField label="Teléfono" error={fieldErrors.phone}>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        maxLength={30}
                                    />
                                </FormField>
                                <FormField label="Especialidades" error={fieldErrors.specialties}>
                                    <SpecialtiesInput
                                        value={formData.specialties}
                                        onChange={specialties => setFormData(prev => ({ ...prev, specialties }))}
                                    />
                                </FormField>
                                <FormField label="Redes sociales" error={fieldErrors.social_media} hint="Ej: @usuario en Instagram">
                                    <input
                                        type="text"
                                        name="social_media"
                                        value={formData.social_media}
                                        onChange={handleInputChange}
                                        maxLength={150}
                                    />
                                </FormField>
                                <div className="barber-form-row">
                                    <FormField label="Fecha de nacimiento" error={fieldErrors.birth_date}>
                                        <input
                                            type="date"
                                            name="birth_date"
                                            value={formData.birth_date}
                                            onChange={handleInputChange}
                                        />
                                    </FormField>
                                    <FormField label="Dirección" error={fieldErrors.address}>
                                        <input
                                            type="text"
                                            name="address"
                                            value={formData.address}
                                            onChange={handleInputChange}
                                            maxLength={255}
                                        />
                                    </FormField>
                                </div>
                            </div>
                        </details>

                        {feedback && (
                            <InlineFeedback tone={feedback.type === "error" ? "error" : "success"}>
                                {feedback.message}
                            </InlineFeedback>
                        )}

                        <Button type="submit" loading={creating}>
                            Crear barbero
                        </Button>
                    </form>
                </Card>

                <Card>
                    <h3 className="card-section-title">Barberos existentes ({users.length})</h3>
                    {loading ? (
                        <div className="barbers-grid">
                            <Skeleton height="112px" />
                            <Skeleton height="112px" />
                        </div>
                    ) : users.length === 0 ? (
                        <div className="state-box">No hay barberos registrados.</div>
                    ) : (
                        <div className="barbers-grid">
                            {users.map(user => (
                                <div key={user.id} className="barber-card">
                                    <div className="barber-card-head">
                                        <span className="avatar-monogram barber-avatar">
                                            {user.first_name[0]}
                                            {user.last_name[0]}
                                        </span>
                                        <div className="barber-info">
                                            <h4>{user.first_name} {user.last_name}</h4>
                                            <p className="barber-email">{user.email}</p>
                                        </div>
                                    </div>
                                    <div className="barber-meta">
                                        <Badge tone="neutral">ID: {user.id}</Badge>
                                        <Badge tone={ROLE_TONE[user.role] || "neutral"}>
                                            {ROLE_LABEL[user.role] || user.role}
                                        </Badge>
                                        {(user.role === "barber" || user.role === "admin_barber") && (
                                            <Badge tone="sage">{Number(user.earnings_split_percentage)}%</Badge>
                                        )}
                                    </div>
                                    {user.specialties && (
                                        <div className="specialty-chip-list barber-card-specialties">
                                            {user.specialties.split(",").map(specialty => (
                                                <span key={specialty} className="specialty-chip">
                                                    {specialty}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                    {(user.role !== "admin" || isPureAdmin) && (
                                        <div className="barber-card-actions">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="barber-card-edit"
                                                onClick={() => setEditingBarber(user)}
                                            >
                                                Editar
                                            </Button>
                                            {user.id !== currentUser?.id && (
                                                <Button
                                                    variant="danger"
                                                    size="sm"
                                                    onClick={() => setDeletingBarber(user)}
                                                >
                                                    Eliminar
                                                </Button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            </div>

            <EditBarberModal
                barber={editingBarber}
                isPureAdmin={isPureAdmin}
                isSelf={editingBarber?.id === currentUser?.id}
                onClose={() => setEditingBarber(null)}
                onSaved={() => {
                    setEditingBarber(null);
                    loadUsers();
                }}
            />

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
