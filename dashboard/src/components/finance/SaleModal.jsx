import { useEffect, useState } from "react";
import { getAllUsers } from "../../services/admin";
import { createSale, getProducts } from "../../services/finance";
import { formatMoney, getInitials } from "../../utils/format";
import Button from "../ui/Button";
import FormField from "../ui/FormField";
import Icon from "../ui/Icon";
import InlineFeedback from "../ui/InlineFeedback";
import Modal from "../ui/Modal";
import Select from "../ui/Select";
import { useToast } from "../ui/Toast";
import PaymentMethodToggle from "./PaymentMethodToggle";
import QuantityStepper from "./QuantityStepper";
import { financeErrorMessage, todayIso } from "./financeUtils";
import "./FinanceModals.css";

const SaleModal = ({ open, defaultProductId = null, onClose, onSaved }) => {
    const { showToast } = useToast();
    const [products, setProducts] = useState([]);
    const [barbers, setBarbers] = useState([]);
    const [productId, setProductId] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [seller, setSeller] = useState("local");
    const [soldOn, setSoldOn] = useState(todayIso());
    const [method, setMethod] = useState("cash");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!open) return;
        setProductId(defaultProductId);
        setQuantity(1);
        setSeller("local");
        setSoldOn(todayIso());
        setMethod("cash");
        setError("");
        Promise.all([getProducts(false), getAllUsers(1, 50)])
            .then(([productList, users]) => {
                setProducts(productList);
                setBarbers(users.data.filter(u => u.role === "barber" || u.role === "admin_barber"));
            })
            .catch(() => setError("No se pudieron cargar los productos."));
    }, [open, defaultProductId]);

    const product = products.find(p => p.id === productId);
    const stock = product?.stock ?? 0;
    const sellerBarber = barbers.find(b => b.id === seller);
    const commissionPct = sellerBarber && product ? Number(product.barber_commission_percentage) : 0;
    const total = product ? product.sale_price * quantity : 0;
    const commission = Math.round(total * commissionPct) / 100;
    const overStock = product && quantity > stock;

    useEffect(() => {
        if (product && quantity > product.stock && product.stock > 0) setQuantity(product.stock);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [productId]);

    const handleSubmit = async () => {
        if (!product) {
            setError("Elegí qué producto vendiste.");
            return;
        }
        if (overStock) return;
        setSaving(true);
        setError("");
        try {
            await createSale({
                product_id: product.id,
                quantity,
                seller_id: sellerBarber ? sellerBarber.id : null,
                payment_method: method,
                sold_on: soldOn,
            });
            showToast(`Venta registrada: ${product.name} ×${quantity}.`);
            onSaved();
        } catch (err) {
            setError(financeErrorMessage(err, "No se pudo registrar la venta."));
        } finally {
            setSaving(false);
        }
    };

    const productOptions = products.map(p => ({
        value: p.id,
        label: p.name,
        description: p.stock > 0 ? `${formatMoney(p.sale_price)} · ${p.stock} en stock` : "Sin stock",
        disabled: p.stock <= 0,
        leading: (
            <span className="fin-select-icon">
                <Icon name="inventory_2" size={18} />
            </span>
        ),
    }));

    const sellerOptions = [
        {
            value: "local",
            label: "Venta del local",
            description: "Sin comisión",
            leading: (
                <span className="fin-select-icon">
                    <Icon name="storefront" size={18} />
                </span>
            ),
        },
        ...barbers.map(b => ({
            value: b.id,
            label: `${b.first_name} ${b.last_name}`.trim(),
            description: product ? `Comisión ${Number(product.barber_commission_percentage)}%` : "Comisión según el producto",
            leading: <span className="select-avatar">{getInitials(b.first_name, b.last_name)}</span>,
        })),
    ];

    return (
        <Modal
            open={open}
            onClose={onClose}
            size="lg"
            icon="shopping_bag"
            eyebrow="Productos"
            title="Registrar venta"
            subtitle="Descuenta stock y suma a la caja."
            footer={
                <div className="fin-modal-footer has-summary">
                    <div className="fin-sale-total">
                        <span className="fin-sale-total-calc">
                            {product ? `${formatMoney(product.sale_price)} × ${quantity} ${quantity === 1 ? "unidad" : "unidades"} =` : "Total"}
                        </span>
                        <span className="fin-sale-total-value">
                            {formatMoney(total)}
                            <span className="fin-currency">ARS</span>
                        </span>
                    </div>
                    <div className="fin-sale-meta">
                        <span>
                            {sellerBarber && commissionPct > 0 ? (
                                <>
                                    Comisión para {sellerBarber.first_name.trim()}:{" "}
                                    <strong className="is-positive">{formatMoney(commission)}</strong>
                                </>
                            ) : (
                                "Sin comisión"
                            )}
                        </span>
                        {product && (
                            <span>
                                Quedan <strong>{Math.max(0, stock - quantity)} en stock</strong>
                            </span>
                        )}
                    </div>
                    <div className="fin-modal-actions">
                        <Button variant="ghost" onClick={onClose} disabled={saving}>
                            Cancelar
                        </Button>
                        <Button icon="check_circle" onClick={handleSubmit} loading={saving} disabled={!product || overStock}>
                            Registrar venta
                        </Button>
                    </div>
                </div>
            }
        >
            <div className="fin-form">
                <FormField label="Producto" required>
                    <Select
                        value={productId}
                        onChange={setProductId}
                        options={productOptions}
                        placeholder="Elegí un producto"
                        emptyMessage="No hay productos activos. Cargalos en la pestaña Productos."
                        aria-label="Producto"
                    />
                </FormField>

                <div className="fin-grid-2">
                    <FormField
                        label="Cantidad"
                        htmlFor="sale-quantity"
                        required
                        aside={product ? `Máx: ${stock} un.` : undefined}
                        error={overStock ? `Hay ${stock} ${stock === 1 ? "unidad disponible" : "unidades disponibles"}.` : undefined}
                    >
                        <QuantityStepper
                            id="sale-quantity"
                            label="la venta"
                            value={quantity}
                            min={1}
                            max={product ? Math.max(stock, 1) : undefined}
                            onChange={setQuantity}
                        />
                    </FormField>
                    <FormField
                        label="Quién vendió"
                        required
                        aside={sellerBarber && product ? `Comisión ${commissionPct}%` : undefined}
                    >
                        <Select value={seller} onChange={setSeller} options={sellerOptions} aria-label="Quién vendió" />
                    </FormField>
                </div>

                <div className="fin-grid-2">
                    <FormField label="Fecha de venta" htmlFor="sale-date" required hint="No se permiten fechas futuras.">
                        <input
                            id="sale-date"
                            type="date"
                            max={todayIso()}
                            value={soldOn}
                            onChange={e => e.target.value && setSoldOn(e.target.value)}
                        />
                    </FormField>
                    <FormField label="Medio de pago" required>
                        <PaymentMethodToggle value={method} onChange={setMethod} />
                    </FormField>
                </div>

                {error && <InlineFeedback tone="error">{error}</InlineFeedback>}
            </div>
        </Modal>
    );
};

export default SaleModal;
