import { useCallback, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import AdvanceModal from "../components/finance/AdvanceModal";
import CashMovementModal from "../components/finance/CashMovementModal";
import CashTab from "../components/finance/CashTab";
import PayoutsTab from "../components/finance/PayoutsTab";
import PeriodPicker from "../components/finance/PeriodPicker";
import ProductDrawer from "../components/finance/ProductDrawer";
import ProductsTab from "../components/finance/ProductsTab";
import SaleModal from "../components/finance/SaleModal";
import { PERIOD_PRESETS } from "../components/finance/financeUtils";
import Button from "../components/ui/Button";
import "./FinancePage.css";

const TABS = [
    { value: "caja", label: "Caja" },
    { value: "liquidaciones", label: "Liquidaciones" },
    { value: "productos", label: "Productos" },
];

const AdminFinance = () => {
    const [params] = useSearchParams();
    const tab = TABS.some(t => t.value === params.get("tab")) ? params.get("tab") : "caja";
    const current = TABS.find(t => t.value === tab);

    const [period, setPeriod] = useState(() => PERIOD_PRESETS.find(p => p.value === "fortnight").range());
    const [refreshKey, setRefreshKey] = useState(0);
    const refresh = useCallback(() => setRefreshKey(key => key + 1), []);

    const [movementModal, setMovementModal] = useState(null);
    const [saleModal, setSaleModal] = useState(null);
    const [advanceModal, setAdvanceModal] = useState(null);
    const [productEditor, setProductEditor] = useState(null);

    const closeAndRefresh = setter => () => {
        setter(null);
        refresh();
    };

    const actions = {
        caja: (
            <>
                <Button variant="secondary" icon="remove_circle" onClick={() => setMovementModal({ direction: "out" })}>
                    Registrar egreso
                </Button>
                <Button icon="storefront" onClick={() => setSaleModal({})}>
                    Registrar venta
                </Button>
            </>
        ),
        liquidaciones: (
            <Button variant="secondary" icon="payments" onClick={() => setAdvanceModal({})}>
                Registrar adelanto
            </Button>
        ),
        productos: (
            <>
                <Button
                    variant="secondary"
                    icon="add_box"
                    onClick={() => setMovementModal({ direction: "out", category: "product_restock" })}
                >
                    Reponer stock
                </Button>
                <Button icon="add" onClick={() => setProductEditor({ product: null })}>
                    Nuevo producto
                </Button>
            </>
        ),
    };

    return (
        <div className="fin-page">
            <header className="fin-head">
                <div className="fin-head-top">
                    <div className="fin-head-title">
                        <span className="fin-eyebrow">
                            <span className="fin-eyebrow-dot" aria-hidden="true" />
                            Administración
                        </span>
                        <h1 className="fin-title">
                            Finanzas{" "}
                            <span className="fin-title-sep" aria-hidden="true">
                                //
                            </span>{" "}
                            {current.label}
                        </h1>
                    </div>
                    {tab === "caja" && <PeriodPicker from={period.from} to={period.to} onChange={setPeriod} />}
                </div>
                <div className="fin-head-bar">
                    <nav className="fin-tabs" aria-label="Secciones de finanzas">
                        {TABS.map(item => (
                            <Link
                                key={item.value}
                                to={{ search: item.value === "caja" ? "" : `?tab=${item.value}` }}
                                className={`fin-tab ${item.value === tab ? "is-active" : ""}`}
                                aria-current={item.value === tab ? "page" : undefined}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>
                    <div className="fin-head-actions">{actions[tab]}</div>
                </div>
            </header>

            {tab === "caja" && (
                <CashTab
                    from={period.from}
                    to={period.to}
                    refreshKey={refreshKey}
                    onRegisterMovement={() => setMovementModal({ direction: "out" })}
                    onChanged={refresh}
                />
            )}
            {tab === "liquidaciones" && (
                <PayoutsTab
                    refreshKey={refreshKey}
                    onAdvance={barberId => setAdvanceModal({ barberId })}
                    onChanged={refresh}
                />
            )}
            {tab === "productos" && (
                <ProductsTab
                    refreshKey={refreshKey}
                    onSell={product => setSaleModal({ productId: product.id })}
                    onRestock={product =>
                        setMovementModal({ direction: "out", category: "product_restock", productId: product.id })
                    }
                    onEdit={product => setProductEditor({ product })}
                    onChanged={refresh}
                />
            )}

            <CashMovementModal
                open={Boolean(movementModal)}
                defaultDirection={movementModal?.direction}
                defaultCategory={movementModal?.category}
                defaultProductId={movementModal?.productId}
                onClose={() => setMovementModal(null)}
                onSaved={closeAndRefresh(setMovementModal)}
            />
            <SaleModal
                open={Boolean(saleModal)}
                defaultProductId={saleModal?.productId}
                onClose={() => setSaleModal(null)}
                onSaved={closeAndRefresh(setSaleModal)}
            />
            <AdvanceModal
                open={Boolean(advanceModal)}
                defaultBarberId={advanceModal?.barberId}
                onClose={() => setAdvanceModal(null)}
                onSaved={closeAndRefresh(setAdvanceModal)}
            />
            <ProductDrawer
                open={Boolean(productEditor)}
                product={productEditor?.product || null}
                onClose={() => setProductEditor(null)}
                onSaved={closeAndRefresh(setProductEditor)}
            />
        </div>
    );
};

export default AdminFinance;
