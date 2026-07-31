import { useEffect, useState } from "react";
import PhotoSlot from "../components/profile/PhotoSlot";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import FormField from "../components/ui/FormField";
import InlineFeedback from "../components/ui/InlineFeedback";
import PageHeader from "../components/ui/PageHeader";
import Skeleton from "../components/ui/Skeleton";
import { deletePhoto, getMyPhotos, uploadPhoto } from "../services/photos";
import { getMyProfile, updateMyBio } from "../services/profile";
import "./Photos.css";

const MAX_PHOTOS = 4;

const Photos = () => {
    const [bio, setBio] = useState("");
    const [savingBio, setSavingBio] = useState(false);
    const [bioFeedback, setBioFeedback] = useState(null);

    const [photos, setPhotos] = useState([]);
    const [loadingPhotos, setLoadingPhotos] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [photoError, setPhotoError] = useState("");

    const loadProfile = async () => {
        try {
            const profile = await getMyProfile();
            setBio(profile.bio || "");
        } catch {
            // silencioso: la bio no es crítica para el resto de la pantalla
        }
    };

    const loadPhotos = async () => {
        setLoadingPhotos(true);
        try {
            const data = await getMyPhotos();
            setPhotos(data);
        } catch {
            setPhotoError("No se pudieron cargar las fotos");
        } finally {
            setLoadingPhotos(false);
        }
    };

    useEffect(() => {
        loadProfile();
        loadPhotos();
    }, []);

    const handleBioSubmit = async e => {
        e.preventDefault();
        setBioFeedback(null);
        setSavingBio(true);
        try {
            await updateMyBio(bio);
            setBioFeedback({ type: "success", message: "Descripción guardada" });
        } catch {
            setBioFeedback({ type: "error", message: "No se pudo guardar la descripción" });
        } finally {
            setSavingBio(false);
        }
    };

    const handleUpload = async file => {
        setPhotoError("");
        setUploading(true);
        try {
            await uploadPhoto(file);
            await loadPhotos();
        } catch (err) {
            const message = err.response?.data?.error || "No se pudo subir la foto";
            setPhotoError(message);
        } finally {
            setUploading(false);
        }
    };

    const handleRemove = async photoId => {
        setPhotoError("");
        try {
            await deletePhoto(photoId);
            await loadPhotos();
        } catch {
            setPhotoError("No se pudo eliminar la foto");
        }
    };

    const slots = Array.from({ length: MAX_PHOTOS }, (_, i) => photos[i] || null);

    return (
        <div>
            <PageHeader
                eyebrow="Fotos y bio"
                title="Fotos y descripción"
                description="Esto es lo que ven tus clientes en la landing page."
            />

            <div className="photos-layout">
                <Card>
                    <h3 className="photos-section-title">Descripción</h3>
                    <form onSubmit={handleBioSubmit} className="photos-bio-form">
                        <FormField label="Sobre vos" hint={`${bio.length}/1000 caracteres`}>
                            <textarea
                                className="textarea"
                                value={bio}
                                onChange={e => setBio(e.target.value)}
                                maxLength={1000}
                                placeholder="Contale a tus clientes tu especialidad y experiencia..."
                            />
                        </FormField>

                        {bioFeedback && (
                            <InlineFeedback tone={bioFeedback.type === "error" ? "error" : "success"}>
                                {bioFeedback.message}
                            </InlineFeedback>
                        )}

                        <Button type="submit" loading={savingBio}>
                            Guardar descripción
                        </Button>
                    </form>
                </Card>

                <Card>
                    <h3 className="photos-section-title">
                        Fotos ({photos.length}/{MAX_PHOTOS})
                    </h3>
                    {photoError && <InlineFeedback tone="error">{photoError}</InlineFeedback>}
                    {loadingPhotos ? (
                        <div className="photos-grid">
                            {Array.from({ length: MAX_PHOTOS }).map((_, i) => (
                                <Skeleton key={i} variant="rect" style={{ aspectRatio: "3 / 4" }} />
                            ))}
                        </div>
                    ) : (
                        <div className="photos-grid">
                            {slots.map((photo, i) => (
                                <PhotoSlot
                                    key={photo?.id || `empty-${i}`}
                                    photo={photo}
                                    onUpload={handleUpload}
                                    onRemove={handleRemove}
                                    uploading={uploading}
                                />
                            ))}
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default Photos;
