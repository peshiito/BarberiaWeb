import { Link } from "react-router-dom";
import { BRANCHES } from "../../data/branches";
import { telUrl } from "../../utils/links";
import Icon from "../ui/Icon";
import Reveal from "../ui/Reveal";
import "./BranchesTeaser.css";

export default function BranchesTeaser() {
    return (
        <section className="section section-cream branches-teaser" aria-labelledby="branches-teaser-title">
            <div className="container">
                <Reveal className="section-head">
                    <div>
                        <p className="eyebrow">Sucursales</p>
                        <h2 id="branches-teaser-title" className="section-title">
                            Dónde estamos
                        </h2>
                    </div>
                    <Link to="/sucursales" className="text-link">
                        Ver mapas
                        <Icon name="arrow_forward" size={18} />
                    </Link>
                </Reveal>

                <Reveal delay={80} as="ul" className="branches-teaser-grid">
                    {BRANCHES.map((branch) => (
                        <li key={branch.id} className="branch-mini">
                            <h3 className="branch-mini-name">{branch.neighborhood}</h3>
                            <p className="branch-mini-address">
                                <Icon name="location_on" size={18} />
                                {branch.address}, {branch.city}
                            </p>
                            <dl className="branch-mini-hours">
                                {branch.hours.map((row) => (
                                    <div key={row.days}>
                                        <dt>{row.days}</dt>
                                        <dd className={row.closed ? "is-closed" : undefined}>{row.time}</dd>
                                    </div>
                                ))}
                            </dl>
                            <div className="branch-mini-actions">
                                <a href={branch.mapsUrl} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm">
                                    <Icon name="directions" size={18} />
                                    Cómo llegar
                                </a>
                                <a href={telUrl(branch.phone)} className="btn btn-ghost btn-sm">
                                    <Icon name="call" size={18} />
                                    <span className="mono">{branch.phone}</span>
                                </a>
                            </div>
                        </li>
                    ))}
                </Reveal>
            </div>
        </section>
    );
}
