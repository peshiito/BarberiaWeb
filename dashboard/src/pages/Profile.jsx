import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import FormField from "../components/ui/FormField";
import Icon from "../components/ui/Icon";
import InlineFeedback from "../components/ui/InlineFeedback";
import PageHeader from "../components/ui/PageHeader";
import Skeleton from "../components/ui/Skeleton";
import { useToast } from "../components/ui/Toast";
import { useAuth } from "../context/AuthContext";
import { changeMyPassword, getMyProfile, updateMyProfileDetails } from "../services/profile";
import { getInitials } from "../utils/format";
import { PASSWORD_RULES, isStrongPassword } from "../utils/passwordRules";
import "./ProfilePage.css";

const ROLE_LABEL = { admin: "Administrador", admin_barber: "Barbero admin", barber: "Barbero" };
const EMPTY_PASSWORDS = { current_password: "", new_password: "", confirm_password: "" };

const PasswordInput = ({ id, value, onChange, autoComplete, visible, onToggle }) => (
    <div className="field-affix">
        <input
            id={id}
            type={visible ? "text" : "password"}
            autoComplete={autoComplete}
            maxLength={100}
            className="is-mono"
            value={value}
            onChange={onChange}
        />
        <button
            type="button"
            className="field-affix-action"
            aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
            onClick={onToggle}
        >
            <Icon name={visible ? "visibility_off" : "visibility"} size={20} />
        </button>
    </div>
);

