import { Link } from "react-router-dom";
import { useDocumentHead } from "../hooks/useDocumentHead";
import { useBarbers } from "../hooks/useBarbers";
import { useServices } from "../hooks/useServices";
import BarberCard, { BarberCardSkeleton } from "../components/BarberCard";
import Button from "../components/ui/Button";
import EmptyState from "../components/ui/EmptyState";
import Icon from "../components/ui/Icon";
import Reveal from "../components/ui/Reveal";
import StickyBookBar from "../components/ui/StickyBookBar";
import "./Barbers.css";

export default function Barbers() {
    useDocumentHead({
        title: "Barberos",
        description: "Conocé al equipo de Oficio Barbería y reservá directo con el barbero que elijas.",
    });
    const { status, barbers, reload } = useBarbers();
    const { services } = useServices();

    return (
        <>
            <section className="section section-dark barbers-page" aria-labelledby="barbers-title">
                <div className="container">
                    <header className="barbers-page-head">
                        <p className="eyebrow">Equipo</p>
                        <h1 id="barbers-title" className="barbers-page-title">
                            Elegí con quién te cortás
                        </h1>
                        <p className="section-lede">Cada barbero maneja su propia agenda. Reservá directo con quien quieras.</p>
                    </header>

                    {status === "loading" && (
                        <div className="barbers-page-grid">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <BarberCardSkeleton key={i} />
                            ))}
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
                            text="Mientras tanto, podés escribirnos por WhatsApp para reservar."
                        />
                    )}

                    {status === "success" && barbers.length > 0 && (
                        <Reveal as="ul" className="barbers-page-grid">
                            {barbers.map((barber) => (
                                <li key={barber.id}>
                                    <BarberCard barber={barber} services={services} />
                                </li>
                            ))}
                        </Reveal>
                    )}
                </div>
            </section>

            <section className="section-cream barbers-band" aria-label="Reservar sin elegir barbero">
                <div className="container barbers-band-inner">
                    <Icon name="content_cut" size={32} className="barbers-band-icon" />
                    <div className="barbers-band-copy">
                        <h2 className="barbers-band-title">¿No sabés con quién?</h2>
                        <p>Elegí el servicio y te mostramos quién lo hace.</p>
                    </div>
                    <Link to="/reservar" className="btn btn-primary btn-lg">
                        Reservar turno
                    </Link>
                </div>
            </section>

            <StickyBookBar />
        </>
    );
}
