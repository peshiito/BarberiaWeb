import { Link } from "react-router-dom";
import { useBarbers } from "../../hooks/useBarbers";
import BarberCard from "../BarberCard";
import Skeleton from "../ui/Skeleton";
import EmptyState from "../ui/EmptyState";
import Button from "../ui/Button";
import { IconUser } from "../ui/icons";
import "./BarbersTeaser.css";

export default function BarbersTeaser() {
    const { status, barbers, error } = useBarbers();

    return (
        <section className="section section-dark">
            <div className="container">
                <div className="barbers-teaser-head">
                    <div>
                        <p className="eyebrow">Equipo</p>
                        <h2 className="section-title">Conocé a los barberos</h2>
                    </div>
                    <Button as={Link} to="/barberos" variant="secondary">
                        Ver a todos
                    </Button>
                </div>

                {status === "loading" && (
                    <div className="barbers-teaser-grid">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <Skeleton key={i} height="320px" />
                        ))}
                    </div>
                )}

                {status === "error" && <EmptyState icon={<IconUser />} title="No pudimos cargar el equipo" text={error} />}

                {status === "success" && barbers.length === 0 && (
                    <EmptyState icon={<IconUser />} title="Todavía no hay barberos publicados" />
                )}

                {status === "success" && barbers.length > 0 && (
                    <div className="barbers-teaser-grid">
                        {barbers.slice(0, 3).map((barber) => (
                            <BarberCard key={barber.id} barber={barber} />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