const Profile = () => {
    const { user, updateUser } = useAuth();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const hasAgenda = user?.role === "barber" || user?.role === "admin_barber";

    const [loading, setLoading] = useState(true);
    const [details, setDetails] = useState({ first_name: "", last_name: "" });
    const [savedDetails, setSavedDetails] = useState({ first_name: "", last_name: "" });
    const [savingDetails, setSavingDetails] = useState(false);
    const [detailsError, setDetailsError] = useState("");

    const [passwords, setPasswords] = useState(EMPTY_PASSWORDS);
    const [showPasswords, setShowPasswords] = useState(false);
    const [savingPassword, setSavingPassword] = useState(false);
    const [passwordError, setPasswordError] = useState("");

    useEffect(() => {
        getMyProfile()
            .then(profile => {
                const next = { first_name: profile.first_name || "", last_name: profile.last_name || "" };
                setDetails(next);
                setSavedDetails(next);
            })
            .catch(() => setDetailsError("No se pudieron cargar tus datos."))
            .finally(() => setLoading(false));
    }, []);

    const detailsDirty =
        details.first_name !== savedDetails.first_name || details.last_name !== savedDetails.last_name;
    const detailsValid = details.first_name.trim().length >= 2 && details.last_name.trim().length >= 2;

    const handleDetailsSubmit = async e => {
        e.preventDefault();
        setDetailsError("");
        if (!detailsValid) {
            setDetailsError("Nombre y apellido necesitan al menos 2 letras.");
            return;
        }
        setSavingDetails(true);
        try {
            const payload = { first_name: details.first_name.trim(), last_name: details.last_name.trim() };
            const updated = await updateMyProfileDetails(payload);
            updateUser({ first_name: updated.first_name, last_name: updated.last_name });
            setDetails(payload);
            setSavedDetails(payload);
            showToast("Datos actualizados.");
        } catch (err) {
            setDetailsError(err.response?.data?.error || "No se pudieron guardar los datos.");
        } finally {
            setSavingDetails(false);
        }
    };

    const setPassword = (name, value) => setPasswords(prev => ({ ...prev, [name]: value }));
    const strong = isStrongPassword(passwords.new_password);
    const matches = passwords.confirm_password.length > 0 && passwords.new_password === passwords.confirm_password;
    const canChangePassword = passwords.current_password.length > 0 && strong && matches && !savingPassword;

    const handlePasswordSubmit = async e => {
        e.preventDefault();
        setPasswordError("");
        if (!canChangePassword) return;
        setSavingPassword(true);
        try {
            await changeMyPassword(passwords.current_password, passwords.new_password);
            setPasswords(EMPTY_PASSWORDS);
            showToast("Contraseña actualizada.");
        } catch (err) {
            const status = err.response?.status;
            setPasswordError(
                status === 401 || status === 403
                    ? "La contraseña actual no es correcta."
                    : err.response?.data?.error || "No se pudo cambiar la contraseña.",
            );
        } finally {
            setSavingPassword(false);
        }
    };

    return (
        <div>
            <PageHeader
                eyebrow="Tu cuenta"
                title="Mi perfil"
                titleAccent="Acceso"
                description="Tus datos personales y la contraseña con la que entrás al panel."
            />

            <section className="profile-hero">
                <span className="profile-hero-avatar" aria-hidden="true">
                    {getInitials(user?.first_name, user?.last_name)}
                </span>
                <div className="profile-hero-id">
                    <span className="profile-hero-role">
                        <span className="profile-hero-dot" aria-hidden="true" />
                        {ROLE_LABEL[user?.role] || user?.role}
                    </span>
                    <h2 className="profile-hero-name">
                        {user?.first_name} {user?.last_name}
                    </h2>
                    <span className="profile-hero-email">{user?.email}</span>
                </div>
                {hasAgenda && (
                    <div className="profile-hero-links">
                        <Button variant="secondary" icon="photo_camera" onClick={() => navigate("/photos")}>
                            Fotos y bio
                        </Button>
                        <Button variant="secondary" icon="schedule" onClick={() => navigate("/schedule")}>
                            Mis horarios
                        </Button>
                    </div>
                )}
            </section>

            <div className="profile-grid">
                <section className="profile-card" aria-labelledby="profile-details-title">
                    <header className="profile-card-head">
                        <h2 id="profile-details-title" className="profile-card-title">
                            <Icon name="badge" size={22} />
                            Datos personales
                        </h2>
                        {detailsDirty && <span className="profile-card-aside">Sin guardar</span>}
                    </header>

                    {loading ? (
                        <Skeleton height="160px" />
                    ) : (
                        <form className="profile-form" onSubmit={handleDetailsSubmit} noValidate>
                            <div className="profile-form-row">
                                <FormField label="Nombre" htmlFor="profile-first">
                                    <input
                                        id="profile-first"
                                        type="text"
                                        autoComplete="given-name"
                                        maxLength={100}
                                        value={details.first_name}
                                        onChange={e => setDetails(prev => ({ ...prev, first_name: e.target.value }))}
                                    />
                                </FormField>
                                <FormField label="Apellido" htmlFor="profile-last">
                                    <input
                                        id="profile-last"
                                        type="text"
                                        autoComplete="family-name"
                                        maxLength={100}
                                        value={details.last_name}
                                        onChange={e => setDetails(prev => ({ ...prev, last_name: e.target.value }))}
                                    />
                                </FormField>
                            </div>
                            <FormField label="Email de acceso" htmlFor="profile-email" hint="Para cambiarlo, pedíselo a un administrador.">
                                <div className="field-affix">
                                    <input id="profile-email" type="email" value={user?.email || ""} readOnly />
                                    <span className="field-affix-suffix" aria-hidden="true">
                                        <Icon name="lock" size={18} />
                                    </span>
                                </div>
                            </FormField>

                            {detailsError && <InlineFeedback tone="error">{detailsError}</InlineFeedback>}

                            <div className="profile-actions">
                                <Button
                                    variant="ghost"
                                    disabled={!detailsDirty || savingDetails}
                                    onClick={() => {
                                        setDetails(savedDetails);
                                        setDetailsError("");
                                    }}
                                >
                                    Descartar
                                </Button>
                                <Button type="submit" icon="save" loading={savingDetails} disabled={!detailsDirty}>
                                    Guardar cambios
                                </Button>
                            </div>
                        </form>
                    )}
                </section>

                <section className="profile-card" aria-labelledby="profile-password-title">
                    <header className="profile-card-head">
                        <h2 id="profile-password-title" className="profile-card-title">
                            <Icon name="key" size={22} />
                            Cambiar contraseña
                        </h2>
                    </header>

                    <form className="profile-form" onSubmit={handlePasswordSubmit} noValidate>
                        <FormField label="Contraseña actual" htmlFor="profile-current">
                            <PasswordInput
                                id="profile-current"
                                autoComplete="current-password"
                                value={passwords.current_password}
                                onChange={e => setPassword("current_password", e.target.value)}
                                visible={showPasswords}
                                onToggle={() => setShowPasswords(v => !v)}
                            />
                        </FormField>

                        <div className="profile-new-password">
                            <FormField label="Contraseña nueva" htmlFor="profile-new">
                                <PasswordInput
                                    id="profile-new"
                                    autoComplete="new-password"
                                    value={passwords.new_password}
                                    onChange={e => setPassword("new_password", e.target.value)}
                                    visible={showPasswords}
                                    onToggle={() => setShowPasswords(v => !v)}
                                />
                            </FormField>
                            <ul className="profile-rules" aria-label="Requisitos de la contraseña">
                                {PASSWORD_RULES.map(rule => {
                                    const ok = rule.test(passwords.new_password);
                                    return (
                                        <li key={rule.key} className={ok ? "is-ok" : ""}>
                                            <Icon name={ok ? "check_circle" : "radio_button_unchecked"} size={16} />
                                            {rule.label}
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>

                        <FormField
                            label="Repetir contraseña nueva"
                            htmlFor="profile-confirm"
                            error={
                                passwords.confirm_password && !matches ? "Las contraseñas nuevas no coinciden." : undefined
                            }
                        >
                            <PasswordInput
                                id="profile-confirm"
                                autoComplete="new-password"
                                value={passwords.confirm_password}
                                onChange={e => setPassword("confirm_password", e.target.value)}
                                visible={showPasswords}
                                onToggle={() => setShowPasswords(v => !v)}
                            />
                        </FormField>

                        {passwordError && <InlineFeedback tone="error">{passwordError}</InlineFeedback>}

                        <div className="profile-actions">
                            <Button type="submit" icon="lock_reset" loading={savingPassword} disabled={!canChangePassword}>
                                Cambiar contraseña
                            </Button>
                        </div>
                    </form>
                </section>
            </div>
        </div>
    );
};

export default Profile;
