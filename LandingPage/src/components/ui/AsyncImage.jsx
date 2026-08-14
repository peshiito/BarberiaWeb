import { useState } from "react";
import { IconImageBroken } from "./icons";
import "./AsyncImage.css";

// `initials` muestra un monograma en vez del ícono de error cuando no hay foto.
export default function AsyncImage({ src, alt, className = "", aspectRatio = "1 / 1", eager = false, initials }) {
    const [status, setStatus] = useState(src ? "loading" : "empty");

    return (
        <div className={`async-image ${className}`.trim()} style={{ aspectRatio }}>
            {status !== "error" && status !== "empty" && src && (
                <img
                    src={src}
                    alt={alt}
                    loading={eager ? "eager" : "lazy"}
                    className={`async-image-img ${status === "loaded" ? "is-loaded" : ""}`}
                    onLoad={() => setStatus("loaded")}
                    onError={() => setStatus("error")}
                />
            )}
            {status === "loading" && <span className="skeleton async-image-skeleton" aria-hidden="true" />}
            {status === "empty" && initials && (
                <div className="async-image-monogram" role="img" aria-label={alt}>
                    <span>{initials}</span>
                </div>
            )}
            {(status === "error" || (status === "empty" && !initials)) && (
                <div className="async-image-fallback" role="img" aria-label={alt}>
                    <IconImageBroken />
                </div>
            )}
        </div>
    );
}
