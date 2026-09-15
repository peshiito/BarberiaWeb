import { Link } from "react-router-dom";
import { BRAND } from "../../data/brand";
import { BRANCH_NAMES } from "../../data/branches";
import { useServices } from "../../hooks/useServices";
import { formatPrice } from "../../utils/format";
import { whatsappUrl } from "../../utils/links";
import heroPhoto from "../../assets/images/hero.jpg";
import Icon from "../ui/Icon";
import { IconWhatsapp } from "../ui/icons";
import "./Hero.css";

export default function Hero() {
    const { status, services } = useServices();
    const lines = BRAND.heroTitleLines;

    return (
        <section className="hero" aria-labelledby="hero-title">
            <div className="hero-photo">
                <img src={heroPhoto} alt="Afeitado a navaja con toalla y espuma en Oficio Barbería" fetchPriority="high" />
            </div>

            <div className="container hero-inner">
                <p className="eyebrow hero-eyebrow">
                    Barbería desde {BRAND.since} · {BRANCH_NAMES}
                </p>
                <h1 id="hero-title" className="hero-title">
                    {lines.map((line, i) => (
                        <span key={line} className={i === lines.length - 1 ? "is-accent" : undefined}>
                            {line}
                        </span>
                    ))}
                </h1>
                <p className="hero-subtext">{BRAND.heroSubtext}</p>

                <div className="hero-pick">
                    <p className="hero-pick-label" id="hero-pick-label">
                        ¿Qué te hacés hoy?
                    </p>

                    {status === "loading" && (
                        <div className="hero-chips" aria-hidden="true">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <span key={i} className="skeleton hero-chip-skeleton" />
                            ))}
                        </div>
                    )}

                    {status === "success" && services.length > 0 && (
                        <ul className="hero-chips" aria-labelledby="hero-pick-label">
                            {services.map((service) => (
                                <li key={service.id}>
                                    <Link to={`/reservar?servicio=${service.id}`} className="hero-chip">
                                        <span className="hero-chip-name">{service.name}</span>
                                        <span className="hero-chip-meta">
                                            <span className="hero-chip-price">{formatPrice(service.price)}</span>
                                            <Icon name="arrow_forward" size={18} />
                                        </span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}

                    {(status === "error" || (status === "success" && services.length === 0)) && (
                        <Link to="/reservar" className="btn btn-primary btn-lg">
                            Reservar turno
                        </Link>
                    )}

                    <a className="whatsapp-link hero-whatsapp" href={whatsappUrl()} target="_blank" rel="noreferrer">
                        <IconWhatsapp width={18} height={18} />o escribinos por WhatsApp
                    </a>
                </div>
            </div>
        </section>
    );
}
