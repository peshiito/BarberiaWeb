import { useEffect, useState } from "react";
import { createAdvance, getPendingPayouts } from "../../services/finance";
import { formatMoney, getInitials } from "../../utils/format";
import Button from "../ui/Button";
import FormField from "../ui/FormField";
import InlineFeedback from "../ui/InlineFeedback";
import Modal from "../ui/Modal";
import Select from "../ui/Select";
import { useToast } from "../ui/Toast";
import PaymentMethodToggle from "./PaymentMethodToggle";
import { financeErrorMessage, money, todayIso } from "./financeUtils";
import "./FinanceModals.css";

const AdvanceModal = ({ open, defaultBarberId = null, onClose, onSaved }) => {
    const { showToast } = useToast();
    const [barbers, setBarbers] = useState([]);
    const [barberId, setBarberId] = useState(null);
    const [amount, setAmount] = useState("");
    const [givenOn, setGivenOn] = useState(todayIso());
    const [method, setMethod] = useState("cash");
    const [note, setNote] = useState("");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [fieldErrors, setFieldErrors] = useState({});

    useEffect(() => {
        if (!open) return;
        setBarberId(defaultBarberId);
        setAmount("");
        setGivenOn(todayIso());
        setMethod("cash");
        setNote("");
        setError("");
        setFieldErrors({});
        getPendingPayouts(todayIso())
            .then(result => setBarbers(result.barbers))
            .catch(() => setError("No se pudo cargar lo pendiente de cada barbero."));
    }, [open, defaultBarberId]);

    const barber = barbers.find(b => b.barber_id === barberId);
    const amountNumber = Number(amount) || 0;
    const remaining = barber ? barber.net_amount - amountNumber : null;

    const handleSubmit = async () => {
        const errors = {};
        if (!barberId) errors.barber = "Elegí a qué barbero le das el adelanto.";
        if (!(amountNumber > 0)) errors.amount = "Ingresá un monto mayor a cero.";
        if (!givenOn || givenOn > todayIso()) errors.givenOn = "La fecha no puede ser futura.";
        setFieldErrors(errors);
        if (Object.keys(errors).length) return;

        setSaving(true);
        setError("");
        try {
            await createAdvance({
                barber_id: barberId,
                amount: amountNumber,
                payment_method: method,
                given_on: givenOn,
                ...(note.trim() && { note: note.trim() }),
            });
            showToast(`Adelanto de ${formatMoney(amountNumber)} registrado para ${barber?.first_name || "el barbero"}.`);
            onSaved();
        } catch (err) {
            setError(financeErrorMessage(err, "No se pudo registrar el adelanto."));
        } finally {
            setSaving(false);
        }
    };

    const barberOptions = barbers.map(b => ({
        value: b.barber_id,
        label: `${b.first_name} ${b.last_name}`,
        description: `Comisión ${Number(b.earnings_split_percentage)}%`,
        leading: <span className="select-avatar">{getInitials(b.first_name, b.last_name)}</span>,
        trailing: `Pendiente ${money(b.net_amount)}`,
    }));

    return (
        <Modal
            open={open}
            onClose={onClose}
            size="md"
            icon="payments"
            eyebrow="Liquidaciones"
            title="Registrar adelanto"
            subtitle="Plata que le das hoy a un barbero y se descuenta sola de su próximo pago."
            footer={
                <div className="fin-modal-footer">
                    <Button variant="ghost" onClick={onClose} disabled={saving}>
                        Cancelar
                    </Button>
                    <Button icon="check_circle" onClick={handleSubmit} loading={saving}>
                        Registrar adelanto
                    </Button>
                </div>
            }
        >
            <div className="fin-form">
                <FormField label="Barbero" required error={fieldErrors.barber}>
                    <Select
                        value={barberId}
                        onChange={setBarberId}
                        options={barberOptions}
                        placeholder="Elegí un barbero"
                        aria-label="Barbero"
                    />
                </FormField>

                <FormField label="Monto del adelanto" htmlFor="advance-amount" required error={fieldErrors.amount}>
                    <div className="field-affix fin-amount">
                        <span className="field-affix-prefix">$</span>
                        <input
                            id="advance-amount"
                            type="number"
                            inputMode="decimal"
                            min={0}
                            step="any"
                            placeholder="5000"
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                            onWheel={e => e.currentTarget.blur()}
                        />
                        <span className="field-affix-suffix">ARS</span>
                    </div>
                </FormField>

                <div className="fin-grid-2">
                    <FormField
                        label="Fecha de entrega"
                        htmlFor="advance-date"
                        required
                        error={fieldErrors.givenOn}
                        hint="No se permiten fechas futuras."
                    >
                        <input
                            id="advance-date"
                            type="date"
                            max={todayIso()}
                            value={givenOn}
                            onChange={e => setGivenOn(e.target.value)}
                        />
                    </FormField>
                    <FormField
                        label="Medio de pago"
                        required
                        hint={method === "cash" ? "Sale del efectivo de la caja." : "Sale de la cuenta de la barbería."}
                    >
                        <PaymentMethodToggle value={method} onChange={setMethod} />
                    </FormField>
                </div>

                <FormField label="Nota u observación" htmlFor="advance-note" aside="Opcional">
                    <input
                        id="advance-note"
                        type="text"
                        maxLength={300}
                        autoComplete="off"
                        placeholder="Ej: pidió adelanto por viaje"
                        value={note}
                        onChange={e => setNote(e.target.value)}
                    />
                </FormField>

                {barber && (
                    <div className="fin-summary" aria-live="polite">
                        <div className="fin-summary-row">
                            <span>Tiene pendiente</span>
                            <span>{money(barber.net_amount)}</span>
                        </div>
                        <div className="fin-summary-row is-brass">
                            <span>Adelanto a descontar</span>
                            <span>− {formatMoney(amountNumber)}</span>
                        </div>
                        <div className={`fin-summary-row is-total ${remaining < 0 ? "is-negative" : "is-positive"}`}>
                            <span>Le quedaría para el próximo pago</span>
                            <span>{money(remaining)}</span>
                        </div>
                        {remaining < 0 && (
                            <p className="fin-summary-warning">
                                El adelanto supera lo que tiene generado: su próximo pago queda bloqueado hasta que genere
                                más.
                            </p>
                        )}
                    </div>
                )}

                {error && <InlineFeedback tone="error">{error}</InlineFeedback>}
            </div>
        </Modal>
    );
};

export default AdvanceModal;
