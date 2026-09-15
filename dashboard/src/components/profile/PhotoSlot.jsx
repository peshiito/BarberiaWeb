import { useState } from "react";
import { API_ORIGIN } from "../../services/api";
import Icon from "../ui/Icon";
import "./PhotoSlotTile.css";

const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];

const PhotoSlot = ({ photo, isMain, index, onUpload, onRemove, uploading, removing }) => {
    const [dragOver, setDragOver] = useState(false);
    const shape = isMain ? "is-main" : "is-secondary";

    if (photo) {
        return (
            <figure className={`photo-tile ${shape} has-photo`}>
                <img src={`${API_ORIGIN}${photo.url}`} alt={isMain ? "Tu foto principal" : `Foto ${index + 1}`} />
                {isMain && <span className="photo-tile-badge">Principal</span>}
                <button
                    type="button"
                    className="photo-tile-remove"
                    onClick={() => onRemove(photo.id)}
                    disabled={removing}
                    aria-label={isMain ? "Quitar la foto principal" : `Quitar la foto ${index + 1}`}
                >
                    <Icon name={removing ? "progress_activity" : "delete"} size={18} className={removing ? "is-spinning" : ""} />
                </button>
            </figure>
        );
    }

    const handleFiles = files => {
        const file = files?.[0];
        if (file) onUpload(file);
    };

    return (
        <label
            className={`photo-tile ${shape} is-empty ${dragOver ? "is-drag" : ""} ${uploading ? "is-busy" : ""}`}
            onDragOver={e => {
                e.preventDefault();
                if (!uploading) setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => {
                e.preventDefault();
                setDragOver(false);
                if (uploading) return;
                const file = [...e.dataTransfer.files].find(f => ACCEPTED.includes(f.type));
                if (file) onUpload(file);
            }}
        >
            <span className="photo-tile-empty">
                <Icon
                    name={uploading ? "progress_activity" : isMain ? "add_a_photo" : "add_photo_alternate"}
                    size={isMain ? 32 : 26}
                    className={uploading ? "is-spinning" : ""}
                />
                <span className="photo-tile-title">
                    {uploading ? "Subiendo…" : isMain ? "Foto principal" : "Agregar foto"}
                </span>
                {!uploading && <span className="photo-tile-hint">{isMain ? "Vertical, 4:5" : "Tocá o arrastrá"}</span>}
            </span>
            <input
                type="file"
                accept={ACCEPTED.join(",")}
                onChange={e => {
                    handleFiles(e.target.files);
                    e.target.value = "";
                }}
                disabled={uploading}
                aria-label={isMain ? "Subir foto principal" : "Subir foto"}
                className="photo-tile-input"
            />
        </label>
    );
};

export default PhotoSlot;
