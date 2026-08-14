import { Link, useParams } from "react-router-dom";
import { useDocumentHead } from "../hooks/useDocumentHead";
import { useBarbers } from "../hooks/useBarbers";
import { buildAssetUrl } from "../services/api";
import AsyncImage from "../components/ui/AsyncImage";
import Skeleton from "../components/ui/Skeleton";
import ErrorState from "../components/ui/ErrorState";
import EmptyState from "../components/ui/EmptyState";
import Button from "../components/ui/Button";
import { IconArrowLeft, IconUser } from "../components/ui/icons";
import "./BarberDetail.css";

export default function BarberDetail() {
    const { id } = useParams();
    const { status, barbers, error } = useBarbers();
    const barber = barbers.find((b) => String(b.id) === id);
    const fullName = barber ? `${barber.first_name} ${barber.last_name}` : "";

    useDocumentHead({
        title: barber ? fullName : "Barbero",
        description: barber?.bio || "Perfil de barbero en Oficio Barbería.",
    });

    if (status === "loading") {
        return (
            <section className="section section-dark">
                <div className="container barber-detail-grid">
                    <Skeleton height="420px" />
                    <div>
                        <Skeleton height="32px" width="60%" />
                        <div style={{ marginTop: "var(--space-4)" }}>
                            <Skeleton height="16px" />
                            <div style={{ marginTop: "var(--space-2)" }}>
                                <Skeleton height="16px" width="80%" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    if (status === "error") {
        return (
            <section className="section section-dark container">
                <ErrorState title="No pudimos cargar este perfil" text={error} onRetry={() => window.location.reload()} />
            </section>
        );
    }

    if (!barber) {
        return (
            <section className="section section-dark container">
                <EmptyState
                    icon={<IconUser />}
                    title="No encontramos a este barbero"
                    text="Puede que ya no forme parte del equipo."
                    action={
                        <Button as={Link} to="/barberos" variant="secondary" size="sm">
                            Ver todo el equipo
                        </Button>
                    }
                />
            </section>
        );
    }

    const photos = (barber.photos || []).map(buildAssetUrl);
    const initials = `${barber.first_name?.[0] || ""}${barber.last_name?.[0] || ""}`.toUpperCase();

    return (
        <section className="section section-dark">
            <div className="container">
                <Link to="/barberos" className="barber-detail-back">
                    <IconArrowLeft width={16} height={16} /> Ver todo el equipo
                </Link>

                <div className="barber-detail-grid">
                    <div className="barber-detail-gallery">
                        <AsyncImage
                            src={photos[0]}
                            alt={`Foto principal de ${fullName}`}
                            aspectRatio="4 / 5"
                            eager
                            initials={initials}
                        />
                        {photos.length > 1 && (
                            <div className="barber-detail-thumbs">
                                {photos.slice(1).map((url, i) => (
                                    <AsyncImage key={url + i} src={url} alt={`Foto de ${fullName}`} aspectRatio="1 / 1" />
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="barber-detail-info">
                        <p className="eyebrow">Barbero</p>
                        <h1 className="barber-detail-name">{fullName}</h1>
                        <p className="barber-detail-bio">
                            {barber.bio || "Este barbero todavía no cargó una descripción de su perfil."}
                        </p>
                        <Button as={Link} to={`/reservar?barbero=${barber.id}`} size="lg">
                            Reservar con {barber.first_name}
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
}
