import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { createClient, updateClient } from "../../services/clients";
import Button from "../ui/Button";
import FormField from "../ui/FormField";
import Icon from "../ui/Icon";
import InlineFeedback from "../ui/InlineFeedback";
import Modal from "../ui/Modal";
import { useToast } from "../ui/Toast";
import "./ClientForm.css";

const PHONE_REGEX = /^[0-9+\-\s]{8,30}$/;
const NOTES_MAX = 500;
const emptyForm = { first_name: "", last_name: "", phone: "", notes: "" };

const ClientFormModal = ({ open, client, onClose, onSaved }) => {
    const { user } = useAuth();
    const { showToast } = useToast();
    const isEditing = Boolean(client);
    // Un barbero no ve ni edita teléfonos de clientes existentes.
    const hidePhone = isEditing && user?.role === "barber";

    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [fieldErrors, setFieldErrors] = useState({});

    useEffect(() => {
        if (!open) return;
        setError("");
        setFieldErrors({});
        setForm(
            client
                ? {
                      first_name: client.first_name,
                      last_name: client.last_name || "",
                      phone: client.phone || "",
                      notes: client.notes || "",
                  }
                : emptyForm,
        );
    }, [open, client]);

    const set = (name, value) => setForm(prev => ({ ...prev, [name]: value }));

    const phone = form.phone.trim();
    const phoneValid = PHONE_REGEX.test(phone);

    const handleSubmit = async e => {
        e?.preventDefault();
        setError("");

        const errors = {};
        if (form.first_name.trim().length < 2) errors.first_name = "Ingresá el nombre (mínimo 2 letras).";
        if (!hidePhone && !phoneValid) errors.phone = "Ingresá un teléfono válido: entre 8 y 30 dígitos.";
        setFieldErrors(errors);
        if (Object.keys(errors).length > 0) return;

        const base = {
            first_name: form.first_name.trim(),
            last_name: form.last_name.trim(),
            notes: form.notes,
        };

        setSaving(true);
        try {
            if (isEditing) {
                await updateClient(client.id, hidePhone ? base : { ...base, phone });
                showToast("Cliente actualizado.");
            } else {
                const { created } = await createClient({ ...base, phone });
                showToast(created ? "Cliente guardado." : "Ya existía un cliente con ese teléfono: se usó esa ficha.");
            }
            onSaved();
        } catch (err) {
            setError(err.response?.data?.error || "No se pudo guardar el cliente.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            size="md"
            icon={isEditing ? "edit" : "person_add"}
            eyebrow="Ficha de cliente"
            title={isEditing ? "Editar cliente" : "Nuevo cliente"}
            subtitle={
                isEditing ? "Actualizá el contacto y las preferencias." : "Datos de contacto y preferencias para su ficha."
            }
            footer={
                <div className="client-form-footer">
                    <Button variant="ghost" onClick={onClose}>
                        Cancelar
                    </Button>
                    <Button icon="save" loading={saving} onClick={handleSubmit}>
                        {isEditing ? "Guardar cambios" : "Guardar cliente"}
                    </Button>
                </div>
            }
        >
            <form className="client-form" onSubmit={handleSubmit} noValidate>
                <div className="client-form-row">
                    <FormField
                        label="Nombre"
                        htmlFor="client-first-name"
                        required
                        aside={<span className="client-form-required">Obligatorio</span>}
                        error={fieldErrors.first_name}
                    >
                        <div className="field-affix">
                            <input
                                id="client-first-name"
                                type="text"
                                autoComplete="off"
                                maxLength={100}
                                placeholder="Ej: Juan Manuel"
                                value={form.first_name}
                                onChange={e => set("first_name", e.target.value)}
                            />
                            <span className="field-affix-suffix" aria-hidden="true">
                                <Icon name="badge" size={18} />
                            </span>
                        </div>
                    </FormField>
                    <FormField label="Apellido" htmlFor="client-last-name" aside="Opcional" hint="Podés dejarlo vacío.">
                        <input
                            id="client-last-name"
                            type="text"
                            autoComplete="off"
                            maxLength={100}
                            placeholder="Ej: De la Torre"
                            value={form.last_name}
                            onChange={e => set("last_name", e.target.value)}
                        />
                    </FormField>
                </div>

                {!hidePhone && (
                    <FormField
                        label="Teléfono celular"
                        htmlFor="client-phone"
                        required
                        aside={
                            <span className="client-form-channel">
                                <span className="client-form-channel-dot" aria-hidden="true" />
                                WhatsApp
                            </span>
                        }
                        error={fieldErrors.phone}
                    >
                        <div className="field-affix">
                            <span className="field-affix-prefix client-form-prefix">AR +54 9</span>
                            <input
                                id="client-phone"
                                type="tel"
                                inputMode="tel"
                                autoComplete="off"
                                maxLength={30}
                                className="is-mono"
                                placeholder="11 0000 0000"
                                value={form.phone}
                                onChange={e => set("phone", e.target.value)}
                                aria-describedby="client-phone-status"
                            />
                            {phoneValid && (
                                <span className="field-affix-suffix client-form-valid" aria-hidden="true">
                                    <Icon name="verified" size={18} />
                                </span>
                            )}
                        </div>
                    </FormField>
                )}

                {!hidePhone && !fieldErrors.phone && (
                    <p id="client-phone-status" className={`client-form-status ${phoneValid ? "is-ok" : ""}`}>
                        <Icon name={phoneValid ? "check_circle" : "info"} size={16} />
                        {phoneValid
                            ? "Formato válido para escribirle por WhatsApp."
                            : isEditing
                              ? "Entre 8 y 30 dígitos."
                              : "Si ya existe un cliente con este teléfono, se usa esa ficha en vez de duplicarla."}
                    </p>
                )}

                <FormField label="Notas de corte y preferencias" htmlFor="client-notes" aside="Solo el equipo">
                    <div className="client-form-notes">
                        <textarea
                            id="client-notes"
                            rows={3}
                            maxLength={NOTES_MAX}
                            placeholder="Ej: prefiere degradé bajo con máquina 0.5, no usar loción mentolada."
                            value={form.notes}
                            onChange={e => set("notes", e.target.value)}
                        />
                        <span className="client-form-notes-foot">
                            <span>
                                <Icon name="stylus_note" size={14} />
                                Visible en la ficha del cliente
                            </span>
                            <span>
                                {form.notes.length}/{NOTES_MAX}
                            </span>
                        </span>
                    </div>
                </FormField>

                {error && <InlineFeedback tone="error">{error}</InlineFeedback>}
            </form>
        </Modal>
    );
};

export default ClientFormModal;
