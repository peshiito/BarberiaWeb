import Badge from "../ui/Badge";
import { API_ORIGIN } from "../../services/api";
import "./PhotoSlot.css";

const PhotoSlot = ({ photo, isMain, onUpload, onRemove, uploading }) => {
    const handleFileChange = e => {
        const file = e.target.files?.[0];
        if (file) {
            onUpload(file);
        }
        e.target.value = "";
    };

    const ratioClass = isMain ? "photo-slot-main" : "photo-slot-secondary";

    if (photo) {
        return (
            <div className={`photo-slot ${ratioClass} has-photo`}>
                {isMain && (
                    <span className="photo-slot-badge">
                        <Badge tone="brass">Principal</Badge>
                    </span>
                )}
                <img src={`${API_ORIGIN}${photo.url}`} alt="Foto del barbero" />
                <button className="photo-slot-remove" onClick={() => onRemove(photo.id)}>
                    Quitar
                </button>
            </div>
        );
    }

    return (
        <label className={`photo-slot ${ratioClass} is-empty`}>
            {uploading ? (
                <span className="photo-slot-status">Subiendo...</span>
            ) : (
                <>
                    <svg viewBox="0 0 24 24" fill="none" className="photo-slot-icon" aria-hidden="true">
                        <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    <span className="photo-slot-status">{isMain ? "Foto principal" : "Agregar foto"}</span>
                </>
            )}
            <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                disabled={uploading}
                aria-label={isMain ? "Agregar foto principal" : "Agregar foto"}
                className="photo-slot-input"
            />
        </label>
    );
};

export default PhotoSlot;
