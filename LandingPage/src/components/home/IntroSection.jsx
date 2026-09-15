import { Link } from "react-router-dom";
import { BRAND } from "../../data/brand";
import { BRANCHES, BRANCH_NAMES } from "../../data/branches";
import quienesSomosPhoto from "../../assets/images/quienes-somos.jpg";
import Icon from "../ui/Icon";
import Reveal from "../ui/Reveal";
import "./IntroSection.css";

const FACTS = [
    { value: `Desde ${BRAND.since}`, label: "Empezamos como barbería de esquina" },
    { value: `${BRANCHES.length} sucursales`, label: BRANCH_NAMES },
    { value: "Turno a horario", label: "Reservás la hora y te esperamos" },
];

export default function IntroSection() {
    return (
        <section className="section section-dark intro-section" aria-labelledby="intro-title">
            <div className="container intro-grid">
                <Reveal className="intro-photo">
                    <img
                        src={quienesSomosPhoto}
                        alt="Interior de Oficio Barbería: sillones de cuero y espejos iluminados"
                        loading="lazy"
                        width="720"
                        height="900"
                    />
                </Reveal>

                <Reveal delay={100} className="intro-copy">
                    <p className="eyebrow">{BRAND.aboutEyebrow}</p>
                    <h2 id="intro-title" className="section-title">
                        {BRAND.aboutTitle}
                    </h2>
                    <p className="intro-text">{BRAND.aboutText}</p>
                    <p className="intro-text">{BRAND.aboutTextExtra}</p>

                    <dl className="intro-facts">
                        {FACTS.map((fact) => (
                            <div key={fact.value} className="intro-fact">
                                <dt>{fact.value}</dt>
                                <dd>{fact.label}</dd>
                            </div>
                        ))}
                    </dl>

                    <Link to="/barberos" className="text-link intro-link">
                        Conocé al equipo
                        <Icon name="arrow_forward" size={18} />
                    </Link>
                </Reveal>
            </div>
        </section>
    );
}
