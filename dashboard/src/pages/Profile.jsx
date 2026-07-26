import { useEffect, useState } from "react";
import Card from "../components/ui/Card";
import FormField from "../components/ui/FormField";
import PageHeader from "../components/ui/PageHeader";
import { useAuth } from "../context/AuthContext";
import { changeMyPassword, getMyProfile, updateMyProfileDetails } from "../services/profile";
import "./Profile.css";

const Profile = () => {
    const { updateUser } = useAuth();

    const [loading, setLoading] = useState(true);
    const [details, setDetails] = useState({ first_name: "", last_name: "", service_price: 0 });
    const [savingDetails, setSavingDetails] = useState(false);
    const [detailsFeedback, setDetailsFeedback] = useState(null);

    const [passwordForm, setPasswordForm] = useState({
        current_password: "",
        new_password: "",
        confirm_password: "",
    });
    const [savingPassword, setSavingPassword] = useState(false);
    const [passwordFeedback, setPasswordFeedback] = useState(null);

    useEffect(() => {
        const loadProfile = async () => {
            setLoading(true);
            try {
                const profile = await getMyProfile();
                setDetails({
                    first_name: profile.first_name || "",
                    last_name: profile.last_name || "",
                    service_price: profile.service_price || 0,
                });
            } finally {
                setLoading(false);
            }
        };
        loadProfile();
    }, []);

    const handleDetailsChange = e => {
        const { name, value } = e.target;
        setDetails(prev => ({ ...prev, [name]: name === "service_price" ? Number(value) : value }));
    };

    const handleDetailsSubmit = async e => {
        e.preventDefault();
        setDetailsFeedback(null);
        setSavingDetails(true);
        try {
            const updated = await updateMyProfileDetails(details);
            updateUser({ first_name: updated.first_name, last_name: updated.last_name });
            setDetailsFeedback({ type: "success", message: "Datos actualizados correctamente" });
        } catch (err) {
            const message = err.response?.data?.error || "No se pudieron guardar los datos";
            setDetailsFeedback({ type: "error", message });
        } finally {
            setSavingDetails(false);
        }
    };

    const handlePasswordChange = e => {
        const { name, value } = e.target;
        setPasswordForm(prev => ({ ...prev, [name]: value }));
    };

    const handlePasswordSubmit = async e => {
        e.preventDefault();
        setPasswordFeedback(null);

        if (passwordForm.new_password !== passwordForm.confirm_password) {
            setPasswordFeedback({ type: "error", message: "Las contraseñas nuevas no coinciden" });
            return;
        }

        if (passwordForm.new_password.length < 6) {
            setPasswordFeedback({ type: "error", message: "La contraseña nueva debe tener al menos 6 caracteres" });
            return;
        }

        setSavingPassword(true);
        try {
            await changeMyPassword(passwordForm.current_password, passwordForm.new_password);
            setPasswordFeedback({ type: "success", message: "Contraseña actualizada correctamente" });
            setPasswordForm({ current_password: "", new_password: "", confirm_password: "" });
        } catch (err) {
            const message = err.response?.data?.error || "No se pudo cambiar la contraseña";
            setPasswordFeedback({ type: "error", message });
        } finally {
            setSavingPassword(false);
        }
    };

    return (
        <div>
            <PageHeader
                eyebrow="Perfil"
                title="Mis datos"
                description="Actualizá tu información personal, tu precio de servicio y tu contraseña."
            />

            {loading ? (
                <div className="profile-loading">
                    <p>Cargando perfil...</p>
                </div>
            ) : (
                <div className="profile-layout">
                    <Card>
                        <h3 className="profile-section-title">Datos personales</h3>
                        <form onSubmit={handleDetailsSubmit} className="profile-form">
                            <div className="profile-form-row">
                                <FormField label="Nombre">
                                    <input
                                        type="text"
                                        name="first_name"
                                        value={details.first_name}
                                        onChange={handleDetailsChange}
                                        required
                                        minLength={2}
                                    />
                                </FormField>
                                <FormField label="Apellido">
                                    <input
                                        type="text"
                                        name="last_name"
                                        value={details.last_name}
                                        onChange={handleDetailsChange}
                                        required
                                        minLength={2}
                                    />
                                </FormField>
                            </div>

                            <FormField label="Precio del servicio" hint="Precio que se cobra por corte">
                                <input
                                    type="number"
                                    name="service_price"
                                    value={details.service_price}
                                    onChange={handleDetailsChange}
                                    min="0"
                                    step="0.01"
                                    required
                                />
                            </FormField>

                            {detailsFeedback && (
                                <p className={`profile-feedback ${detailsFeedback.type === "error" ? "is-error" : "is-success"}`}>
                                    {detailsFeedback.message}
                                </p>
                            )}

                            <button className="profile-submit-btn" type="submit" disabled={savingDetails}>
                                {savingDetails ? "Guardando..." : "Guardar cambios"}
                            </button>
                        </form>
                    </Card>

                    <Card>
                        <h3 className="profile-section-title">Cambiar contraseña</h3>
                        <form onSubmit={handlePasswordSubmit} className="profile-form">
                            <FormField label="Contraseña actual">
                                <input
                                    type="password"
                                    name="current_password"
                                    value={passwordForm.current_password}
                                    onChange={handlePasswordChange}
                                    required
                                    minLength={6}
                                />
                            </FormField>

                            <FormField label="Contraseña nueva">
                                <input
                                    type="password"
                                    name="new_password"
                                    value={passwordForm.new_password}
                                    onChange={handlePasswordChange}
                                    required
                                    minLength={6}
                                />
                            </FormField>

                            <FormField label="Confirmar contraseña nueva">
                                <input
                                    type="password"
                                    name="confirm_password"
                                    value={passwordForm.confirm_password}
                                    onChange={handlePasswordChange}
                                    required
                                    minLength={6}
                                />
                            </FormField>

                            {passwordFeedback && (
                                <p className={`profile-feedback ${passwordFeedback.type === "error" ? "is-error" : "is-success"}`}>
                                    {passwordFeedback.message}
                                </p>
                            )}

                            <button className="profile-submit-btn" type="submit" disabled={savingPassword}>
                                {savingPassword ? "Guardando..." : "Cambiar contraseña"}
                            </button>
                        </form>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default Profile;
