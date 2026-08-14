import { Link } from "react-router-dom";
import { BRAND } from "../../data/brand";
import Button from "../ui/Button";
import { IconChair } from "../ui/icons";
import "./Hero.css";

export default function Hero() {
    return (
        <section className="hero section-ink">
            {/* reemplazar por foto real de hero (barbero + cliente) cuando esté disponible */}
            <IconChair className="hero-scene" aria-hidden="true" />
            <div className="hero-texture" aria-hidden="true" />

            <div className="container hero-inner">
                <p className="eyebrow">{BRAND.tagline}</p>
                <h1 className="hero-headline">{BRAND.heroHeadline}</h1>
                <p className="hero-subtext">{BRAND.heroSubtext}</p>
                <div className="hero-actions">
                    <Button as={Link} to="/reservar" size="lg">
                        Reservar turno
                    </Button>
                    <Button as="a" href="#servicios" variant="secondary" size="lg">
                        Ver servicios
                    </Button>
                </div>
            </div>

            <p className="hero-credit">N.º 00 — Filo &amp; oficio</p>
        </section>
    );
}
