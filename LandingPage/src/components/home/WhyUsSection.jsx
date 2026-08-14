import "./WhyUsSection.css";

const REASONS = [
    {
        title: "Oficio real",
        text: "Técnicas de barbería clásica —tijera, navaja, toalla caliente— que no se aprenden en un curso de fin de semana.",
    },
    {
        title: "Profesionales con trayectoria",
        text: "Cada barbero construye su propia cartera de clientes gracias al detalle, no a la rotación.",
    },
    {
        title: "Sin apuro",
        text: "Un turno es un turno: tu horario está reservado y te atendemos con el tiempo que el corte necesita.",
    },
    {
        title: "Ambiente de barrio",
        text: "Café, buena música y charla si tenés ganas. Silencio si no. La barbería como espacio, no como trámite.",
    },
];

export default function WhyUsSection() {
    return (
        <section className="section section-cream">
            <div className="container why-us-grid">
                <div className="why-us-intro">
                    <p className="eyebrow">Por qué elegirnos</p>
                    <h2 className="section-title">Lo que nos distingue</h2>
                    <p className="section-lede">
                        No es solo el corte. Es la técnica, el tiempo que le dedicamos y el trato que recibís desde que
                        cruzás la puerta.
                    </p>
                </div>

                <ul className="why-us-list">
                    {REASONS.map((reason, i) => (
                        <li key={reason.title} className="why-us-item">
                            <span className="why-us-index">{String(i + 1).padStart(2, "0")}</span>
                            <div>
                                <p className="why-us-item-title">{reason.title}</p>
                                <p className="why-us-item-text">{reason.text}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}
