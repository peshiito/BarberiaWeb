import { useEffect, useState } from "react";
import { deleteSale, getProducts, getSales, updateProduct } from "../../services/finance";
import { addDays, toISODate } from "../../utils/date";
import { formatMoney, getInitials } from "../../utils/format";
import Button from "../ui/Button";
import ConfirmDialog from "../ui/ConfirmDialog";
import Icon from "../ui/Icon";
import InlineFeedback from "../ui/InlineFeedback";
import Skeleton from "../ui/Skeleton";
import { useToast } from "../ui/Toast";
import { financeErrorMessage, formatDay, formatTimestamp, methodMeta, todayIso } from "./financeUtils";
import "./ProductsTab.css";

const SALES_PAGE_SIZE = 8;

const plural = (count, singular, pluralForm) => `${count} ${count === 1 ? singular : pluralForm}`;

const ProductCard = ({ product, index, onSell, onRestock, onEdit, onActivate, activating }) => {
    const active = Boolean(product.active);
    const margin = product.cost_price != null ? product.sale_price - product.cost_price : null;
    const marginPct = margin != null && product.sale_price > 0 ? Math.round((margin / product.sale_price) * 100) : null;
    const commissionPct = Number(product.barber_commission_percentage);
    const commissionUnit = Math.round(product.sale_price * commissionPct) / 100;
    const low = active && product.stock <= product.min_stock;
    const barMax = Math.max(product.min_stock * 3, product.stock, 1);

    return (
        <article
            className={`product-card ${active ? "" : "is-inactive"} ${low ? "is-low" : ""}`}
            style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
        >
            <header className="product-card-head">
                <span className="product-icon" aria-hidden="true">
                    <Icon name="inventory_2" size={22} />
                </span>
                <div className="product-card-id">
                    <h3 className="product-name">{product.name}</h3>
                    <p className={`product-desc ${product.description ? "" : "is-empty"}`}>
                        {product.description || "Sin descripción"}
                    </p>
                </div>
                <span className={`fin-tag ${active ? "is-sage" : "is-muted"}`}>{active ? "Activo" : "Inactivo"}</span>
            </header>

            <dl className="product-prices">
                <div className="product-price-main">
                    <dt>Precio de venta</dt>
                    <dd>{formatMoney(product.sale_price)}</dd>
                </div>
                <div>
                    <dt>Costo</dt>
                    <dd>{product.cost_price != null ? formatMoney(product.cost_price) : "—"}</dd>
                </div>
                <div>
                    <dt>Margen</dt>
                    <dd className={margin != null ? "is-positive" : ""}>
                        {margin != null ? `${marginPct}% (+${formatMoney(margin)})` : "—"}
                    </dd>
                </div>
                <div>
                    <dt>Comisión barbero ({commissionPct}%)</dt>
                    <dd>{formatMoney(commissionUnit)} / un.</dd>
                </div>
            </dl>

            <div className="product-stock">
                <div className="product-stock-row">
                    <span className={`product-stock-value ${low ? "is-negative" : ""}`}>
                        Stock: <strong>{plural(product.stock, "unidad", "unidades")}</strong>
                        {low && (
                            <span className="fin-tag is-danger">
                                <Icon name="warning" size={13} />
                                {product.stock === 0 ? "Sin stock" : "Stock bajo"}
                            </span>
                        )}
                    </span>
                    <span className="fin-muted">Mínimo {product.min_stock}</span>
                </div>
                <div
                    className="product-stock-bar"
                    role="img"
                    aria-label={`Stock ${product.stock} de un mínimo de ${product.min_stock}`}
                >
                    <span style={{ width: `${Math.min(100, (product.stock / barMax) * 100)}%` }} />
                </div>
                <div className="product-sold">
                    <span>Vendidos 30 días: {product.units_sold_30d} un.</span>
                    <span>{formatMoney(product.revenue_30d)}</span>
                </div>
            </div>

            <footer className="product-actions">
                {active ? (
                    <>
                        <Button size="sm" icon="shopping_bag" onClick={() => onSell(product)} disabled={product.stock <= 0}>
                            Vender
                        </Button>
                        <Button variant={low ? "danger" : "secondary"} size="sm" icon="add_box" onClick={() => onRestock(product)}>
                            Reponer
                        </Button>
                    </>
                ) : (
                    <Button variant="secondary" size="sm" icon="visibility" onClick={() => onActivate(product)} loading={activating}>
                        Activar
                    </Button>
                )}
                <button
                    type="button"
                    className="fin-icon-btn product-edit"
                    aria-label={`Editar ${product.name}`}
                    onClick={() => onEdit(product)}
                >
                    <Icon name="edit" size={18} />
                </button>
            </footer>
        </article>
    );
};

