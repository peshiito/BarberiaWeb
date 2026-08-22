import { useEffect, useState } from "react";
import { updateBarber } from "../../services/admin";
import { getServices, getServicesByBarber } from "../../services/services";
import Button from "../ui/Button";
import FormField from "../ui/FormField";
import InlineFeedback from "../ui/InlineFeedback";
import Modal from "../ui/Modal";
import SpecialtiesInput from "./SpecialtiesInput";
import "./EditBarberModal.css";

const ROLE_OPTIONS = [
    { value: "barber", label: "Barbero" },
    { value: "admin_barber", label: "Barbero admin" },
    { value: "admin", label: "Administrador" },
];

const EditBarberModal = ({ barber, isPureAdmin, isSelf, onClose, onSaved }) => {
    const [form, setForm] = useState({
        first_name: "",
        last_name: "",
        bio: "",
        role: "barber",
        phone: "",
        specialties: [],
        social_media: "",
        birth_date: "",
        address: "",
    });
    const [earningsSplit, setEarningsSplit] = useState(50);
    const [allServices, setAllServices] = useState([]);
    const [selectedServiceIds, setSelectedServiceIds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const hasBarberAttributes = form.role === "barber" || form.role === "admin_barber";

    useEffect(() => {
        if (!barber) return;
        setError("");
        setForm({
            first_name: barber.first_name,
            last_name: barber.last_name,
            bio: barber.bio || "",
            role: barber.role,
            phone: barber.phone || "",
            specialties: barber.specialties ? barber.specialties.split(",").filter(Boolean) : [],
            social_media: barber.social_media || "",
            birth_date: barber.birth_date ? barber.birth_date.slice(0, 10) : "",
            address: barber.address || "",
        });
        setEarningsSplit(Number(barber.earnings_split_percentage) || 0);

        // Se piden igual aunque el rol actual sea "admin": si en este mismo
        // modal lo pasan a barbero, la sección de servicios ya tiene con qué
        // mostrarse sin depender de una segunda vuelta de edición.
        setLoading(true);
        Promise.all([getServices(), getServicesByBarber(barber.id)])
            .then(([services, barberServices]) => {
                setAllServices(services);
                setSelectedServiceIds(barberServices.map(s => s.id));
            })
            .catch(() => setError("No se pudieron cargar los servicios"))
            .finally(() => setLoading(false));
    }, [barber]);

    const handleFieldChange = e => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const toggleService = id => {
        setSelectedServiceIds(prev => (prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]));
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setSaving(true);
        setError("");
        try {
            const payload = {
                first_name: form.first_name,
                last_name: form.last_name,
                bio: form.bio,
                // Campos opcionales con formato estricto (ej. birth_date)
                // fallan la validación Zod si van como string vacío en vez
                // de ausentes.
                ...(form.phone && { phone: form.phone }),
                ...(form.social_media && { social_media: form.social_media }),
                ...(form.birth_date && { birth_date: form.birth_date }),
                ...(form.address && { address: form.address }),
                ...(form.specialties.length > 0 && { specialties: form.specialties }),
            };
            if (isPureAdmin && !isSelf) {
                payload.role = form.role;
            }
            if (hasBarberAttributes) {
                payload.earnings_split_percentage = earningsSplit;
                payload.service_ids = selectedServiceIds;
            }
            await updateBarber(barber.id, payload);
            onSaved();
        } catch (err) {
            setError(err.response?.data?.error || "No se pudo guardar el usuario");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal open={Boolean(barber)} onClose={onClose} title={barber ? `Editar a ${barber.first_name} ${barber.last_name}` : ""}>
            {loading ? (
                <p className="edit-barber-loading">Cargando…</p>
            ) : (
                <form className="edit-barber-form" onSubmit={handleSubmit}>
                    <div className="edit-barber-row">
                        <FormField label="Nombre">
                            <input
                                type="text"
                                name="first_name"
                                value={form.first_name}
                                onChange={handleFieldChange}
                                minLength={2}
                                maxLength={100}
                                required
                            />
                        </FormField>
                        <FormField label="Apellido">
                            <input
                                type="text"
                                name="last_name"
                                value={form.last_name}
                                onChange={handleFieldChange}
                                minLength={2}
                                maxLength={100}
                                required
                            />
                        </FormField>
                    </div>

                    <FormField
                        label="Rol"
                        hint={
                            isSelf
                                ? "No podés cambiar tu propio rol"
                                : !isPureAdmin
                                  ? "Solo un administrador puede cambiar roles"
                                  : undefined
                        }
                    >
                        {isPureAdmin && !isSelf ? (
                            <select name="role" value={form.role} onChange={handleFieldChange}>
                                {ROLE_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <p className="edit-barber-static-value">
                                {ROLE_OPTIONS.find(opt => opt.value === form.role)?.label || form.role}
                            </p>
                        )}
                    </FormField>

                    <FormField label="Bio" hint="Opcional">
                        <textarea name="bio" value={form.bio} onChange={handleFieldChange} maxLength={1000} rows="3" />
                    </FormField>

                    <details className="additional-fields">
                        <summary>Datos adicionales (opcional)</summary>
                        <div className="additional-fields-body">
                            <FormField label="Teléfono">
                                <input type="tel" name="phone" value={form.phone} onChange={handleFieldChange} maxLength={30} />
                            </FormField>
                            <FormField label="Especialidades">
                                <SpecialtiesInput
                                    value={form.specialties}
                                    onChange={specialties => setForm(prev => ({ ...prev, specialties }))}
                                />
                            </FormField>
                            <FormField label="Redes sociales" hint="Ej: @usuario en Instagram">
                                <input
                                    type="text"
                                    name="social_media"
                                    value={form.social_media}
                                    onChange={handleFieldChange}
                                    maxLength={150}
                                />
                            </FormField>
                            <div className="edit-barber-row">
                                <FormField label="Fecha de nacimiento">
                                    <input type="date" name="birth_date" value={form.birth_date} onChange={handleFieldChange} />
                                </FormField>
                                <FormField label="Dirección">
                                    <input
                                        type="text"
                                        name="address"
                                        value={form.address}
                                        onChange={handleFieldChange}
                                        maxLength={255}
                                    />
                                </FormField>
                            </div>
                        </div>
                    </details>

                    {hasBarberAttributes && (
                        <>
                            <FormField
                                label="Porcentaje de división"
                                hint="Parte que se lleva el barbero por cada turno completado"
                            >
                                <input
                                    type="number"
                                    value={earningsSplit}
                                    onChange={e => setEarningsSplit(Number(e.target.value))}
                                    min="0"
                                    max="100"
                                />
                            </FormField>

                            <FormField
                                label="Servicios que ofrece"
                                hint="Solo estos van a aparecer disponibles para este barbero en la reserva pública"
                            >
                                {allServices.length === 0 ? (
                                    <p className="edit-barber-empty">Todavía no cargaste servicios en el catálogo.</p>
                                ) : (
                                    <div className="service-chip-list">
                                        {allServices.map(service => (
                                            <button
                                                key={service.id}
                                                type="button"
                                                className={`service-chip ${
                                                    selectedServiceIds.includes(service.id) ? "is-selected" : ""
                                                }`}
                                                onClick={() => toggleService(service.id)}
                                                aria-pressed={selectedServiceIds.includes(service.id)}
                                            >
                                                {service.name}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </FormField>
                        </>
                    )}

                    {error && <InlineFeedback tone="error">{error}</InlineFeedback>}

                    <Button type="submit" loading={saving}>
                        Guardar cambios
                    </Button>
                </form>
            )}
        </Modal>
    );
};

export default EditBarberModal;
