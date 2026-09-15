import "./BrandMark.css";

// Navaja + palabra en dos capas separadas. En Stitch el logo era una imagen
// que ya incluía el texto y se superponía con el título del header.
export const RazorGlyph = ({ size = 28 }) => (
    <svg className="brand-glyph" width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <path d="M6.2 26.8 16.6 16.4" stroke="currentColor" strokeWidth="3.6" strokeLinecap="round" />
        <circle cx="6" cy="27" r="2.4" fill="var(--surface)" stroke="currentColor" strokeWidth="1.6" />
        <path
            d="M15.6 17.4 26.1 4.9c.6-.7 1.8-.2 1.6.8l-.9 3.4a7 7 0 0 1-1.8 3.2l-6.6 6.6Z"
            fill="var(--on-surface)"
        />
    </svg>
);

const BrandMark = ({ subtitle = "Barbería artesanal", compact = false, className = "" }) => (
    <span className={`brand-mark ${compact ? "is-compact" : ""} ${className}`}>
        <RazorGlyph size={compact ? 26 : 30} />
        <span className="brand-mark-text">
            <span className="brand-mark-name">Oficio</span>
            {!compact && subtitle && <span className="brand-mark-subtitle">{subtitle}</span>}
        </span>
    </span>
);

export default BrandMark;
