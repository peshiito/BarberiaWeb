import { useDocumentHead } from "../hooks/useDocumentHead";
import { useBarbers } from "../hooks/useBarbers";
import BarberCard from "../components/BarberCard";
import Skeleton from "../components/ui/Skeleton";
import EmptyState from "../components/ui/EmptyState";
import ErrorState from "../components/ui/ErrorState";
import { IconUser } from "../components/ui/icons";
import "./Barbers.css";

export default function Barbers() {
    useDocumentHead({
        title: "Barberos",
        description: "Conocé a todo el equipo de barberos: su estilo, su experiencia y su disponibilidad.",
    });
    const { status, barbers, error } = useBarbers();

    return (
        <section className="section section-dark barbers-page">
            <div className="container">
                <p className="eyebrow">Equipo</p>
                <h1 className="section-title">Nuestros barberos</h1>
                <p className="section-lede">Elegí con quién querés cortarte y reservá directo desde su perfil.</p>

                {status === "loading" && (
                    <div className="barbers-page-grid">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <Skeleton key={i} height="360px" />
                        ))}
                    </div>
                )}

                {status === "error" && (
                    <ErrorState title="No pudimos cargar el equipo" text={error} onRetry={() => window.location.reload()} />
                )}

                {status === "success" && barbers.length === 0 && (
                    <EmptyState icon={<IconUser />} title="Todavía no hay barberos publicados" text="Volvé a visitarnos pronto." />
                )}

                {status === "success" && barbers.length > 0 && (
                    <div className="barbers-page-grid">
                        {barbers.map((barber) => (
                            <BarberCard key={barber.id} barber={barber} />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
