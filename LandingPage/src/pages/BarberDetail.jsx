import { Link, useParams } from "react-router-dom";
import { useDocumentHead } from "../hooks/useDocumentHead";
import { useBarbers } from "../hooks/useBarbers";
import { useServices } from "../hooks/useServices";
import { buildAssetUrl } from "../services/api";
import { BRAND } from "../data/brand";
import { fullName, initialsOf } from "../utils/format";
import { whatsappUrl } from "../utils/links";
import AsyncImage from "../components/ui/AsyncImage";
import Button from "../components/ui/Button";
import EmptyState from "../components/ui/EmptyState";
import Icon from "../components/ui/Icon";
import { IconWhatsapp } from "../components/ui/icons";
import Reveal from "../components/ui/Reveal";
import ServiceLedger from "../components/ui/ServiceLedger";
import Skeleton from "../components/ui/Skeleton";
import StickyBookBar from "../components/ui/StickyBookBar";
import "./BarberDetail.css";

export default function BarberDetail() {
    const { id } = useParams();
    const { status, barbers, reload } = useBarbers();
    const { status: servicesStatus, services } = useServices();
    const barber = barbers.find((b) => String(b.id) === id);
    const name = barber ? fullName(barber) : "";

    useDocumentHead({
        title: barber ? name : "Barbero",
        description: barber?.bio || "Perfil de barbero en Oficio Barbería.",
    });

    if (status === "loading") {
        return (
            <section className="section section-dark barber-profile" aria-busy="true">
                <div className="container barber-profile-grid">
                    <Skeleton height="auto" className="barber-profile-photo-skeleton" />
                    <div>
                        <Skeleton height="16px" width="30%" />
                        <Skeleton height="56px" width="70%" style={{ marginTop: 16 }} />
                        <Skeleton height="16px" style={{ marginTop: 24 }} />
                        <Skeleton height="16px" width="85%" style={{ marginTop: 8 }} />
                        <Skeleton height="220px" style={{ marginTop: 32 }} />
                    </div>
                </div>
            </section>
        );
    }

    if (status === "error") {
        return (
            <section className="section section-dark">
                <div className="container">
                    <EmptyState
                        icon={<Icon name="wifi_off" size={24} />}
                        title="No pudimos cargar este perfil"
                        text="Revisá tu conexión e intentá de nuevo."
                        action={
                            <Button variant="secondary" size="sm" onClick={reload}>
                                Reintentar
                            </Button>
                        }
                    />
                </div>
            </section>
        );
    }

    if (!barber) {
        return (
            <section className="section section-dark">
                <div className="container">
                    <EmptyState
                        icon={<Icon name="person_off" size={24} />}
                        title="No encontramos a este barbero"
                        text="Puede que ya no forme parte del equipo."
                        action={
                            <Link to="/barberos" className="btn btn-secondary btn-sm">
                                Ver todo el equipo
                            </Link>
                        }
                    />
                </div>
            </section>
        );
    }

    const photos = (barber.photos || []).map(buildAssetUrl);
    const works = photos.slice(1);
    const offered = services.filter((service) => barber.service_ids?.includes(service.id));
    const bioParagraphs = (barber.bio || "").split(/\n+/).filter(Boolean);
    const consultText = `Hola! Quiero consultar por un turno con ${barber.first_name} en ${BRAND.name}.`;

    return (
        <>
            <section className="section section-dark barber-profile" aria-labelledby="barber-name">
                <div className="container">
                    <nav className="barber-crumbs" aria-label="Ubicación">
                        <Link to="/barberos">Equipo</Link>
                        <span aria-hidden="true">/</span>
                        <span aria-current="page">{name}</span>
                    </nav>

                    <div className="barber-profile-grid">
                        <div className="barber-profile-photo">
                            <AsyncImage
                                src={photos[0]}
                                alt={photos[0] ? `Foto de ${name}` : `Monograma de ${name}`}
                                aspectRatio="4 / 5"
                                eager
                                initials={initialsOf(barber)}
                            />
                        </div>

                        <div className="barber-profile-info">
                            <p className="eyebrow">Barbero</p>
                            <h1 id="barber-name" className="barber-profile-name">
                                {name}
                            </h1>

                            <div className="barber-profile-bio">
                                {bioParagraphs.length > 0 ? (
                                    bioParagraphs.map((paragraph, i) => <p key={i}>{paragraph}</p>)
                                ) : (
                                    <p className="is-empty">{barber.first_name} todavía no cargó una descripción.</p>
                                )}
                            </div>

                            <div className="barber-profile-services">
                                <div className="barber-profile-services-head">
                                    <Icon name="content_cut" size={20} />
                                    <h2>Lo que hace</h2>
                                </div>
                                {servicesStatus === "loading" && <Skeleton height="120px" />}
                                {servicesStatus !== "loading" && offered.length > 0 && <ServiceLedger services={offered} />}
                                {servicesStatus !== "loading" && offered.length === 0 && (
                                    <p className="barber-profile-muted">Todavía no tiene servicios publicados.</p>
                                )}
                            </div>

                            <div className="barber-profile-actions">
                                <Link to={`/reservar?barbero=${barber.id}`} className="btn btn-primary btn-lg">
                                    <Icon name="calendar_month" size={20} />
                                    Reservar con {barber.first_name}
                                </Link>
                                <a href={whatsappUrl(consultText)} target="_blank" rel="noreferrer" className="btn btn-whatsapp btn-lg">
                                    <IconWhatsapp width={20} height={20} />
                                    Consultar por WhatsApp
                                </a>
                            </div>
                            <p className="barber-profile-note">
                                <Icon name="payments" size={18} />
                                {BRAND.paymentNote}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="section section-ink barber-works" aria-labelledby="works-title">
                <div className="container">
                    <p className="eyebrow">Trabajos</p>
                    <h2 id="works-title" className="section-title">
                        Trabajos de {barber.first_name}
                    </h2>

                    {works.length > 0 ? (
                        <Reveal as="ul" className="barber-works-grid">
                            {works.map((url, i) => (
                                <li key={url + i}>
                                    <AsyncImage src={url} alt={`Trabajo de ${name}`} aspectRatio="4 / 5" />
                                </li>
                            ))}
                        </Reveal>
                    ) : (
                        <div className="barber-works-empty">
                            <Icon name="photo_camera" size={24} />
                            <p>
                                {barber.first_name} todavía no subió {photos.length > 0 ? "más " : ""}fotos de sus trabajos.
                            </p>
                        </div>
                    )}
                </div>
            </section>

            <StickyBookBar
                to={`/reservar?barbero=${barber.id}`}
                label={`Reservar con ${barber.first_name}`}
                whatsappText={consultText}
            />
        </>
    );
}
