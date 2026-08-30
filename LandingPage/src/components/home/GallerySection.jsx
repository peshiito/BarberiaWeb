import { useMemo } from "react";
import { useBarbers } from "../../hooks/useBarbers";
import { buildAssetUrl } from "../../services/api";
import AsyncImage from "../ui/AsyncImage";
import Skeleton from "../ui/Skeleton";
import EmptyState from "../ui/EmptyState";
import Reveal from "../ui/Reveal";
import { IconScissors } from "../ui/icons";
import corteBarba from "../../assets/images/galeria-corte-barba.jpg";
import corteClasico from "../../assets/images/galeria-corte-clasico.jpg";
import "./GallerySection.css";

// Fotos de arranque mientras el equipo todavía no subió trabajos propios desde
// el dashboard — se muestran primero, antes de las reales.
const SEED_PHOTOS = [
    { url: corteBarba, alt: "Corte con barba prolija en Oficio Barbería" },
    { url: corteClasico, alt: "Corte clásico a peine en Oficio Barbería" },
];

export default function GallerySection() {
    const { status, barbers, error } = useBarbers();

    const photos = useMemo(() => {
        const realPhotos = barbers.flatMap((barber) =>
            (barber.photos || []).map((url) => ({
                url: buildAssetUrl(url),
                alt: `Trabajo de ${barber.first_name} ${barber.last_name}`,
            })),
        );
        return [...SEED_PHOTOS, ...realPhotos];
    }, [barbers]);

    return (
        <section className="section section-ink">
            <div className="container">
                <Reveal>
                    <p className="eyebrow">Galería</p>
                    <h2 className="section-title">Trabajo real, barberos reales</h2>
                    <p className="section-lede">
                        Fotos subidas por nuestro propio equipo — nada de bancos de imágenes.
                    </p>
                </Reveal>

                {status === "loading" && (
                    <div className="gallery-grid">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <Skeleton key={i} height="100%" style={{ aspectRatio: "1 / 1" }} />
                        ))}
                    </div>
                )}

                {status === "error" && (
                    <EmptyState
                        icon={<IconScissors />}
                        title="No pudimos cargar la galería"
                        text={error}
                    />
                )}

                {status === "success" && photos.length === 0 && (
                    <EmptyState
                        icon={<IconScissors />}
                        title="Todavía no hay fotos cargadas"
                        text="Nuestro equipo está subiendo su trabajo. Muy pronto vas a ver los cortes acá."
                    />
                )}

                {status === "success" && photos.length > 0 && (
                    <Reveal delay={100} className="gallery-grid">
                        {photos.slice(0, 8).map((photo, i) => (
                            <AsyncImage key={photo.url + i} src={photo.url} alt={photo.alt} aspectRatio="1 / 1" />
                        ))}
                    </Reveal>
                )}
            </div>
        </section>
    );
}
