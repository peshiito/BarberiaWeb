import { useEffect, useState } from "react";
import { createProduct, updateProduct } from "../../services/finance";
import { formatMoney } from "../../utils/format";
import Button from "../ui/Button";
import Drawer from "../ui/Drawer";
import FormField from "../ui/FormField";
import Icon from "../ui/Icon";
import InlineFeedback from "../ui/InlineFeedback";
import Switch from "../ui/Switch";
import { useToast } from "../ui/Toast";
import { financeErrorMessage } from "./financeUtils";

const DESCRIPTION_MAX = 255;

const emptyForm = {
    name: "",
    description: "",
    salePrice: "",
    costPrice: "",
    stock: "0",
    minStock: "2",
    commission: "10",
    active: true,
};

const ProductDrawer = ({ open, product, onClose, onSaved }) => {
    const { showToast } = useToast();
    const isEdit = Boolean(product);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [fieldErrors, setFieldErrors] = useState({});

    useEffect(() => {
        if (!open) return;
        setError("");
        setFieldErrors({});
        setForm(
            product
                ? {
                      name: product.name,
                      description: product.description || "",
                      salePrice: String(product.sale_price),
                      costPrice: product.cost_price != null ? String(product.cost_price) : "",
                      stock: String(product.stock),
                      minStock: String(product.min_stock),
                      commission: String(Number(product.barber_commission_percentage)),
                      active: Boolean(product.active),
                  }
                : emptyForm,
        );
    }, [open, product]);

    const set = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

    const salePrice = Number(form.salePrice) || 0;
    const costPrice = form.costPrice === "" ? null : Number(form.costPrice);
    const commission = Number(form.commission) || 0;
    const margin = costPrice != null ? salePrice - costPrice : null;
    const marginPct = margin != null && salePrice > 0 ? Math.round((margin / salePrice) * 100) : null;
    const commissionUnit = Math.round(salePrice * commission) / 100;

    const handleSubmit = async e => {
        e?.preventDefault();
        const errors = {};
        if (form.name.trim().length < 2) errors.name = "Mínimo 2 caracteres.";
        if (form.salePrice === "" || salePrice < 0) errors.salePrice = "Ingresá el precio de venta.";
        if (costPrice != null && costPrice < 0) errors.costPrice = "El costo no puede ser negativo.";
        if (!Number.isInteger(Number(form.stock)) || Number(form.stock) < 0) errors.stock = "Tiene que ser un número entero.";
        if (!Number.isInteger(Number(form.minStock)) || Number(form.minStock) < 0) errors.minStock = "Tiene que ser un número entero.";
        if (commission < 0 || commission > 100) errors.commission = "Entre 0 y 100.";
        setFieldErrors(errors);
        if (Object.keys(errors).length) return;

        const payload = {
            name: form.name.trim(),
            description: form.description.trim(),
            sale_price: salePrice,
            stock: Number(form.stock),
            min_stock: Number(form.minStock),
            barber_commission_percentage: commission,
        };

        setSaving(true);
        setError("");
        try {
            if (isEdit) {
                await updateProduct(product.id, { ...payload, cost_price: costPrice, active: form.active });
                showToast("Producto actualizado.");
            } else {
                await createProduct({ ...payload, ...(costPrice != null && { cost_price: costPrice }) });
                showToast(`${payload.name} quedó cargado en el catálogo.`);
            }
            onSaved();
        } catch (err) {
            setError(financeErrorMessage(err, "No se pudo guardar el producto."));
        } finally {
            setSaving(false);
        }
    };

    return (
        <Drawer
            open={open}
            onClose={onClose}
            eyebrow="Catálogo"
            title={isEdit ? "Editar producto" : "Nuevo producto"}
            subtitle={isEdit ? product.name : "Dalo de alta para venderlo y llevar el stock."}
            footer={
                <div className="product-drawer-footer">
                    <Button variant="ghost" onClick={onClose} disabled={saving}>
                        Cancelar
                    </Button>
                    <Button icon="check" onClick={handleSubmit} loading={saving}>
                        Guardar producto
                    </Button>
                </div>
            }
        >
            <form className="product-form" onSubmit={handleSubmit} noValidate>
                <FormField label="Nombre del producto" htmlFor="product-name" required error={fieldErrors.name}>
                    <input
                        id="product-name"
                        type="text"
                        maxLength={100}
                        autoComplete="off"
                        placeholder="Ej: Gel fijación fuerte 200 ml"
                        value={form.name}
                        onChange={e => set("name", e.target.value)}
                    />
                </FormField>

                <FormField
                    label="Descripción"
                    htmlFor="product-description"
                    aside={`${form.description.length} / ${DESCRIPTION_MAX}`}
                    hint="Qué es y para qué sirve. Opcional."
                >
                    <textarea
                        id="product-description"
                        rows={3}
                        maxLength={DESCRIPTION_MAX}
                        placeholder="Ej: acabado mate a base de agua, fijación todo el día."
                        value={form.description}
                        onChange={e => set("description", e.target.value)}
                    />
                </FormField>

                <div className="fin-grid-2">
                    <FormField label="Precio de venta" htmlFor="product-price" required error={fieldErrors.salePrice}>
                        <div className="field-affix">
                            <span className="field-affix-prefix">$</span>
                            <input
                                id="product-price"
                                type="number"
                                inputMode="decimal"
                                min={0}
                                step="any"
                                className="is-mono"
                                placeholder="16000"
                                value={form.salePrice}
                                onChange={e => set("salePrice", e.target.value)}
                                onWheel={e => e.currentTarget.blur()}
                            />
                        </div>
                    </FormField>
                    <FormField label="Costo de compra" htmlFor="product-cost" aside="Opcional" error={fieldErrors.costPrice}>
                        <div className="field-affix">
                            <span className="field-affix-prefix">$</span>
                            <input
                                id="product-cost"
                                type="number"
                                inputMode="decimal"
                                min={0}
                                step="any"
                                className="is-mono"
                                placeholder="8000"
                                value={form.costPrice}
                                onChange={e => set("costPrice", e.target.value)}
                                onWheel={e => e.currentTarget.blur()}
                            />
                        </div>
                    </FormField>
                </div>

                <div className="fin-grid-2">
                    <FormField
                        label={isEdit ? "Stock actual" : "Stock inicial"}
                        htmlFor="product-stock"
                        error={fieldErrors.stock}
                        hint={isEdit ? "Corregilo si contaste distinto." : undefined}
                    >
                        <input
                            id="product-stock"
                            type="number"
                            inputMode="numeric"
                            min={0}
                            step={1}
                            className="is-mono"
                            value={form.stock}
                            onChange={e => set("stock", e.target.value)}
                            onWheel={e => e.currentTarget.blur()}
                        />
                    </FormField>
                    <FormField label="Stock mínimo (alerta)" htmlFor="product-min" error={fieldErrors.minStock}>
                        <input
                            id="product-min"
                            type="number"
                            inputMode="numeric"
                            min={0}
                            step={1}
                            className="is-mono"
                            value={form.minStock}
                            onChange={e => set("minStock", e.target.value)}
                            onWheel={e => e.currentTarget.blur()}
                        />
                    </FormField>
                </div>

                <FormField
                    label="% de comisión para el barbero que lo vende"
                    htmlFor="product-commission"
                    error={fieldErrors.commission}
                >
                    <div className="field-affix">
                        <input
                            id="product-commission"
                            type="number"
                            inputMode="decimal"
                            min={0}
                            max={100}
                            step="any"
                            className="is-mono"
                            value={form.commission}
                            onChange={e => set("commission", e.target.value)}
                            onWheel={e => e.currentTarget.blur()}
                        />
                        <span className="field-affix-suffix">%</span>
                    </div>
                </FormField>

                {isEdit && (
                    <div className="product-active-row">
                        <span>
                            <span className="product-active-title">Activo para la venta</span>
                            <span className="fin-muted">Si lo desactivás, deja de aparecer al registrar ventas.</span>
                        </span>
                        <Switch checked={form.active} onChange={value => set("active", value)} label="Activo para la venta" />
                    </div>
                )}

                <div className="product-preview">
                    <span className="product-preview-title">
                        <Icon name="calculate" size={18} />
                        Cálculo estimado
                        {marginPct != null && <span className="fin-muted">Margen {marginPct}%</span>}
                    </span>
                    <div className="product-preview-row">
                        <span>Ganancia por unidad</span>
                        <span className={margin != null && margin >= 0 ? "is-positive" : ""}>
                            {margin != null ? `${margin >= 0 ? "+" : "−"} ${formatMoney(Math.abs(margin))}` : "Cargá el costo"}
                        </span>
                    </div>
                    <div className="product-preview-row">
                        <span>Comisión por unidad</span>
                        <span className="is-brass">{formatMoney(commissionUnit)}</span>
                    </div>
                </div>

                {error && <InlineFeedback tone="error">{error}</InlineFeedback>}
            </form>
        </Drawer>
    );
};

export default ProductDrawer;
