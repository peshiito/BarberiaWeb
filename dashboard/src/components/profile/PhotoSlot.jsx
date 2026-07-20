import "./PhotoSlot.css";

const PhotoSlot = ({ photo, onUpload, onRemove, uploading }) => {
    const handleFileChange = e => {
        const file = e.target.files?.[0];
        if (file) {
            onUpload(file);
        }
        e.target.value = "";
    };

    if (photo) {
        return (
            <div className="photo-slot has-photo">
                <img src={`http://localhost:4000${photo.url}`} alt="Foto del barbero" />
                <button className="photo-slot-remove" onClick={() => onRemove(photo.id)}>
                    Quitar
                </button>
            </div>
        );
    }

    return (
        <label className="photo-slot is-empty">
            {uploading ? (
                <span className="photo-slot-status">Subiendo...</span>
            ) : (
                <>
                    <svg viewBox="0 0 24 24" fill="none" className="photo-slot-icon">
                        <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    <span className="photo-slot-status">Agregar foto</span>
                </>
            )}
            <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                disabled={uploading}
                hidden
            />
        </label>
    );
};

export default PhotoSlot;
