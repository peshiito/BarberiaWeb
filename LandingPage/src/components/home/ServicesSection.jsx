import { Link } from "react-router-dom";
import { useServices } from "../../hooks/useServices";
import { IconScissors } from "../ui/icons";
import PlateFrame from "../ui/PlateFrame";
import Button from "../ui/Button";
import Reveal from "../ui/Reveal";
import "./ServicesSection.css";

export default function ServicesSection() {
    const { status, services } = useServices();

    return (
        <section id="servicios" className="section section-dark services-section">
            <div className="container services-grid">
                <Reveal className="services-plate">
                    {/* reemplazar por foto real de un corte en proceso cuando esté disponible */}
                    <PlateFrame number="N.º 02" caption="Lo que hacemos">
                        <IconScissors />
                    </PlateFrame>
                </Reveal>

                <Reveal as="div" delay={100} className="services-copy">
                    <p className="eyebrow">Servicios</p>
                    <h2 className="section-title">Cada corte, a su manera</h2>
                    <p className="section-lede">Precio y duración fijos, sin sorpresas al momento de pagar.</p>

                    {status === "success" && (
                        <ul className="services-list">
                            {services.map((service) => (
                                <li key={service.id} className="services-list-item">
                                    <div>
                                        <p className="services-list-name">{service.name}</p>
                                        <p className="services-list-desc">{service.description}</p>
                                    </div>
                                    <span className="services-list-duration">
                                        {service.duration_minutes} min · ${Number(service.price).toLocaleString("es-AR")}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}

                    <Button as={Link} to="/reservar" className="services-cta">
                        Reservar turno
                    </Button>
                </Reveal>
            </div>
        </section>
    );
}
