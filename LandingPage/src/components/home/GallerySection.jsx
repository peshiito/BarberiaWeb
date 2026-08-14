import { useMemo } from "react";
import { useBarbers } from "../../hooks/useBarbers";
import { buildAssetUrl } from "../../services/api";
import AsyncImage from "../ui/AsyncImage";
import Skeleton from "../ui/Skeleton";
import EmptyState from "../ui/EmptyState";
import Reveal from "../ui/Reveal";
import { IconScissors } from "../ui/icons";
import "./GallerySection.css";

export default function GallerySection() {
    const { status, barbers, error } = useBarbers();

    const photos = useMemo(() => {
        return barbers.flatMap((barber) =>
            (barber.photos || []).map((url) => ({
                url: buildAssetUrl(url),
                alt: `Trabajo de ${barber.first_name} ${barber.last_name}`,
            })),
        );
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
