import { useEffect, useRef, useState } from "react";
import { createBarber, updateBarber } from "../../services/admin";
import { getInitials } from "../../utils/format";
import { PASSWORD_RULES } from "../../utils/passwordRules";
import Button from "../ui/Button";
import FormField from "../ui/FormField";
import Icon from "../ui/Icon";
import InlineFeedback from "../ui/InlineFeedback";
import { useToast } from "../ui/Toast";
import ServicePicker from "./ServicePicker";
import "./BarberForm.css";

const ROLES = [
    { value: "barber", label: "Barbero", description: "Atiende turnos con su propia agenda.", icon: "content_cut" },
    { value: "admin_barber", label: "Barbero admin", description: "Atiende turnos y administra el panel.", icon: "verified" },
    { value: "admin", label: "Administrador", description: "Administra el panel, sin agenda propia.", icon: "shield_person" },
];

const FIELD_MESSAGES = {
    first_name: "Mínimo 2 caracteres.",
    last_name: "Mínimo 2 caracteres.",
    email: "Ingresá un email válido.",
    password: "La contraseña no cumple los requisitos.",
    earnings_split_percentage: "Tiene que estar entre 0 y 100.",
    phone: "Teléfono inválido: entre 8 y 30 dígitos.",
    birth_date: "Fecha inválida.",
    bio: "La bio es demasiado larga.",
};

const BIO_MAX = 1000;

const EMPTY = {
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    role: "barber",
    bio: "",
    earnings_split_percentage: 50,
    service_ids: [],
    phone: "",
    social_media: "",
    birth_date: "",
    address: "",
};

const fromBarber = barber => ({
    first_name: barber.first_name,
    last_name: barber.last_name,
    email: barber.email,
    password: "",
    role: barber.role,
    bio: barber.bio || "",
    earnings_split_percentage: Number(barber.earnings_split_percentage) || 0,
    service_ids: barber.service_ids || [],
    phone: barber.phone || "",
    social_media: barber.social_media || "",
    birth_date: barber.birth_date ? barber.birth_date.slice(0, 10) : "",
    address: barber.address || "",
});

const validName = value => value.trim().length >= 2;

