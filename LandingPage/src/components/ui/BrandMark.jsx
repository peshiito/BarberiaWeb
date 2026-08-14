/*
  Monograma provisional de marca — ver NECESIDADES_FRONTEND.md, sección Marca.
  Un solo lugar para reemplazar por un isotipo definitivo más adelante: este
  componente es el único punto donde vive el trazado del logo (Header, Footer,
  favicon y la imagen OG se generan a partir del mismo mark, ver
  scripts/generate-brand-assets.mjs).
*/
export default function BrandMark({ size = 32, className = "" }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 120 120"
            className={`brand-mark ${className}`}
            role="img"
            aria-label="Isotipo de Oficio Barbería"
        >
            <circle cx="60" cy="60" r="57" fill="var(--carbon, #1c1b17)" stroke="var(--brass, #b8925a)" strokeWidth="3" />
            <circle cx="60" cy="60" r="31" fill="none" stroke="var(--brass, #b8925a)" strokeWidth="9" />
            <line x1="27" y1="85" x2="93" y2="35" stroke="var(--burgundy-bright, #a84747)" strokeWidth="7" strokeLinecap="round" />
            <circle cx="93" cy="35" r="4.5" fill="var(--brass-bright, #d4ab73)" />
            <circle cx="27" cy="85" r="4.5" fill="var(--brass-bright, #d4ab73)" />
        </svg>
    );
}
