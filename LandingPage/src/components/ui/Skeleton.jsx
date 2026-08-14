export default function Skeleton({ width, height = "16px", radius, className = "", style = {} }) {
    return (
        <span
            className={`skeleton ${className}`.trim()}
            style={{ width, height, borderRadius: radius, display: "block", ...style }}
            aria-hidden="true"
        />
    );
}
