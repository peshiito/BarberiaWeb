import { Link } from "react-router-dom";
import { SERVICES } from "../../data/services";
import Card from "../ui/Card";
import Button from "../ui/Button";
import "./ServicesSection.css";

export default function ServicesSection() {
    return (
        <section id="servicios" className="section section-dark">
            <div className="container">
                <p className="eyebrow">Servicios</p>
                <h2 className="section-title">Lo que hacemos</h2>
                <p className="section-lede">
                    Precios de referencia — el valor final y la disponibilidad los confirma el barbero que elijas al reservar.
                </p>

                <div className="services-grid">
                    {SERVICES.map((service) => (
                        <Card key={service.id} className="service-card">
                            <p className="service-card-name">{service.name}</p>
                            <p className="service-card-desc">{service.description}</p>
                            <div className="service-card-meta">
                                <span>{service.durationLabel}</span>
                                <span className="service-card-price">{service.priceLabel}</span>
                            </div>
                        </Card>
                    ))}
                </div>

                <div className="services-cta">
                    <Button as={Link} to="/reservar" variant="secondary">
                        Reservar un servicio
                    </Button>
                </div>
            </div>
        </section>
    );
}
