import { useEffect, useRef, useState } from "react";
import { createService, updateService } from "../../services/services";
import { formatMoney } from "../../utils/format";
import Button from "../ui/Button";
import FormField from "../ui/FormField";
import Icon from "../ui/Icon";
import InlineFeedback from "../ui/InlineFeedback";
import Switch from "../ui/Switch";
import { useToast } from "../ui/Toast";
import "./ServiceForm.css";

const DURATION_PRESETS = [30, 45, 60, 90];
const NAME_MAX = 100;
const DESCRIPTION_MAX = 255;
const DURATION_MAX = 600;

const ServiceForm = ({ service, barbersOffering, onCancel, onSaved }) => {
    const isEdit = Boolean(service);
    const { showToast } = useToast();
    const titleRef = useRef(null);

    const [name, setName] = useState(service?.name || "");
    const [description, setDescription] = useState(service?.description || "");
    const [price, setPrice] = useState(service ? String(Number(service.price)) : "");
    const [duration, setDuration] = useState(service ? Number(service.duration_minutes) : 30);
    const [customDuration, setCustomDuration] = useState(() => Boolean(service) && !DURATION_PRESETS.includes(Number(service.duration_minutes)));
    const [active, setActive] = useState(service ? Boolean(service.active) : true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [fieldErrors, setFieldErrors] = useState({});

    useEffect(() => {
        window.scrollTo({ top: 0 });
        titleRef.current?.focus({ preventScroll: true });
    }, []);

    const priceNumber = Number(price);
    const durationNumber = Number(duration);

    const handleSubmit = async e => {
        e.preventDefault();
        setError("");
        const errors = {};
        if (name.trim().length < 2) errors.name = "Mínimo 2 caracteres.";
        if (price === "" || Number.isNaN(priceNumber) || priceNumber < 0) errors.price = "Ingresá un precio válido.";
        if (!Number.isInteger(durationNumber) || durationNumber < 1 || durationNumber > DURATION_MAX) {
            errors.duration = `Entre 1 y ${DURATION_MAX} minutos.`;
        }
        setFieldErrors(errors);
        if (Object.keys(errors).length > 0) {
            setError("Revisá los campos marcados.");
            return;
        }

        const payload = {
            name: name.trim(),
            description: description.trim(),
            price: priceNumber,
            duration_minutes: durationNumber,
        };

        setSaving(true);
        try {
            if (isEdit) {
                await updateService(service.id, { ...payload, active });
                showToast("Servicio actualizado.");
            } else {
                await createService(payload);
                showToast(`“${payload.name}” ya está en el catálogo.`);
            }
            onSaved();
        } catch (err) {
            setError(err.response?.data?.error || "No se pudo guardar el servicio.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="svc-page">
            <nav className="svc-crumbs" aria-label="Ruta">
                <button type="button" className="svc-crumb-back" onClick={onCancel}>
                    <Icon name="chevron_left" size={16} />
                    Catálogo de servicios
                </button>
                <span aria-hidden="true">/</span>
                <span className="svc-crumb-current" aria-current="page">
                    {isEdit ? "Editar servicio" : "Alta de servicio"}
                </span>
            </nav>

            <div className="svc-layout">
                <form className="svc-card" onSubmit={handleSubmit} noValidate>
                    <header className="svc-head">
                        <div className="svc-head-top">
                            <span className="svc-eyebrow">Ficha del servicio // {isEdit ? "Edición" : "Alta"}</span>
                            <span className="svc-code">{isEdit ? `SRV-${service.id}` : "Nuevo en catálogo"}</span>
                        </div>
                        <h1 ref={titleRef} tabIndex={-1} className="svc-title">
                            {isEdit ? "Editar servicio" : "Nuevo servicio de barbería"}
                        </h1>
                        <p className="svc-lede">
                            Nombre, descripción, precio y duración. Así aparece en la reserva online y es el tiempo que
                            bloquea en la agenda del barbero.
                        </p>
                    </header>

                    <FormField
                        label="Nombre del servicio"
                        htmlFor="svc-name"
                        error={fieldErrors.name}
                        aside={`${name.length} / ${NAME_MAX}`}
                    >
                        <input
                            id="svc-name"
                            type="text"
                            autoComplete="off"
                            maxLength={NAME_MAX}
                            placeholder="Ej: Corte y barba con navaja"
                            value={name}
                            onChange={e => setName(e.target.value)}
                        />
                    </FormField>

                    <FormField
                        label="Descripción"
                        htmlFor="svc-description"
                        aside={`${description.length} / ${DESCRIPTION_MAX}`}
                        hint="Se muestra en la reserva online. Opcional."
                    >
                        <textarea
                            id="svc-description"
                            rows={3}
                            maxLength={DESCRIPTION_MAX}
                            placeholder="Qué incluye el servicio, en una o dos frases."
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                        />
                    </FormField>

                    <div className="svc-grid-2">
                        <div className="svc-panel">
                            <FormField label="Precio al público" htmlFor="svc-price" error={fieldErrors.price}>
                                <div className="field-affix svc-price">
                                    <span className="field-affix-prefix">$</span>
                                    <input
                                        id="svc-price"
                                        type="number"
                                        inputMode="decimal"
                                        min={0}
                                        step="any"
                                        className="is-mono"
                                        placeholder="15000"
                                        value={price}
                                        onChange={e => setPrice(e.target.value)}
                                        onWheel={e => e.currentTarget.blur()}
                                    />
                                </div>
                            </FormField>
                            <p className="svc-panel-note">
                                Precio final que ve el cliente:{" "}
                                <strong>{price === "" || Number.isNaN(priceNumber) ? "—" : formatMoney(priceNumber)}</strong>
                            </p>
                        </div>

                        <div className="svc-panel">
                            <div className="svc-panel-head">
                                <span className="svc-label" id="svc-duration-label">
                                    Duración
                                </span>
                                <Icon name="schedule" size={18} />
                            </div>
                            <div className="svc-durations" role="group" aria-labelledby="svc-duration-label">
                                {DURATION_PRESETS.map(minutes => {
                                    const selected = !customDuration && durationNumber === minutes;
                                    return (
                                        <button
                                            key={minutes}
                                            type="button"
                                            className={`svc-duration ${selected ? "is-selected" : ""}`}
                                            aria-pressed={selected}
                                            onClick={() => {
                                                setCustomDuration(false);
                                                setDuration(minutes);
                                            }}
                                        >
                                            <span className="svc-duration-value">{minutes}</span>
                                            <span className="svc-duration-unit">min</span>
                                        </button>
                                    );
                                })}
                                <button
                                    type="button"
                                    className={`svc-duration ${customDuration ? "is-selected" : ""}`}
                                    aria-pressed={customDuration}
                                    onClick={() => setCustomDuration(true)}
                                >
                                    <Icon name="tune" size={16} />
                                    <span className="svc-duration-unit">Otra</span>
                                </button>
                            </div>
                            {customDuration && (
                                <label className="svc-custom">
                                    <span>Minutos</span>
                                    <input
                                        type="number"
                                        inputMode="numeric"
                                        min={1}
                                        max={DURATION_MAX}
                                        step={5}
                                        autoFocus
                                        value={duration}
                                        onChange={e => setDuration(e.target.value === "" ? "" : Number(e.target.value))}
                                        onWheel={e => e.currentTarget.blur()}
                                    />
                                </label>
                            )}
                            {fieldErrors.duration ? (
                                <p className="svc-panel-error">{fieldErrors.duration}</p>
                            ) : (
                                <p className="svc-panel-note">
                                    Bloquea la agenda: <strong>{durationNumber || "—"} minutos</strong>.
                                </p>
                            )}
                        </div>
                    </div>

                    {isEdit && (
                        <div className="svc-row">
                            <span className="svc-row-icon">
                                <Icon name={active ? "visibility" : "visibility_off"} size={20} />
                            </span>
                            <span className="svc-row-text">
                                <span className="svc-row-title">Visible en la reserva online</span>
                                <span className="svc-row-sub">
                                    {active
                                        ? "Los clientes pueden elegirlo al reservar."
                                        : "Oculto: no se puede reservar hasta activarlo."}
                                </span>
                            </span>
                            <Switch checked={active} onChange={setActive} label="Visible en la reserva online" />
                        </div>
                    )}

                    {isEdit && barbersOffering !== null && (
                        <div className="svc-row">
                            <span className="svc-row-icon">
                                <Icon name="content_cut" size={20} />
                            </span>
                            <span className="svc-row-text">
                                <span className="svc-row-title">Barberos que lo ofrecen</span>
                                <span className="svc-row-sub">Se asigna a cada barbero desde Barberos y equipo.</span>
                            </span>
                            <span className={`svc-row-badge ${barbersOffering === 0 ? "is-warning" : ""}`}>
                                {barbersOffering === 0 ? "Ninguno" : `${barbersOffering} ${barbersOffering === 1 ? "barbero" : "barberos"}`}
                            </span>
                        </div>
                    )}

                    {error && <InlineFeedback tone="error">{error}</InlineFeedback>}

                    <div className="svc-actions">
                        <Button variant="ghost" onClick={onCancel}>
                            Descartar
                        </Button>
                        <Button type="submit" icon={isEdit ? "save" : "add_task"} loading={saving}>
                            {isEdit ? "Guardar cambios" : "Crear servicio"}
                        </Button>
                    </div>
                </form>

                <aside className="svc-side">
                    <div className="svc-side-head">
                        <span className="svc-side-label">Vista previa para el cliente</span>
                        <span className="svc-live">
                            <span className="svc-live-dot" aria-hidden="true" />
                            En vivo
                        </span>
                    </div>

                    <article className={`svc-preview ${active ? "" : "is-hidden"}`} aria-label="Vista previa del servicio">
                        <div className="svc-preview-media" aria-hidden="true">
                            <Icon name="content_cut" size={56} />
                            <span className="svc-preview-duration">
                                <Icon name="schedule" size={14} />
                                {durationNumber || "—"} min
                            </span>
                            {!active && <span className="svc-preview-flag">Oculto</span>}
                        </div>
                        <div className="svc-preview-body">
                            <div className="svc-preview-top">
                                <h3 className="svc-preview-name">{name.trim() || "Nombre del servicio"}</h3>
                                <span className="svc-preview-price">
                                    {price === "" || Number.isNaN(priceNumber) ? "$—" : formatMoney(priceNumber)}
                                </span>
                            </div>
                            <p className="svc-preview-desc">
                                {description.trim() || "Sin descripción: el cliente solo verá nombre, precio y duración."}
                            </p>
                            <span className="svc-preview-cta">
                                Reservar este turno
                                <Icon name="arrow_forward" size={18} />
                            </span>
                        </div>
                    </article>

                    <div className="svc-side-info">
                        <Icon name="info" size={20} />
                        <p>
                            <strong>Precios y turnos ya tomados.</strong> Cada turno guarda el precio del momento en que se
                            reservó: cambiar la tarifa solo afecta a las reservas nuevas.
                        </p>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default ServiceForm;
