import { Link } from "react-router-dom";
import { useBarbers } from "../../hooks/useBarbers";
import { useServices } from "../../hooks/useServices";
import BarberCard, { BarberCardSkeleton } from "../BarberCard";
import Button from "../ui/Button";
import EmptyState from "../ui/EmptyState";
import Icon from "../ui/Icon";
import Reveal from "../ui/Reveal";
import "./BarbersTeaser.css";

export default function BarbersTeaser() {
    const { status, barbers, reload } = useBarbers();
    const { services } = useServices();

    return (
        <section className="section section-dark team-section" aria-labelledby="team-title">
            <div className="container">
                <Reveal className="section-head">
                    <div>
                        <p className="eyebrow">El equipo</p>
                        <h2 id="team-title" className="section-title">
                            Elegí con quién te cortás
                        </h2>
                    </div>
                    <Link to="/barberos" className="text-link">
                        Ver todo el equipo
                        <Icon name="arrow_forward" size={18} />
                    </Link>
                </Reveal>

                {status === "loading" && (
                    <div className="team-track">
                        <BarberCardSkeleton layout="row" />
                        <BarberCardSkeleton layout="row" />
                    </div>
                )}

                {status === "error" && (
                    <EmptyState
                        icon={<Icon name="wifi_off" size={24} />}
                        title="No pudimos cargar el equipo"
                        text="Revisá tu conexión e intentá de nuevo."
                        action={
                            <Button variant="secondary" size="sm" onClick={reload}>
                                Reintentar
                            </Button>
                        }
                    />
                )}

                {status === "success" && barbers.length === 0 && (
                    <EmptyState
                        icon={<Icon name="content_cut" size={24} />}
                        title="Todavía no hay barberos publicados"
                        text="Mientras tanto, podés escribirnos por WhatsApp."
                    />
                )}

                {status === "success" && barbers.length > 0 && (
                    <Reveal delay={80} as="ul" className="team-track">
                        {barbers.slice(0, 4).map((barber) => (
                            <li key={barber.id}>
                                <BarberCard barber={barber} services={services} layout="row" />
                            </li>
                        ))}
                    </Reveal>
                )}
            </div>
        </section>
    );
}
