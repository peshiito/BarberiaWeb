import { useMemo } from "react";
import { useBarbers } from "../../hooks/useBarbers";
import { buildAssetUrl } from "../../services/api";
import { fullName } from "../../utils/format";
import corteBarba from "../../assets/images/galeria-corte-barba.jpg";
import corteClasico from "../../assets/images/galeria-corte-clasico.jpg";
import AsyncImage from "../ui/AsyncImage";
import Reveal from "../ui/Reveal";
import Skeleton from "../ui/Skeleton";
import "./GallerySection.css";

// 1 grande + 4 chicas arman dos filas completas sin huecos.
const MAX_PHOTOS = 5;

// Fotos propias del local, mientras el equipo sube sus trabajos desde el dashboard.
const HOUSE_PHOTOS = [
    { url: corteBarba, alt: "Corte con barba prolija en Oficio Barbería", caption: null },
    { url: corteClasico, alt: "Corte clásico a peine en Oficio Barbería", caption: null },
];

export default function GallerySection() {
    const { status, barbers } = useBarbers();

    const photos = useMemo(() => {
        const teamPhotos = barbers.flatMap((barber) =>
            (barber.photos || []).map((url) => ({
                url: buildAssetUrl(url),
                alt: `Trabajo de ${fullName(barber)}`,
                caption: fullName(barber),
            })),
        );
        return [...teamPhotos, ...HOUSE_PHOTOS].slice(0, MAX_PHOTOS);
    }, [barbers]);

    return (
        <section className="section section-ink gallery-section" aria-labelledby="gallery-title">
            <div className="container">
                <Reveal>
                    <p className="eyebrow">Trabajos</p>
                    <h2 id="gallery-title" className="section-title">
                        Trabajo real, barberos reales
                    </h2>
                    <p className="section-lede">Fotos de nuestro equipo, no de un banco de imágenes.</p>
                </Reveal>

                {status === "loading" ? (
                    <div className="gallery-grid" data-count="4" aria-hidden="true">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <Skeleton key={i} className="gallery-item" height="100%" />
                        ))}
                    </div>
                ) : (
                    <Reveal delay={80} as="ul" className="gallery-grid" data-count={Math.min(photos.length, 5)}>
                        {photos.map((photo, i) => (
                            <li key={photo.url + i} className="gallery-item">
                                <figure>
                                    <AsyncImage src={photo.url} alt={photo.alt} aspectRatio="auto" />
                                    {photo.caption && <figcaption>{photo.caption}</figcaption>}
                                </figure>
                            </li>
                        ))}
                    </Reveal>
                )}
            </div>
        </section>
    );
}
