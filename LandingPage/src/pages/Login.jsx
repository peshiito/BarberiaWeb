import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { useDocumentHead } from "../hooks/useDocumentHead";
import { useClientAuth } from "../hooks/useClientAuth";
import { getErrorMessage } from "../utils/apiError";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import FormField from "../components/ui/FormField";
import Reveal from "../components/ui/Reveal";
import PasswordStrength, { getPasswordLevel } from "../components/ui/PasswordStrength";
import { IconEye, IconEyeOff, IconLock } from "../components/ui/icons";
import "./Login.css";

const NAME_MIN = 2;
const PHONE_REGEX = /^[0-9+\-\s]{8,30}$/;
const EASE_OUT = [0.23, 1, 0.32, 1];

function validateName(value) {
    return value.trim().length >= NAME_MIN;
}

function isStrongPassword(value) {
    return (
        value.length >= 8 && /[A-Z]/.test(value) && /[0-9]/.test(value) && /[^a-zA-Z0-9]/.test(value)
    );
}

export default function Login() {
    useDocumentHead({ title: "Ingresar", description: "Ingresá a tu cuenta de Oficio Barbería para ver y gestionar tus turnos." });
    const { isAuthenticated, login, register, claimLegacy } = useClientAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // "login" | "register" | "claim" — claim se activa solo automáticamente
    // cuando el backend detecta una cuenta creada antes de que existiera
    // contraseña (turno reservado en persona antes de este cambio).
    const [mode, setMode] = useState("login");
    const [form, setForm] = useState({ firstName: "", lastName: "", phone: "", password: "" });
    const [errors, setErrors] = useState({});
    const [status, setStatus] = useState("idle");
    const [apiError, setApiError] = useState(null);
    const [showPassword, setShowPassword] = useState(false);

    if (isAuthenticated) {
        return <Navigate to={location.state?.from?.pathname || "/cuenta"} replace />;
    }

    function updateField(field) {
        return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
    }

    function switchMode(nextMode) {
        setMode(nextMode);
        setErrors({});
        setApiError(null);
    }


    function validate() {
        const next = {};
        if (mode !== "login" && !validateName(form.firstName)) next.firstName = "Ingresá tu nombre.";
        if (mode !== "login" && !validateName(form.lastName)) next.lastName = "Ingresá tu apellido.";
        if (mode !== "claim" && !PHONE_REGEX.test(form.phone.trim())) next.phone = "Ingresá un teléfono válido.";
        if (mode === "login") {
            if (!form.password) next.password = "Ingresá tu contraseña.";
        } else if (!isStrongPassword(form.password)) {
            next.password = "Tiene que cumplir los 4 requisitos de abajo.";
        }
        setErrors(next);
        return Object.keys(next).length === 0;
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (status === "loading") return;
        if (!validate()) return;
        setStatus("loading");
        setApiError(null);
        try {
            if (mode === "register") {
                await register(form);
            } else if (mode === "claim") {
                await claimLegacy(form);
            } else {
                await login(form);
            }
            navigate(location.state?.from?.pathname || "/cuenta", { replace: true });
        } catch (error) {
            setStatus("idle");
            if (mode === "login" && error.response?.data?.error === "legacy_account") {
                setMode("claim");
                setApiError(null);
                return;
            }
            setApiError(getErrorMessage(error));
        }
    }

    const title = mode === "register" ? "Creá tu cuenta" : mode === "claim" ? "Confirmá tus datos" : "Ingresá a tu cuenta";
    const lede =
        mode === "register"
            ? "Con tu nombre, teléfono y una contraseña vas a poder ver y gestionar tus turnos."
            : mode === "claim"
              ? "Ya reservaste antes, pero tu cuenta todavía no tiene contraseña. Confirmá tu nombre y creá una para seguir."
              : "Ingresá con tu teléfono y contraseña.";

    return (
        <section className="section section-dark login-page">
            <div className="container login-shell">
                <p className="eyebrow">Mi cuenta</p>
                <h1 className="booking-step-title">{title}</h1>
                <p className="booking-step-lede">{lede}</p>

                {mode !== "claim" && (
                    <div className="login-tabs" role="tablist" aria-label="Modo de acceso">
                        <button
                            type="button"
                            role="tab"
                            aria-selected={mode === "login"}
                            className={`login-tab ${mode === "login" ? "is-active" : ""}`}
                            onClick={() => switchMode("login")}
                        >
                            Ingresar
                            {mode === "login" && (
                                <motion.span
                                    className="login-tab-indicator"
                                    layoutId="login-tab-indicator"
                                    transition={{ duration: 0.28, ease: EASE_OUT }}
                                />
                            )}
                        </button>
                        <button
                            type="button"
                            role="tab"
                            aria-selected={mode === "register"}
                            className={`login-tab ${mode === "register" ? "is-active" : ""}`}
                            onClick={() => switchMode("register")}
                        >
                            Crear cuenta
                            {mode === "register" && (
                                <motion.span
                                    className="login-tab-indicator"
                                    layoutId="login-tab-indicator"
                                    transition={{ duration: 0.28, ease: EASE_OUT }}
                                />
                            )}
                        </button>
                    </div>
                )}

                <Reveal delay={100}>
                <Card className="login-card" style={{ padding: "var(--space-5)", marginTop: "var(--space-6)" }}>
                    <span className="login-card-corner login-card-corner-tl" aria-hidden="true" />
                    <span className="login-card-corner login-card-corner-br" aria-hidden="true" />
                    <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
                        {mode !== "login" && (
                            <FormField id="login-first-name" label="Nombre" required error={errors.firstName}>
                                <input
                                    id="login-first-name"
                                    className="form-input"
                                    value={form.firstName}
                                    onChange={updateField("firstName")}
                                    autoComplete="given-name"
                                    aria-invalid={Boolean(errors.firstName)}
                                />
                            </FormField>
                        )}
                        {mode !== "login" && (
                            <FormField id="login-last-name" label="Apellido" required error={errors.lastName}>
                                <input
                                    id="login-last-name"
                                    className="form-input"
                                    value={form.lastName}
                                    onChange={updateField("lastName")}
                                    autoComplete="family-name"
                                    aria-invalid={Boolean(errors.lastName)}
                                />
                            </FormField>
                        )}
                        {mode !== "claim" && (
                            <FormField id="login-phone" label="Teléfono" required error={errors.phone} hint="Ej: 1123456789">
                                <input
                                    id="login-phone"
                                    className="form-input"
                                    type="tel"
                                    value={form.phone}
                                    onChange={updateField("phone")}
                                    autoComplete="tel"
                                    aria-invalid={Boolean(errors.phone)}
                                />
                            </FormField>
                        )}
                        <FormField id="login-password" label="Contraseña" required error={errors.password}>
                            <div
                                className="form-input-affix"
                                data-level={mode !== "login" ? getPasswordLevel(form.password) : undefined}
                            >
                                <input
                                    id="login-password"
                                    className="form-input"
                                    type={showPassword ? "text" : "password"}
                                    value={form.password}
                                    onChange={updateField("password")}
                                    autoComplete={mode === "login" ? "current-password" : "new-password"}
                                    aria-invalid={Boolean(errors.password)}
                                />
                                <button
                                    type="button"
                                    className="form-input-affix-suffix"
                                    onClick={() => setShowPassword((v) => !v)}
                                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                                >
                                    {showPassword ? <IconEyeOff width={18} height={18} /> : <IconEye width={18} height={18} />}
                                </button>
                            </div>
                        </FormField>

                        {mode !== "login" && <PasswordStrength password={form.password} />}

                        {apiError && (
                            <p className="form-error" role="alert">
                                {apiError}
                            </p>
                        )}

                        <Button type="submit" loading={status === "loading"} style={{ marginTop: "var(--space-2)" }}>
                            {mode === "register" ? "Crear cuenta" : mode === "claim" ? "Crear contraseña" : "Ingresar"}
                        </Button>

                        <p className="form-trust-note">
                            <IconLock width={14} height={14} />
                            Tu contraseña viaja encriptada y nunca se guarda en texto plano.
                        </p>

                        {mode === "claim" && (
                            <button type="button" className="login-back-link" onClick={() => switchMode("login")}>
                                Volver a ingresar
                            </button>
                        )}
                    </form>
                </Card>
                </Reveal>
            </div>
        </section>
    );
}
