import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { createClient, updateClient } from "../../services/clients";
import Button from "../ui/Button";
import FormField from "../ui/FormField";
import InlineFeedback from "../ui/InlineFeedback";
import Modal from "../ui/Modal";
import { useToast } from "../ui/Toast";
import "./ClientFormModal.css";

const emptyForm = { first_name: "", last_name: "", phone: "" };

const ClientFormModal = ({ open, client, onClose, onSaved }) => {
    const { user } = useAuth();
    const { showToast } = useToast();
    const isEditing = Boolean(client);
    const hidePhone = isEditing && user?.role === "barber";

    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!open) return;
        setError("");
        setForm(
            client
                ? { first_name: client.first_name, last_name: client.last_name, phone: client.phone }
                : emptyForm,
        );
    }, [open, client]);

    const handleChange = e => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setError("");
        setSaving(true);
        try {
            if (isEditing) {
                const payload = hidePhone
                    ? { first_name: form.first_name, last_name: form.last_name }
                    : { first_name: form.first_name, last_name: form.last_name, phone: form.phone };
                await updateClient(client.id, payload);
                showToast("Cliente actualizado correctamente.");
            } else {
                const { created } = await createClient(form);
                showToast(created ? "Cliente creado correctamente." : "Ya existía un cliente con ese teléfono — se vinculó al registro existente.");
            }
            onSaved();
        } catch (err) {
            const message = err.response?.data?.error || "No se pudo guardar el cliente.";
            setError(message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal open={open} onClose={onClose} title={isEditing ? "Editar cliente" : "Nuevo cliente"}>
            <form className="client-form" onSubmit={handleSubmit}>
                <div className="client-form-row">
                    <FormField label="Nombre" htmlFor="client-first-name">
                        <input
                            id="client-first-name"
                            type="text"
                            name="first_name"
                            value={form.first_name}
                            onChange={handleChange}
                            minLength={2}
                            maxLength={100}
                            required
                        />
                    </FormField>
                    <FormField label="Apellido" htmlFor="client-last-name">
                        <input
                            id="client-last-name"
                            type="text"
                            name="last_name"
                            value={form.last_name}
                            onChange={handleChange}
                            minLength={2}
                            maxLength={100}
                            required
                        />
                    </FormField>
                </div>

                {!hidePhone && (
                    <FormField
                        label="Teléfono"
                        htmlFor="client-phone"
                        hint={isEditing ? undefined : "Si ya existe un cliente con este teléfono, se reutiliza en vez de duplicarse"}
                    >
                        <input
                            id="client-phone"
                            type="tel"
                            name="phone"
                            value={form.phone}
                            onChange={handleChange}
                            minLength={8}
                            maxLength={30}
                            pattern="[0-9+\-\s]+"
                            required
                        />
                    </FormField>
                )}

                {error && <InlineFeedback tone="error">{error}</InlineFeedback>}

                <Button type="submit" loading={saving} className="client-form-submit">
                    {isEditing ? "Guardar cambios" : "Crear cliente"}
                </Button>
            </form>
        </Modal>
    );
};

export default ClientFormModal;
