import { IconRazor, IconScissors, IconClock, IconChair } from "../ui/icons";
import Reveal from "../ui/Reveal";
import "./WhyUsSection.css";

const REASONS = [
    { icon: IconRazor, title: "Afeitado a navaja", text: "Técnica clásica, toalla caliente incluida." },
    { icon: IconScissors, title: "Corte a tijera", text: "Sin apuro, con el tiempo que el corte necesita." },
    { icon: IconClock, title: "Turno puntual", text: "Reservás la hora y te esperamos a esa hora." },
    { icon: IconChair, title: "Ambiente de barrio", text: "Café, charla si querés, silencio si no." },
];

export default function WhyUsSection() {
    return (
        <section className="section section-cream why-us">
            <div className="container">
                <Reveal>
                    <p className="eyebrow">Por qué elegirnos</p>
                    <h2 className="section-title">Lo que nos distingue</h2>
                </Reveal>

                <ul className="why-us-strip">
                    {REASONS.map(({ icon: Icon, title, text }, i) => (
                        <Reveal as="li" delay={i * 80} key={title} className="why-us-item">
                            <Icon className="why-us-icon" />
                            <p className="why-us-item-title">{title}</p>
                            <p className="why-us-item-text">{text}</p>
                        </Reveal>
                    ))}
                </ul>
            </div>
        </section>
    );
}