const BarberForm = ({ barber, services, isSelf, onCancel, onSaved }) => {
    const isEdit = Boolean(barber);
    const { showToast } = useToast();
    const rolesRef = useRef(null);

    const [form, setForm] = useState(() => (barber ? fromBarber(barber) : EMPTY));
    const [showPassword, setShowPassword] = useState(false);
    const [extrasOpen, setExtrasOpen] = useState(
        () => Boolean(barber && (barber.phone || barber.social_media || barber.birth_date || barber.address)),
    );
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [fieldErrors, setFieldErrors] = useState({});

    const titleRef = useRef(null);

    // El botón que abrió el formulario desaparece: el foco va al título para
    // que teclado y lector de pantalla arranquen en la ficha.
    useEffect(() => {
        window.scrollTo({ top: 0 });
        titleRef.current?.focus({ preventScroll: true });
    }, []);

    const set = (name, value) => setForm(prev => ({ ...prev, [name]: value }));

    // Admin y barbero admin gestionan el equipo por igual; solo no se puede cambiar el rol propio.
    const canEditRole = isEdit ? !isSelf : true;
    const roleAllowed = value => canEditRole || value === form.role;
    const hasBarberAttributes = form.role !== "admin";
    const split = Number(form.earnings_split_percentage);
    const selectedServices = services.filter(s => form.service_ids.includes(s.id));
    const roleLabel = ROLES.find(r => r.value === form.role)?.label;
    const fullName = `${form.first_name} ${form.last_name}`.trim();

    const roleHint = isEdit && isSelf ? "No podés cambiar tu propio rol." : null;

    const handleRoleKeys = e => {
        const step = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
        if (!step) return;
        e.preventDefault();
        let index = ROLES.findIndex(r => r.value === form.role);
        for (let tries = 0; tries < ROLES.length; tries += 1) {
            index = (index + step + ROLES.length) % ROLES.length;
            if (roleAllowed(ROLES[index].value)) break;
        }
        set("role", ROLES[index].value);
        rolesRef.current?.querySelectorAll("[role=radio]")[index]?.focus();
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setError("");

        const errors = {};
        if (!validName(form.first_name)) errors.first_name = FIELD_MESSAGES.first_name;
        if (!validName(form.last_name)) errors.last_name = FIELD_MESSAGES.last_name;
        if (!isEdit && !/^\S+@\S+\.\S+$/.test(form.email.trim())) errors.email = FIELD_MESSAGES.email;
        if (!isEdit && !PASSWORD_RULES.every(rule => rule.test(form.password))) errors.password = FIELD_MESSAGES.password;
        if (hasBarberAttributes && (form.earnings_split_percentage === "" || split < 0 || split > 100)) {
            errors.earnings_split_percentage = FIELD_MESSAGES.earnings_split_percentage;
        }
        setFieldErrors(errors);
        if (Object.keys(errors).length > 0) {
            setError("Revisá los campos marcados.");
            return;
        }

        // Los opcionales con formato estricto (birth_date, phone) fallan en el
        // backend si viajan como string vacío: se mandan solo si tienen valor.
        const optional = {
            ...(form.phone.trim() && { phone: form.phone.trim() }),
            ...(form.social_media.trim() && { social_media: form.social_media.trim() }),
            ...(form.birth_date && { birth_date: form.birth_date }),
            ...(form.address.trim() && { address: form.address.trim() }),
        };

        setSaving(true);
        try {
            if (isEdit) {
                const payload = {
                    first_name: form.first_name.trim(),
                    last_name: form.last_name.trim(),
                    bio: form.bio,
                    ...optional,
                };
                if (canEditRole) payload.role = form.role;
                if (hasBarberAttributes) {
                    payload.earnings_split_percentage = split;
                    payload.service_ids = form.service_ids;
                }
                await updateBarber(barber.id, payload);
                showToast("Cambios guardados.");
            } else {
                const payload = {
                    first_name: form.first_name.trim(),
                    last_name: form.last_name.trim(),
                    email: form.email.trim(),
                    password: form.password,
                    role: form.role,
                    ...(form.bio.trim() && { bio: form.bio }),
                    ...optional,
                };
                if (hasBarberAttributes) {
                    payload.earnings_split_percentage = split;
                    if (form.service_ids.length > 0) payload.service_ids = form.service_ids;
                }
                await createBarber(payload);
                showToast(`${form.first_name.trim()} ya forma parte del equipo.`);
            }
            onSaved();
        } catch (err) {
            const details = err.response?.data?.details;
            if (Array.isArray(details) && details.length > 0) {
                setFieldErrors(
                    Object.fromEntries(details.map(d => [d.field, FIELD_MESSAGES[d.field] || "Revisá este campo."])),
                );
                setError("Revisá los campos marcados.");
            } else if (err.response?.status === 409) {
                setFieldErrors({ email: "Ya existe un usuario con ese email." });
                setError("Ya existe un usuario con ese email.");
            } else {
                setError(err.response?.data?.error || "No se pudo guardar el barbero.");
            }
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="barber-page">
            <nav className="barber-crumbs" aria-label="Ruta">
                <button type="button" className="barber-crumb-back" onClick={onCancel}>
                    <Icon name="chevron_left" size={16} />
                    Barberos y equipo
                </button>
                <span aria-hidden="true">/</span>
                <span className="barber-crumb-current" aria-current="page">
                    {isEdit ? "Editar ficha" : "Alta de barbero"}
                </span>
            </nav>

            <div className="barber-layout">
                <form className="barber-card" onSubmit={handleSubmit} noValidate>
                    <header className="barber-head">
                        <div className="barber-head-text">
                            <span className="barber-eyebrow">Ficha del equipo // {isEdit ? "Edición" : "Alta"}</span>
                            <h1 ref={titleRef} tabIndex={-1} className="barber-title">
                                {isEdit ? "Editar barbero" : "Crear nuevo barbero"}
                            </h1>
                            <p className="barber-lede">
                                {isEdit
                                    ? `Actualizá los datos, servicios y comisión de ${barber.first_name.trim()}.`
                                    : "Cargá los datos, el acceso al panel, los servicios y la comisión del nuevo integrante."}
                            </p>
                        </div>
                        <span className="barber-chip">
                            <span className="barber-chip-dot" aria-hidden="true" />
                            {isEdit ? `ID #${barber.id}` : "Nuevo integrante"}
                        </span>
                    </header>

                    <section className="barber-section" aria-labelledby="barber-s1">
                        <h2 id="barber-s1" className="barber-section-title">
                            01. Datos personales y acceso
                        </h2>

                        <div className="barber-grid-2">
                            <FormField label="Nombre" htmlFor="barber-first" error={fieldErrors.first_name}>
                                <div className="field-affix">
                                    <input
                                        id="barber-first"
                                        type="text"
                                        autoComplete="off"
                                        maxLength={100}
                                        value={form.first_name}
                                        onChange={e => set("first_name", e.target.value)}
                                    />
                                    {validName(form.first_name) && (
                                        <span className="field-affix-suffix barber-valid" aria-hidden="true">
                                            <Icon name="check_circle" size={18} />
                                        </span>
                                    )}
                                </div>
                            </FormField>
                            <FormField label="Apellido" htmlFor="barber-last" error={fieldErrors.last_name}>
                                <div className="field-affix">
                                    <input
                                        id="barber-last"
                                        type="text"
                                        autoComplete="off"
                                        maxLength={100}
                                        value={form.last_name}
                                        onChange={e => set("last_name", e.target.value)}
                                    />
                                    {validName(form.last_name) && (
                                        <span className="field-affix-suffix barber-valid" aria-hidden="true">
                                            <Icon name="check_circle" size={18} />
                                        </span>
                                    )}
                                </div>
                            </FormField>
                        </div>

                        <FormField
                            label="Email de acceso"
                            htmlFor="barber-email"
                            error={fieldErrors.email}
                            hint={isEdit ? "El email de acceso no se puede cambiar." : "Lo usa para entrar al panel."}
                        >
                            <div className="field-affix">
                                <input
                                    id="barber-email"
                                    type="email"
                                    autoComplete="off"
                                    spellCheck={false}
                                    readOnly={isEdit}
                                    value={form.email}
                                    onChange={e => set("email", e.target.value)}
                                    placeholder="nombre@oficiobarberia.com"
                                />
                                {isEdit && (
                                    <span className="field-affix-suffix" aria-hidden="true">
                                        <Icon name="lock" size={18} />
                                    </span>
                                )}
                            </div>
                        </FormField>

                        {!isEdit && (
                            <div className="barber-password">
                                <FormField label="Contraseña temporal" htmlFor="barber-password" error={fieldErrors.password}>
                                    <div className="field-affix">
                                        <input
                                            id="barber-password"
                                            type={showPassword ? "text" : "password"}
                                            autoComplete="new-password"
                                            maxLength={100}
                                            className="is-mono"
                                            value={form.password}
                                            onChange={e => set("password", e.target.value)}
                                        />
                                        <button
                                            type="button"
                                            className="field-affix-action"
                                            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                                            onClick={() => setShowPassword(v => !v)}
                                        >
                                            <Icon name={showPassword ? "visibility_off" : "visibility"} size={20} />
                                        </button>
                                    </div>
                                </FormField>
                                <div className="barber-rules">
                                    <span className="barber-rules-title">Requisitos de seguridad</span>
                                    <ul className="barber-rules-list">
                                        {PASSWORD_RULES.map(rule => {
                                            const ok = rule.test(form.password);
                                            return (
                                                <li key={rule.key} className={ok ? "is-ok" : ""}>
                                                    <Icon name={ok ? "check_circle" : "radio_button_unchecked"} size={16} />
                                                    {rule.label}
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            </div>
                        )}

                        <div className="barber-field">
                            <span className="barber-label" id="barber-role-label">
                                Rol en la barbería
                            </span>
                            <div
                                ref={rolesRef}
                                className="barber-roles"
                                role="radiogroup"
                                aria-labelledby="barber-role-label"
                                onKeyDown={handleRoleKeys}
                            >
                                {ROLES.map(role => {
                                    const selected = form.role === role.value;
                                    return (
                                        <button
                                            key={role.value}
                                            type="button"
                                            role="radio"
                                            aria-checked={selected}
                                            tabIndex={selected ? 0 : -1}
                                            disabled={!roleAllowed(role.value)}
                                            className={`barber-role ${selected ? "is-selected" : ""}`}
                                            onClick={() => set("role", role.value)}
                                        >
                                            <span className="barber-role-head">
                                                <span className="barber-role-name">{role.label}</span>
                                                <Icon name={selected ? "check_circle" : role.icon} size={18} />
                                            </span>
                                            <span className="barber-role-desc">{role.description}</span>
                                        </button>
                                    );
                                })}
                            </div>
                            {roleHint && <span className="barber-hint">{roleHint}</span>}
                        </div>
                    </section>

                    {hasBarberAttributes && (
                        <section className="barber-section" aria-labelledby="barber-s2">
                            <h2 id="barber-s2" className="barber-section-title">
                                02. Servicios y comisión
                            </h2>

                            <div className="barber-field">
                                <span className="barber-label">Servicios que ofrece</span>
                                <ServicePicker
                                    services={services}
                                    selectedIds={form.service_ids}
                                    onChange={ids => set("service_ids", ids)}
                                />
                                {services.length > 0 && form.service_ids.length === 0 && (
                                    <span className="barber-warning">
                                        <Icon name="warning" size={16} />
                                        Sin al menos un servicio no puede recibir turnos.
                                    </span>
                                )}
                            </div>

                            <div className="barber-commission">
                                <FormField
                                    label="Porcentaje de división"
                                    htmlFor="barber-split"
                                    error={fieldErrors.earnings_split_percentage}
                                >
                                    <div className="field-affix barber-split">
                                        <input
                                            id="barber-split"
                                            type="number"
                                            inputMode="decimal"
                                            min={0}
                                            max={100}
                                            className="is-mono"
                                            value={form.earnings_split_percentage}
                                            onChange={e => set("earnings_split_percentage", e.target.value)}
                                            onWheel={e => e.currentTarget.blur()}
                                        />
                                        <span className="field-affix-suffix">%</span>
                                    </div>
                                </FormField>
                                <p className="barber-commission-text">
                                    <span className="barber-commission-title">Por cada turno completado</span>
                                    El barbero se lleva este porcentaje del precio del servicio; el resto queda para el local.
                                </p>
                            </div>
                        </section>
                    )}

                    <section className="barber-section" aria-labelledby="barber-s3">
                        <h2 id="barber-s3" className="barber-section-title">
                            {hasBarberAttributes ? "03" : "02"}. Perfil público
                        </h2>
                        <FormField
                            label="Biografía"
                            htmlFor="barber-bio"
                            error={fieldErrors.bio}
                            aside={`${form.bio.length} / ${BIO_MAX}`}
                            hint="Se muestra en su página dentro de la reserva online."
                        >
                            <textarea
                                id="barber-bio"
                                rows={3}
                                maxLength={BIO_MAX}
                                value={form.bio}
                                onChange={e => set("bio", e.target.value)}
                                placeholder="Ej: especialista en degradés y barba con navaja."
                            />
                        </FormField>
                    </section>

                    <section className="barber-section">
                        <button
                            type="button"
                            className="barber-extras-toggle"
                            aria-expanded={extrasOpen}
                            aria-controls="barber-extras"
                            onClick={() => setExtrasOpen(v => !v)}
                        >
                            <span>
                                <Icon name="tune" size={18} />
                                {hasBarberAttributes ? "04" : "03"}. Datos adicionales (opcional)
                            </span>
                            <Icon name={extrasOpen ? "expand_less" : "expand_more"} size={20} />
                        </button>

                        {extrasOpen && (
                            <div id="barber-extras" className="barber-extras">
                                <div className="barber-grid-2">
                                    <FormField label="Teléfono" htmlFor="barber-phone" error={fieldErrors.phone}>
                                        <div className="field-affix">
                                            <span className="field-affix-prefix">+54 9</span>
                                            <input
                                                id="barber-phone"
                                                type="tel"
                                                inputMode="tel"
                                                autoComplete="off"
                                                maxLength={30}
                                                className="is-mono"
                                                placeholder="11 4820 9182"
                                                value={form.phone}
                                                onChange={e => set("phone", e.target.value)}
                                            />
                                        </div>
                                    </FormField>
                                    <FormField label="Redes sociales" htmlFor="barber-social" error={fieldErrors.social_media}>
                                        <input
                                            id="barber-social"
                                            type="text"
                                            autoComplete="off"
                                            maxLength={150}
                                            placeholder="@usuario en Instagram"
                                            value={form.social_media}
                                            onChange={e => set("social_media", e.target.value)}
                                        />
                                    </FormField>
                                    <FormField label="Fecha de nacimiento" htmlFor="barber-birth" error={fieldErrors.birth_date}>
                                        <input
                                            id="barber-birth"
                                            type="date"
                                            value={form.birth_date}
                                            onChange={e => set("birth_date", e.target.value)}
                                        />
                                    </FormField>
                                    <FormField label="Dirección" htmlFor="barber-address" error={fieldErrors.address}>
                                        <input
                                            id="barber-address"
                                            type="text"
                                            autoComplete="off"
                                            maxLength={255}
                                            value={form.address}
                                            onChange={e => set("address", e.target.value)}
                                        />
                                    </FormField>
                                </div>
                            </div>
                        )}
                    </section>

                    {error && <InlineFeedback tone="error">{error}</InlineFeedback>}

                    <div className="barber-actions">
                        <Button variant="ghost" onClick={onCancel}>
                            Descartar cambios
                        </Button>
                        <Button type="submit" icon="save" loading={saving}>
                            {isEdit ? "Guardar cambios" : "Guardar barbero"}
                        </Button>
                    </div>
                </form>

                <aside className="barber-side">
                    <section className="barber-side-card" aria-label="Vista previa de la ficha">
                        <span className="barber-side-label">Vista previa de la ficha</span>
                        <div className="barber-credential">
                            <div className="barber-credential-top">
                                <span className="barber-credential-avatar" aria-hidden="true">
                                    {getInitials(form.first_name, form.last_name) || <Icon name="person" size={28} />}
                                </span>
                                <div className="barber-credential-id">
                                    <span className="barber-credential-code">
                                        {isEdit ? `ID #${barber.id}` : "Alta pendiente"}
                                    </span>
                                    <h3 className="barber-credential-name">{fullName || "Nombre y apellido"}</h3>
                                    <span className="barber-credential-role">
                                        <span className="barber-chip-dot" aria-hidden="true" />
                                        {roleLabel}
                                    </span>
                                </div>
                            </div>
                            <dl className="barber-credential-rows">
                                {hasBarberAttributes && (
                                    <div>
                                        <dt>Comisión</dt>
                                        <dd>{Number.isFinite(split) ? `${split}%` : "—"}</dd>
                                    </div>
                                )}
                                {hasBarberAttributes && (
                                    <div>
                                        <dt>Servicios</dt>
                                        <dd>
                                            {selectedServices.length} de {services.length}
                                        </dd>
                                    </div>
                                )}
                                <div>
                                    <dt>Acceso</dt>
                                    <dd className="is-ellipsis">{form.email || "—"}</dd>
                                </div>
                            </dl>
                            {hasBarberAttributes && selectedServices.length > 0 && (
                                <div className="barber-credential-tags">
                                    {selectedServices.map(s => (
                                        <span key={s.id} className="service-tag">
                                            {s.name}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>

                    <div className="barber-side-info">
                        <Icon name="info" size={20} />
                        <div>
                            <span className="barber-side-info-title">
                                {isEdit ? "Servicios y reservas" : "Acceso al panel"}
                            </span>
                            <p>
                                {isEdit
                                    ? "Los servicios marcados son los únicos que los clientes pueden reservar con este barbero."
                                    : "Entra con este email y la contraseña temporal. Pedile que la cambie desde Mi perfil."}
                            </p>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default BarberForm;
