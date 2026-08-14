import { Link } from "react-router-dom";
import { BRAND } from "../../data/brand";
import { IconChair } from "../ui/icons";
import PlateFrame from "../ui/PlateFrame";
import Button from "../ui/Button";
import Reveal from "../ui/Reveal";
import "./IntroSection.css";

export default function IntroSection() {
    return (
        <section className="section section-cream intro-section">
            <div className="container intro-grid">
                <Reveal className="intro-image-slot">
                    {/* reemplazar por imagen real del local cuando esté disponible */}
                    <PlateFrame tone="light" number="N.º 01" caption="El sillón · desde 2014">
                        <IconChair />
                    </PlateFrame>
                </Reveal>

                <Reveal as="div" delay={120} className="intro-copy">
                    <p className="eyebrow">{BRAND.aboutEyebrow}</p>
                    <h2 className="section-title">{BRAND.aboutTitle}</h2>
                    <p className="intro-text">{BRAND.aboutText}</p>
                    <p className="intro-text">{BRAND.aboutTextExtra}</p>

                    <div className="intro-highlights">
                        {BRAND.aboutHighlights.map((h) => (
                            <div key={h.label} className="intro-highlight">
                                <span className="intro-highlight-value">{h.value}</span>
                                <span className="intro-highlight-label">{h.label}</span>
                            </div>
                        ))}
                    </div>

                    <Button as={Link} to="/barberos" variant="secondary" className="intro-cta">
                        Conocé al equipo
                    </Button>
                </Reveal>
            </div>
        </section>
    );
}
