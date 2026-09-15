import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BrandMark from "../components/ui/BrandMark";
import Button from "../components/ui/Button";
import FormField from "../components/ui/FormField";
import Icon from "../components/ui/Icon";
import InlineFeedback from "../components/ui/InlineFeedback";
import { useAuth } from "../context/AuthContext";
import "./Login.css";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async e => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await login(email, password);
            navigate("/");
        } catch (err) {
            const status = err.response?.status;
            setError(
                status === 401
                    ? "El correo o la contraseña no coinciden."
                    : err.response?.data?.error || "No se pudo iniciar sesión. Probá de nuevo.",
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="login-screen">
            <div className="login-card">
                <header className="login-head">
                    <BrandMark subtitle="Barbería artesanal" className="login-brand" />
                    <span className="login-eyebrow">Área operativa</span>
                    <h1 className="login-title">Acceso al panel</h1>
                    <p className="login-lede">Ingresá con tu cuenta de barbero para gestionar la agenda y los turnos.</p>
                </header>

                <form className="login-form" onSubmit={handleSubmit} noValidate>
                    <FormField label="Correo electrónico" htmlFor="login-email">
                        <div className="field-affix">
                            <span className="field-affix-icon">
                                <Icon name="mail" size={20} />
                            </span>
                            <input
                                id="login-email"
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="tu.nombre@oficiobarberia.com"
                                autoComplete="username"
                                spellCheck={false}
                                required
                                autoFocus
                            />
                        </div>
                    </FormField>

                    <FormField label="Contraseña" htmlFor="login-password">
                        <div className="field-affix">
                            <span className="field-affix-icon">
                                <Icon name="lock" size={20} />
                            </span>
                            <input
                                id="login-password"
                                className="login-password-input"
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                autoComplete="current-password"
                                required
                            />
                            <button
                                type="button"
                                className="field-affix-action"
                                onClick={() => setShowPassword(v => !v)}
                                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                                aria-pressed={showPassword}
                            >
                                <Icon name={showPassword ? "visibility_off" : "visibility"} size={20} />
                            </button>
                        </div>
                    </FormField>

                    {error && <InlineFeedback tone="error">{error}</InlineFeedback>}

                    <Button
                        type="submit"
                        size="lg"
                        block
                        loading={loading}
                        iconRight="arrow_forward"
                        className="login-submit"
                        disabled={!email || !password}
                    >
                        Ingresar al panel
                    </Button>
                </form>

                <p className="login-footnote">Acceso exclusivo para el personal de Oficio Barbería.</p>
            </div>
        </main>
    );
};

export default Login;
