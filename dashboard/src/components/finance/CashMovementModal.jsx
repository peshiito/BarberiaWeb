import { useEffect, useState } from "react";
import { createCashMovement, getCashSummary, getProducts } from "../../services/finance";
import { formatMoney } from "../../utils/format";
import Button from "../ui/Button";
import FormField from "../ui/FormField";
import Icon from "../ui/Icon";
import InlineFeedback from "../ui/InlineFeedback";
import Modal from "../ui/Modal";
import Select from "../ui/Select";
import { useToast } from "../ui/Toast";
import PaymentMethodToggle from "./PaymentMethodToggle";
import QuantityStepper from "./QuantityStepper";
import { IN_CATEGORIES, OUT_CATEGORIES, financeErrorMessage, methodMeta, money, todayIso } from "./financeUtils";
import "./FinanceModals.css";

const PLACEHOLDERS = {
    supplies: "Ej: Caja de hojas de afeitar y alcohol",
    equipment: "Ej: Navaja clásica de acero",
    product_restock: "Ej: Reposición de gel",
    rent_services: "Ej: Alquiler del local de octubre",
    other_expense: "Ej: Café para clientes",
    opening_balance: "Ej: Efectivo con el que arranca la caja",
    other_income: "Ej: Reintegro del proveedor",
};