const ProductsTab = ({ refreshKey, onSell, onRestock, onEdit, onChanged }) => {
    const { showToast } = useToast();
    const [products, setProducts] = useState(null);
    const [productsError, setProductsError] = useState("");
    const [sales, setSales] = useState(null);
    const [salesError, setSalesError] = useState("");
    const [salesPage, setSalesPage] = useState(1);
    const [activatingId, setActivatingId] = useState(null);
    const [voiding, setVoiding] = useState(null);
    const [voidLoading, setVoidLoading] = useState(false);

    const salesFrom = toISODate(addDays(new Date(), -30));

    useEffect(() => {
        let cancelled = false;
        setProductsError("");
        getProducts(true)
            .then(data => !cancelled && setProducts(data))
            .catch(() => !cancelled && setProductsError("No se pudieron cargar los productos."));
        return () => {
            cancelled = true;
        };
    }, [refreshKey]);

    useEffect(() => {
        let cancelled = false;
        setSalesError("");
        getSales({ from: salesFrom, to: todayIso(), page: salesPage, limit: SALES_PAGE_SIZE })
            .then(data => !cancelled && setSales(data))
            .catch(() => !cancelled && setSalesError("No se pudieron cargar las ventas."));
        return () => {
            cancelled = true;
        };
    }, [refreshKey, salesPage, salesFrom]);

    const handleActivate = async product => {
        setActivatingId(product.id);
        try {
            await updateProduct(product.id, { active: true });
            showToast(`${product.name} volvió a estar a la venta.`);
            onChanged();
        } catch (err) {
            showToast(financeErrorMessage(err, "No se pudo activar el producto."), "error");
        } finally {
            setActivatingId(null);
        }
    };

    const handleVoid = async () => {
        setVoidLoading(true);
        try {
            await deleteSale(voiding.id);
            showToast("Venta anulada: las unidades volvieron al stock.");
            setVoiding(null);
            onChanged();
        } catch (err) {
            showToast(financeErrorMessage(err, "No se pudo anular la venta."), "error");
        } finally {
            setVoidLoading(false);
        }
    };

    const list = products || [];
    const activeProducts = list.filter(p => p.active);
    const inactiveCount = list.length - activeProducts.length;
    const unitsInStock = activeProducts.reduce((sum, p) => sum + p.stock, 0);
    const lowStock = activeProducts.filter(p => p.stock <= p.min_stock);
    const revenue30 = list.reduce((sum, p) => sum + p.revenue_30d, 0);
    const units30 = list.reduce((sum, p) => sum + p.units_sold_30d, 0);
    const salesRows = sales?.data || [];
    const salesPagination = sales?.pagination;

    return (
        <div className="products-tab">
            <dl className="products-summary">
                <div className="products-stat">
                    <dt>
                        Productos activos
                        <Icon name="check_circle" size={18} />
                    </dt>
                    <dd>{products ? activeProducts.length : "—"}</dd>
                    <span>{products ? plural(inactiveCount, "desactivado", "desactivados") : ""}</span>
                </div>
                <div className="products-stat">
                    <dt>
                        Unidades en stock
                        <Icon name="inventory" size={18} />
                    </dt>
                    <dd>{products ? unitsInStock : "—"}</dd>
                    <span>entre los productos activos</span>
                </div>
                <div className={`products-stat ${lowStock.length ? "is-alert" : ""}`}>
                    <dt>
                        Con stock bajo
                        {lowStock.length > 0 && <span className="fin-tag is-danger">Atención</span>}
                    </dt>
                    <dd>{products ? lowStock.length : "—"}</dd>
                    <span>
                        {lowStock.length
                            ? lowStock
                                  .slice(0, 2)
                                  .map(p => p.name)
                                  .join(", ") + (lowStock.length > 2 ? "…" : "")
                            : "Todo en orden"}
                    </span>
                </div>
                <div className="products-stat">
                    <dt>
                        Vendido últimos 30 días
                        <Icon name="trending_up" size={18} />
                    </dt>
                    <dd className="is-brass">{products ? formatMoney(revenue30) : "—"}</dd>
                    <span>{plural(units30, "unidad vendida", "unidades vendidas")}</span>
                </div>
            </dl>

            <section aria-labelledby="products-catalog-title">
                <div className="fin-section-head">
                    <div>
                        <h2 id="products-catalog-title" className="fin-section-title">
                            Productos
                        </h2>
                        <p className="fin-section-sub">Stock, precios, márgenes y comisión para el barbero que vende.</p>
                    </div>
                </div>

                {productsError ? (
                    <InlineFeedback tone="error">{productsError}</InlineFeedback>
                ) : !products ? (
                    <div className="products-grid">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <Skeleton key={i} height="360px" />
                        ))}
                    </div>
                ) : list.length === 0 ? (
                    <div className="fin-card fin-empty">
                        <Icon name="inventory_2" size={36} />
                        <span className="fin-empty-title">Todavía no cargaste productos</span>
                        <p>Dá de alta geles, ceras o perfumes para venderlos y llevar el stock.</p>
                        <Button icon="add" onClick={() => onEdit(null)}>
                            Nuevo producto
                        </Button>
                    </div>
                ) : (
                    <div className="products-grid">
                        {list.map((product, index) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                index={index}
                                onSell={onSell}
                                onRestock={onRestock}
                                onEdit={onEdit}
                                onActivate={handleActivate}
                                activating={activatingId === product.id}
                            />
                        ))}
                    </div>
                )}
            </section>

            <section className="fin-card" aria-labelledby="products-sales-title">
                <div className="fin-section-head">
                    <div>
                        <h2 id="products-sales-title" className="fin-section-title">
                            Ventas recientes
                        </h2>
                        <p className="fin-section-sub">
                            Últimos 30 días · {sales ? `${sales.totals.count} ${sales.totals.count === 1 ? "venta" : "ventas"} por ${formatMoney(sales.totals.revenue)}` : "cargando…"}
                        </p>
                    </div>
                </div>

                {salesError ? (
                    <InlineFeedback tone="error">{salesError}</InlineFeedback>
                ) : !sales ? (
                    <div className="fin-skeleton">
                        <Skeleton height="52px" />
                        <Skeleton height="52px" />
                    </div>
                ) : salesRows.length === 0 ? (
                    <div className="fin-empty">
                        <Icon name="shopping_bag" size={36} />
                        <span className="fin-empty-title">Sin ventas en los últimos 30 días</span>
                        <p>Cuando registres una venta aparece acá, con su comisión y medio de pago.</p>
                    </div>
                ) : (
                    <>
                        <div className="fin-table-wrap">
                            <table className="fin-table sales-table">
                                <thead>
                                    <tr>
                                        <th scope="col">Fecha y hora</th>
                                        <th scope="col">Producto</th>
                                        <th scope="col" className="is-num">
                                            Cant.
                                        </th>
                                        <th scope="col" className="is-num">
                                            Total
                                        </th>
                                        <th scope="col">Vendedor</th>
                                        <th scope="col" className="is-num">
                                            Comisión
                                        </th>
                                        <th scope="col">Medio</th>
                                        <th scope="col" className="is-actions">
                                            Estado
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {salesRows.map(sale => (
                                        <tr key={sale.id}>
                                            <td className="cash-date">
                                                <span>{formatDay(sale.sold_on)}</span>
                                                <span className="fin-muted">{formatTimestamp(sale.created_at).time}</span>
                                            </td>
                                            <td className="sales-product">{sale.product_name}</td>
                                            <td className="is-num">{sale.quantity} un.</td>
                                            <td className="is-num sales-total">{formatMoney(sale.total)}</td>
                                            <td>
                                                <span className="sales-seller">
                                                    <span className="fin-avatar" aria-hidden="true">
                                                        {sale.seller_first_name ? (
                                                            getInitials(sale.seller_first_name, sale.seller_last_name)
                                                        ) : (
                                                            <Icon name="storefront" size={16} />
                                                        )}
                                                    </span>
                                                    {sale.seller_first_name
                                                        ? `${sale.seller_first_name} ${sale.seller_last_name}`.trim()
                                                        : "Local"}
                                                </span>
                                            </td>
                                            <td className={`is-num ${sale.commission_amount ? "is-positive" : "fin-muted"}`}>
                                                {formatMoney(sale.commission_amount)} ({Number(sale.commission_percentage)}%)
                                            </td>
                                            <td>
                                                <span className="fin-method">
                                                    <Icon name={methodMeta(sale.payment_method).icon} size={15} />
                                                    {methodMeta(sale.payment_method).label}
                                                </span>
                                            </td>
                                            <td className="is-actions">
                                                {sale.payout_id ? (
                                                    <span className="fin-tag is-sage">Liquidada</span>
                                                ) : (
                                                    <Button variant="ghost" size="sm" icon="undo" onClick={() => setVoiding(sale)}>
                                                        Anular
                                                    </Button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {salesPagination && salesPagination.totalPages > 1 && (
                            <div className="fin-pagination">
                                <span>
                                    Página {salesPagination.page} de {salesPagination.totalPages}
                                </span>
                                <div className="fin-pagination-actions">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        icon="chevron_left"
                                        disabled={salesPage <= 1}
                                        onClick={() => setSalesPage(p => Math.max(1, p - 1))}
                                    >
                                        Anterior
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        iconRight="chevron_right"
                                        disabled={salesPage >= salesPagination.totalPages}
                                        onClick={() => setSalesPage(p => p + 1)}
                                    >
                                        Siguiente
                                    </Button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </section>

            <ConfirmDialog
                open={Boolean(voiding)}
                icon="undo"
                title="Anular venta"
                message={
                    voiding
                        ? `Se anula la venta de ${voiding.quantity} × ${voiding.product_name} por ${formatMoney(voiding.total)}. Las unidades vuelven al stock y sale de la caja.`
                        : ""
                }
                confirmLabel="Anular venta"
                loading={voidLoading}
                onConfirm={handleVoid}
                onClose={() => setVoiding(null)}
            />
        </div>
    );
};

export default ProductsTab;
