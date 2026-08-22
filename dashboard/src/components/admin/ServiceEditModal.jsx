import { useEffect, useState } from "react";
import { updateService } from "../../services/services";
import Button from "../ui/Button";
import FormField from "../ui/FormField";
import InlineFeedback from "../ui/InlineFeedback";
import Modal from "../ui/Modal";

const ServiceEditModal = ({ service, onClose, onSaved }) => {
    const [formData, setFormData] = useState({ name: "", description: "", price: 0, duration_minutes: 30 });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!service) return;
        setFormData({
            name: service.name,
            description: service.description || "",
            price: Number(service.price),
            duration_minutes: service.duration_minutes,
        });
        setError("");
    }, [service]);

    const handleChange = e => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === "price" || name === "duration_minutes" ? Number(value) : value,
        }));
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setSaving(true);
        setError("");
        try {
            await updateService(service.id, formData);
            onSaved();
        } catch (err) {
            setError(err.response?.data?.error || "No se pudo guardar el servicio");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal open={Boolean(service)} onClose={onClose} title="Editar servicio">
            <form className="service-edit-form" onSubmit={handleSubmit}>
                <FormField label="Nombre">
                    <input type="text" name="name" value={formData.name} onChange={handleChange} minLength={2} maxLength={100} required />
                </FormField>

                <FormField label="Descripción" hint="Opcional">
                    <textarea name="description" value={formData.description} onChange={handleChange} maxLength={255} rows="2" />
                </FormField>

                <div className="service-form-row">
                    <FormField label="Precio">
                        <div className="input-affix">
                            <span className="input-affix-symbol">$</span>
                            <input type="number" name="price" value={formData.price} onChange={handleChange} min="0" step="0.01" required />
                        </div>
                    </FormField>
                    <FormField label="Duración" hint="En minutos">
                        <input
                            type="number"
                            name="duration_minutes"
                            value={formData.duration_minutes}
                            onChange={handleChange}
                            min="1"
                            max="600"
                            required
                        />
                    </FormField>
                </div>

                {error && <InlineFeedback tone="error">{error}</InlineFeedback>}

                <Button type="submit" loading={saving}>
                    Guardar cambios
                </Button>
            </form>
        </Modal>
    );
};

export default ServiceEditModal;
