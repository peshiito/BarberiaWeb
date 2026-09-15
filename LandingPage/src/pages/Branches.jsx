import { Link } from "react-router-dom";
import { useDocumentHead } from "../hooks/useDocumentHead";
import { BRANCHES } from "../data/branches";
import { telUrl } from "../utils/links";
import EmptyState from "../components/ui/EmptyState";
import Icon from "../components/ui/Icon";
import Reveal from "../components/ui/Reveal";
import "./Branches.css";

const COUNT_WORDS = ["", "Una barbería", "Dos barberías", "Tres barberías"];

export default function Branches() {
    useDocumentHead({ title: "Sucursales", description: "Dónde encontrarnos, horarios y cómo llegar a Oficio Barbería." });
    const countLabel = COUNT_WORDS[BRANCHES.length] || `${BRANCHES.length} barberías`;

    return (
        <>
            <section className="section section-dark branches-page" aria-labelledby="branches-title">
                <div className="container">
                    <header className="branches-head">
                        <p className="eyebrow">Sucursales · Buenos Aires</p>
                        <h1 id="branches-title" className="branches-title">
                            Dónde estamos
                        </h1>
                        <p className="section-lede">
                            {countLabel}, el mismo oficio. Reservás online y elegís tu barbero.
                        </p>
                    </header>

                    {BRANCHES.length === 0 ? (
                        <EmptyState
                            icon={<Icon name="location_on" size={24} />}
                            title="Estamos cargando esta sección"
                            text="Muy pronto vas a poder ver dirección, horarios y cómo llegar."
                        />
                    ) : (
                        <div className="branches-list">
                            {BRANCHES.map((branch, i) => (
                                <Reveal key={branch.id} as="article" className={`branch-block ${i % 2 ? "is-flipped" : ""}`}>
                                    <div className="branch-map">
                                        <iframe
                                            title={`Mapa de ${branch.name}`}
                                            src={`https://maps.google.com/maps?q=${branch.lat},${branch.lng}&z=16&output=embed`}
                                            loading="lazy"
                                            referrerPolicy="no-referrer-when-downgrade"
                                        />
                                        <span className="branch-map-label" aria-hidden="true">
                                            <Icon name="content_cut" size={16} />
                                            Oficio · {branch.neighborhood}
                                        </span>
                                    </div>

                                    <div className="branch-card">
                                        <h2 className="branch-card-name">{branch.neighborhood}</h2>
                                        <p className="branch-card-address">
                                            <Icon name="location_on" size={20} />
                                            {branch.address}, {branch.city}
                                        </p>

                                        <dl className="branch-card-hours">
                                            {branch.hours.map((row) => (
                                                <div key={row.days}>
                                                    <dt>{row.days}</dt>
                                                    <dd className={row.closed ? "is-closed" : undefined}>{row.time}</dd>
                                                </div>
                                            ))}
                                        </dl>

                                        <a href={telUrl(branch.phone)} className="branch-card-phone">
                                            <Icon name="call" size={20} />
                                            <span className="mono">{branch.phone}</span>
                                        </a>

                                        <div className="branch-card-actions">
                                            <a href={branch.mapsUrl} target="_blank" rel="noreferrer" className="btn btn-primary btn-lg">
                                                <Icon name="directions" size={20} />
                                                Cómo llegar
                                            </a>
                                            <a href={telUrl(branch.phone)} className="btn btn-secondary btn-lg">
                                                <Icon name="call" size={20} />
                                                Llamar
                                            </a>
                                        </div>
                                    </div>
                                </Reveal>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            <section className="section-dark branches-band" aria-label="Reservar turno">
                <div className="container">
                    <div className="branches-band-card">
                        <span className="branches-band-icon">
                            <Icon name="schedule" size={24} />
                        </span>
                        <div className="branches-band-copy">
                            <h2>¿Ya sabés dónde? Reservá tu turno</h2>
                            <p>Atendemos con turno. Elegís servicio, barbero y horario online, sin cuenta y sin seña.</p>
                        </div>
                        <Link to="/reservar" className="btn btn-primary btn-lg">
                            Reservar turno
                        </Link>
                    </div>
                </div>
            </section>
        </>
    );
}