const CashMovementModal = ({
    open,
    defaultDirection = "out",
    defaultCategory = null,
    defaultProductId = null,
    onClose,
    onSaved,
}) => {
    const { showToast } = useToast();
    const [direction, setDirection] = useState(defaultDirection);
    const [category, setCategory] = useState(null);
    const [description, setDescription] = useState("");
    const [descriptionTouched, setDescriptionTouched] = useState(false);
    const [amount, setAmount] = useState("");
    const [occurredOn, setOccurredOn] = useState(todayIso());
    const [method, setMethod] = useState("cash");
    const [productId, setProductId] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [products, setProducts] = useState([]);
    const [balance, setBalance] = useState(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [fieldErrors, setFieldErrors] = useState({});

    useEffect(() => {
        if (!open) return;
        setDirection(defaultDirection);
        setCategory(defaultCategory || (defaultDirection === "out" ? OUT_CATEGORIES[0].value : IN_CATEGORIES[0].value));
        setDescription("");
        setDescriptionTouched(false);
        setAmount("");
        setOccurredOn(todayIso());
        setMethod("cash");
        setProductId(defaultProductId);
        setQuantity(1);
        setError("");
        setFieldErrors({});
        getProducts(true)
            .then(setProducts)
            .catch(() => setProducts([]));
        getCashSummary(todayIso(), todayIso())
            .then(summary => setBalance(summary.balance))
            .catch(() => setBalance(null));
    }, [open, defaultDirection, defaultCategory, defaultProductId]);

    const categories = direction === "out" ? OUT_CATEGORIES : IN_CATEGORIES;
    const isRestock = direction === "out" && category === "product_restock";
    const product = products.find(p => p.id === productId);
    const amountNumber = Number(amount) || 0;

    // La descripción de una reposición se completa sola hasta que la editan.
    useEffect(() => {
        if (isRestock && product && !descriptionTouched) {
            setDescription(`Reposición ${product.name} (${quantity} un.)`);
        }
    }, [isRestock, product, quantity, descriptionTouched]);

    const changeDirection = next => {
        setDirection(next);
        const nextCategories = next === "out" ? OUT_CATEGORIES : IN_CATEGORIES;
        if (!nextCategories.some(c => c.value === category)) setCategory(nextCategories[0].value);
    };

    const current = balance ? balance[method] : null;
    const after = current === null ? null : direction === "out" ? current - amountNumber : current + amountNumber;

    const handleSubmit = async () => {
        const errors = {};
        if (description.trim().length < 2) errors.description = "Contá brevemente qué fue.";
        if (!(amountNumber > 0)) errors.amount = "Ingresá un monto mayor a cero.";
        if (!occurredOn || occurredOn > todayIso()) errors.occurredOn = "La fecha no puede ser futura.";
        if (isRestock && !product) errors.product = "Elegí qué producto repusiste.";
        setFieldErrors(errors);
        if (Object.keys(errors).length) return;

        setSaving(true);
        setError("");
        try {
            await createCashMovement({
                direction,
                category,
                description: description.trim(),
                amount: amountNumber,
                payment_method: method,
                occurred_on: occurredOn,
                ...(isRestock && { product_id: product.id, quantity }),
            });
            showToast(direction === "out" ? `Egreso de ${formatMoney(amountNumber)} registrado.` : `Ingreso de ${formatMoney(amountNumber)} registrado.`);
            onSaved();
        } catch (err) {
            setError(financeErrorMessage(err, "No se pudo registrar el movimiento."));
        } finally {
            setSaving(false);
        }
    };

    const productOptions = products.map(p => ({
        value: p.id,
        label: p.name,
        description: `Stock actual: ${p.stock}`,
        leading: (
            <span className="fin-select-icon">
                <Icon name="inventory_2" size={18} />
            </span>
        ),
    }));

    return (
        <Modal
            open={open}
            onClose={onClose}
            size="lg"
            icon="point_of_sale"
            eyebrow="Caja"
            title="Registrar movimiento"
            subtitle="Gastos, compras e ingresos que no vienen de un turno ni de una venta."
            footer={
                <div className="fin-modal-footer has-summary">
                    <p className={`fin-balance-impact ${after !== null && after < 0 ? "is-negative" : ""}`} aria-live="polite">
                        <Icon name={methodMeta(method).icon} size={18} />
                        {current === null ? (
                            <span>{direction === "out" ? "Egreso" : "Ingreso"}: {formatMoney(amountNumber)}</span>
                        ) : (
                            <span>
                                {direction === "out" ? "Sale de" : "Entra a"} {methodMeta(method).label} · saldo actual{" "}
                                <strong>{money(current)}</strong> → <strong>{money(after)}</strong>
                            </span>
                        )}
                    </p>
                    <div className="fin-modal-actions">
                        <Button variant="ghost" onClick={onClose} disabled={saving}>
                            Cancelar
                        </Button>
                        <Button
                            variant={direction === "out" ? "danger-solid" : "success"}
                            icon="check_circle"
                            onClick={handleSubmit}
                            loading={saving}
                        >
                            {direction === "out" ? "Registrar egreso" : "Registrar ingreso"}
                        </Button>
                    </div>
                </div>
            }
        >
            <div className="fin-form">
                <div className="fin-direction" role="radiogroup" aria-label="Tipo de movimiento">
                    {[
                        { value: "out", label: "Egreso / compra", icon: "trending_down" },
                        { value: "in", label: "Ingreso", icon: "trending_up" },
                    ].map(option => (
                        <button
                            key={option.value}
                            type="button"
                            role="radio"
                            aria-checked={direction === option.value}
                            className={`fin-direction-option is-${option.value} ${direction === option.value ? "is-checked" : ""}`}
                            onClick={() => changeDirection(option.value)}
                        >
                            <Icon name={option.icon} size={20} />
                            {option.label}
                        </button>
                    ))}
                </div>

                <fieldset className="fin-fieldset">
                    <legend className="fin-legend">
                        Categoría de {direction === "out" ? "egreso" : "ingreso"}
                    </legend>
                    <div className="fin-categories" role="radiogroup" aria-label="Categoría">
                        {categories.map(option => {
                            const checked = category === option.value;
                            return (
                                <button
                                    key={option.value}
                                    type="button"
                                    role="radio"
                                    aria-checked={checked}
                                    className={`fin-category is-${direction} ${checked ? "is-checked" : ""}`}
                                    onClick={() => setCategory(option.value)}
                                >
                                    <span className="fin-category-icon">
                                        <Icon name={option.icon} size={20} />
                                    </span>
                                    <span className="fin-category-text">
                                        <span className="fin-category-label">{option.label}</span>
                                        <span className="fin-category-hint">{option.hint}</span>
                                    </span>
                                    {checked && <Icon name="check_circle" size={18} filled className="fin-category-check" />}
                                </button>
                            );
                        })}
                    </div>
                </fieldset>

                {isRestock && (
                    <div className="fin-restock">
                        <span className="fin-restock-title">
                            <Icon name="inventory_2" size={18} />
                            Suma stock al producto
                        </span>
                        <div className="fin-restock-grid">
                            <FormField label="Producto a reponer" required error={fieldErrors.product}>
                                <Select
                                    value={productId}
                                    onChange={setProductId}
                                    options={productOptions}
                                    placeholder="Elegí un producto"
                                    emptyMessage="Todavía no hay productos cargados."
                                    aria-label="Producto a reponer"
                                />
                            </FormField>
                            <FormField label="Cantidad comprada" htmlFor="restock-quantity" required>
                                <QuantityStepper
                                    id="restock-quantity"
                                    label="la reposición"
                                    value={quantity}
                                    min={1}
                                    onChange={setQuantity}
                                />
                            </FormField>
                        </div>
                        {product && (
                            <p className="fin-restock-note">
                                <Icon name="add_task" size={18} />
                                Suma {quantity} {quantity === 1 ? "unidad" : "unidades"} al stock de{" "}
                                <strong>{product.name}</strong> (queda en {product.stock + quantity})
                            </p>
                        )}
                    </div>
                )}

                <FormField label="Descripción" htmlFor="movement-description" required error={fieldErrors.description}>
                    <input
                        id="movement-description"
                        type="text"
                        maxLength={255}
                        autoComplete="off"
                        placeholder={PLACEHOLDERS[category]}
                        value={description}
                        onChange={e => {
                            setDescription(e.target.value);
                            setDescriptionTouched(true);
                        }}
                    />
                </FormField>

                <div className="fin-grid-2">
                    <FormField label="Monto total" htmlFor="movement-amount" required error={fieldErrors.amount}>
                        <div className="field-affix fin-amount">
                            <span className="field-affix-prefix">$</span>
                            <input
                                id="movement-amount"
                                type="number"
                                inputMode="decimal"
                                min={0}
                                step="any"
                                placeholder="25000"
                                value={amount}
                                onChange={e => setAmount(e.target.value)}
                                onWheel={e => e.currentTarget.blur()}
                            />
                            <span className="field-affix-suffix">ARS</span>
                        </div>
                    </FormField>
                    <FormField label="Fecha" htmlFor="movement-date" required error={fieldErrors.occurredOn} hint="No se permiten fechas futuras.">
                        <input
                            id="movement-date"
                            type="date"
                            max={todayIso()}
                            value={occurredOn}
                            onChange={e => e.target.value && setOccurredOn(e.target.value)}
                        />
                    </FormField>
                </div>

                <FormField label="Medio de pago" required>
                    <PaymentMethodToggle value={method} onChange={setMethod} size="lg" />
                </FormField>

                {error && <InlineFeedback tone="error">{error}</InlineFeedback>}
            </div>
        </Modal>
    );
};

export default CashMovementModal;
