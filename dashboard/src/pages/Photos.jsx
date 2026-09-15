import { useEffect, useState } from "react";
import PhotoGuide from "../components/profile/PhotoGuide";
import PhotoSlot from "../components/profile/PhotoSlot";
import Button from "../components/ui/Button";
import FormField from "../components/ui/FormField";
import Icon from "../components/ui/Icon";
import InlineFeedback from "../components/ui/InlineFeedback";
import PageHeader from "../components/ui/PageHeader";
import Skeleton from "../components/ui/Skeleton";
import { useToast } from "../components/ui/Toast";
import { useAuth } from "../context/AuthContext";
import { useHomeData } from "../context/HomeDashboardContext";
import { API_ORIGIN } from "../services/api";
import { deletePhoto, getMyPhotos, uploadPhoto } from "../services/photos";
import { getMyProfile, updateMyBio } from "../services/profile";
import { getInitials } from "../utils/format";
import "./PhotosPage.css";

const MAX_PHOTOS = 4;
const BIO_MAX = 1000;

const Photos = () => {
    const { user } = useAuth();
    const { showToast } = useToast();
    const { reload: reloadHome } = useHomeData();

    const [bio, setBio] = useState("");
    const [savedBio, setSavedBio] = useState("");
    const [loadingBio, setLoadingBio] = useState(true);
    const [savingBio, setSavingBio] = useState(false);
    const [bioError, setBioError] = useState("");

    const [photos, setPhotos] = useState([]);
    const [loadingPhotos, setLoadingPhotos] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [removingId, setRemovingId] = useState(null);
    const [photoError, setPhotoError] = useState("");

    const loadPhotos = async () => {
        try {
            const data = await getMyPhotos();
            setPhotos(Array.isArray(data) ? data : []);
        } catch {
            setPhotoError("No se pudieron cargar las fotos.");
        } finally {
            setLoadingPhotos(false);
        }
    };

    useEffect(() => {
        getMyProfile()
            .then(profile => {
                setBio(profile.bio || "");
                setSavedBio(profile.bio || "");
            })
            .catch(() => setBioError("No se pudo cargar tu descripción."))
            .finally(() => setLoadingBio(false));
        loadPhotos();
    }, []);

    const handleBioSubmit = async e => {
        e.preventDefault();
        setBioError("");
        setSavingBio(true);
        try {
            await updateMyBio(bio);
            setSavedBio(bio);
            showToast("Descripción guardada.");
            reloadHome();
        } catch (err) {
            setBioError(err.response?.data?.error || "No se pudo guardar la descripción.");
        } finally {
            setSavingBio(false);
        }
    };

    const handleUpload = async file => {
        setPhotoError("");
        if (file.size > 5 * 1024 * 1024) {
            setPhotoError("La foto pesa más de 5 MB. Probá con una más liviana.");
            return;
        }
        setUploading(true);
        try {
            await uploadPhoto(file);
            await loadPhotos();
            showToast("Foto subida.");
            reloadHome();
        } catch (err) {
            setPhotoError(err.response?.data?.error || "No se pudo subir la foto.");
        } finally {
            setUploading(false);
        }
    };

    const handleRemove = async photoId => {
        setPhotoError("");
        setRemovingId(photoId);
        try {
            await deletePhoto(photoId);
            await loadPhotos();
            showToast("Foto quitada.");
            reloadHome();
        } catch {
            setPhotoError("No se pudo quitar la foto.");
        } finally {
            setRemovingId(null);
        }
    };

    const slots = Array.from({ length: MAX_PHOTOS }, (_, i) => photos[i] || null);
    // Solo el primer hueco vacío acepta subidas: así el orden de las fotos es predecible.
    const firstEmpty = slots.findIndex(slot => !slot);
    const bioDirty = bio !== savedBio;
    const fullName = `${user?.first_name || ""} ${user?.last_name || ""}`.trim();
    const checklist = [
        { key: "bio", label: "Descripción escrita", done: savedBio.trim().length > 0 },
        { key: "main", label: "Foto principal", done: photos.length > 0 },
        { key: "all", label: `${MAX_PHOTOS} fotos subidas`, done: photos.length >= MAX_PHOTOS },
    ];
    const completed = checklist.filter(item => item.done).length;

    return (
        <div>
            <PageHeader
                eyebrow="Tu perfil público"
                title="Fotos y bio"
                titleAccent="Vidriera"
                description="Es lo que ven tus clientes en tu página de la reserva online."
                status={
                    !loadingPhotos && (
                        <span className={`photos-status ${photos.length >= MAX_PHOTOS ? "is-done" : ""}`}>
                            <Icon name="photo_library" size={16} />
                            {photos.length} de {MAX_PHOTOS} fotos
                        </span>
                    )
                }
            />

            <div className="photos-grid-layout">
                <div className="photos-main">
                    <section className="photos-card" aria-labelledby="photos-title">
                        <header className="photos-card-head">
                            <h2 id="photos-title" className="photos-card-title">
                                <Icon name="photo_camera" size={22} />
                                Fotos
                            </h2>
                            <span className="photos-card-aside">
                                {photos.length} de {MAX_PHOTOS}
                            </span>
                        </header>
                        <div className="photos-progress" role="progressbar" aria-valuemin={0} aria-valuemax={MAX_PHOTOS} aria-valuenow={photos.length} aria-label="Fotos subidas">
                            <span style={{ width: `${(photos.length / MAX_PHOTOS) * 100}%` }} />
                        </div>

                        {photoError && <InlineFeedback tone="error">{photoError}</InlineFeedback>}

                        {loadingPhotos ? (
                            <div className="photos-bento">
                                {Array.from({ length: MAX_PHOTOS }).map((_, i) => (
                                    <Skeleton
                                        key={i}
                                        variant="rect"
                                        className={`photos-bento-slot-${i}`}
                                        style={i === 0 ? undefined : { aspectRatio: "1 / 1" }}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="photos-bento">
                                {slots.map((photo, i) => (
                                    <div key={photo?.id || `empty-${i}`} className={`photos-bento-slot-${i}`}>
                                        {photo || i === firstEmpty ? (
                                            <PhotoSlot
                                                photo={photo}
                                                isMain={i === 0}
                                                index={i}
                                                onUpload={handleUpload}
                                                onRemove={handleRemove}
                                                uploading={uploading}
                                                removing={removingId === photo?.id}
                                            />
                                        ) : (
                                            <div className="photos-placeholder" aria-hidden="true">
                                                <Icon name="image" size={24} />
                                            </div>
                                        )}
                                    </div>
                                ))}
                                <div className="photos-bento-tips">
                                    <PhotoGuide />
                                </div>
                            </div>
                        )}
                    </section>

                    <section className="photos-card" aria-labelledby="bio-title">
                        <header className="photos-card-head">
                            <h2 id="bio-title" className="photos-card-title">
                                <Icon name="edit_note" size={22} />
                                Descripción
                            </h2>
                            {bioDirty && <span className="photos-card-aside is-warning">Sin guardar</span>}
                        </header>
                        {loadingBio ? (
                            <Skeleton height="140px" />
                        ) : (
                            <form className="photos-bio" onSubmit={handleBioSubmit}>
                                <FormField
                                    label="Sobre vos"
                                    htmlFor="photos-bio"
                                    aside={`${bio.length} / ${BIO_MAX}`}
                                    hint="Tu especialidad, años de oficio y qué te gusta hacer."
                                >
                                    <textarea
                                        id="photos-bio"
                                        rows={5}
                                        maxLength={BIO_MAX}
                                        value={bio}
                                        onChange={e => setBio(e.target.value)}
                                        placeholder="Ej: barbero hace 8 años, especialista en degradés y barba con navaja."
                                    />
                                </FormField>
                                {bioError && <InlineFeedback tone="error">{bioError}</InlineFeedback>}
                                <div className="photos-bio-actions">
                                    <Button variant="ghost" disabled={!bioDirty || savingBio} onClick={() => setBio(savedBio)}>
                                        Descartar
                                    </Button>
                                    <Button type="submit" icon="save" loading={savingBio} disabled={!bioDirty}>
                                        Guardar descripción
                                    </Button>
                                </div>
                            </form>
                        )}
                    </section>
                </div>

                <aside className="photos-side">
                    <section className="photos-card photos-preview" aria-label="Vista previa de tu perfil">
                        <div className="photos-preview-head">
                            <span className="photos-side-label">Así te ven los clientes</span>
                            <span className="photos-live">
                                <span className="photos-live-dot" aria-hidden="true" />
                                En vivo
                            </span>
                        </div>
                        <div className="photos-preview-media">
                            {photos[0] ? (
                                <img src={`${API_ORIGIN}${photos[0].url}`} alt="" />
                            ) : (
                                <span className="photos-preview-initials" aria-hidden="true">
                                    {getInitials(user?.first_name, user?.last_name)}
                                </span>
                            )}
                        </div>
                        {photos.length > 1 && (
                            <div className="photos-preview-thumbs">
                                {photos.slice(1).map(photo => (
                                    <img key={photo.id} src={`${API_ORIGIN}${photo.url}`} alt="" />
                                ))}
                            </div>
                        )}
                        <h3 className="photos-preview-name">{fullName}</h3>
                        <p className={`photos-preview-bio ${bio.trim() ? "" : "is-empty"}`}>
                            {bio.trim() || "Todavía no escribiste tu descripción."}
                        </p>
                    </section>

                    <section className="photos-card" aria-labelledby="checklist-title">
                        <header className="photos-card-head">
                            <h2 id="checklist-title" className="photos-card-title is-small">
                                Perfil completo
                            </h2>
                            <span className="photos-card-aside">
                                {completed} de {checklist.length}
                            </span>
                        </header>
                        <ul className="photos-checklist">
                            {checklist.map(item => (
                                <li key={item.key} className={item.done ? "is-done" : ""}>
                                    <Icon name={item.done ? "check_circle" : "radio_button_unchecked"} size={18} />
                                    {item.label}
                                </li>
                            ))}
                        </ul>
                    </section>
                </aside>
            </div>
        </div>
    );
};

export default Photos;
