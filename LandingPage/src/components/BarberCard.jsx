import { Link } from "react-router-dom";
import { buildAssetUrl } from "../services/api";
import { fullName, initialsOf } from "../utils/format";
import AsyncImage from "./ui/AsyncImage";
import Icon from "./ui/Icon";
import Skeleton from "./ui/Skeleton";
import "./BarberCard.css";

const MAX_SERVICES = 3;

// layout="column": tarjeta vertical (página Barberos) · layout="row": foto al costado (inicio)
export default function BarberCard({ barber, services = [], layout = "column" }) {
    const name = fullName(barber);
    const photoUrl = barber.photos?.[0] ? buildAssetUrl(barber.photos[0]) : null;
    const offered = services.filter((service) => barber.service_ids?.includes(service.id));
    const visible = offered.slice(0, MAX_SERVICES);
    const hidden = offered.length - visible.length;

    return (
        <article className={`barber-card barber-card-${layout}`}>
            <Link to={`/barberos/${barber.id}`} className="barber-card-photo" tabIndex={-1} aria-hidden="true">
                <AsyncImage
                    src={photoUrl}
                    alt={photoUrl ? `Foto de ${name}` : `Monograma de ${name}`}
                    aspectRatio="4 / 5"
                    initials={initialsOf(barber)}
                />
            </Link>

            <div className="barber-card-body">
                <h3 className="barber-card-name">
                    <Link to={`/barberos/${barber.id}`}>{name}</Link>
                </h3>
                <p className="barber-card-bio">{barber.bio || "Barbero del equipo de Oficio."}</p>

                {visible.length > 0 && (
                    <ul className="barber-card-services" aria-label={`Servicios de ${barber.first_name}`}>
                        {visible.map((service) => (
                            <li key={service.id}>{service.name}</li>
                        ))}
                        {hidden > 0 && <li className="is-more">+{hidden}</li>}
                    </ul>
                )}

                <div className="barber-card-actions">
                    <Link to={`/reservar?barbero=${barber.id}`} className="btn btn-secondary btn-md">
                        Reservar con {barber.first_name}
                    </Link>
                    <Link to={`/barberos/${barber.id}`} className="text-link">
                        Ver perfil
                        <Icon name="arrow_forward" size={18} />
                    </Link>
                </div>
            </div>
        </article>
    );
}

export function BarberCardSkeleton({ layout = "column" }) {
    return (
        <div className={`barber-card barber-card-${layout}`} aria-hidden="true">
            <Skeleton className="barber-card-photo barber-card-photo-skeleton" height="auto" />
            <div className="barber-card-body">
                <Skeleton height="24px" width="60%" />
                <Skeleton height="14px" width="95%" style={{ marginTop: 14 }} />
                <Skeleton height="14px" width="70%" style={{ marginTop: 8 }} />
                <Skeleton height="44px" width="55%" style={{ marginTop: 24 }} />
            </div>
        </div>
    );
}
