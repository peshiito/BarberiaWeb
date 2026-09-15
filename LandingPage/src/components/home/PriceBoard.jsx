import { Link } from "react-router-dom";
import { BRAND } from "../../data/brand";
import { useServices } from "../../hooks/useServices";
import Button from "../ui/Button";
import Icon from "../ui/Icon";
import Reveal from "../ui/Reveal";
import ServiceLedger from "../ui/ServiceLedger";
import Skeleton from "../ui/Skeleton";
import "./PriceBoard.css";

// Firma de la página: la lista de precios como tablero de fieltro de barbería.
export default function PriceBoard() {
    const { status, services, reload } = useServices();

    return (
        <section id="servicios" className="section section-cream price-section" aria-labelledby="price-title">
            <div className="container">
                <Reveal className="price-head">
                    <p className="eyebrow">Servicios</p>
                    <h2 id="price-title" className="section-title">
                        Lista de precios
                    </h2>
                    <p className="section-lede">Duración y precio de cada servicio, antes de reservar.</p>
                </Reveal>

                <Reveal delay={80} className="price-frame">
                    <div className="price-board">
                        <div className="price-board-top" aria-hidden="true">
                            <span>Oficio · Barbería</span>
                            <span>ARS</span>
                        </div>

                        {status === "loading" && (
                            <div className="price-board-loading" aria-hidden="true">
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <Skeleton key={i} height="44px" />
                                ))}
                            </div>
                        )}

                        {status === "error" && (
                            <div className="price-board-message" role="alert">
                                <p>No pudimos cargar los precios. Revisá tu conexión.</p>
                                <Button variant="secondary" size="sm" onClick={reload}>
                                    <Icon name="refresh" size={18} />
                                    Reintentar
                                </Button>
                            </div>
                        )}

                        {status === "success" && services.length === 0 && (
                            <div className="price-board-message">
                                <p>Todavía no hay servicios publicados.</p>
                            </div>
                        )}

                        {status === "success" && services.length > 0 && <ServiceLedger services={services} tone="board" />}

                        <div className="price-board-foot">
                            <p className="price-board-note">
                                <Icon name="payments" size={20} />
                                {BRAND.paymentNote}
                            </p>
                            <Link to="/reservar" className="btn btn-primary btn-md">
                                Reservar turno
                            </Link>
                        </div>
                    </div>
                </Reveal>
            </div>
        </section>
    );
}
