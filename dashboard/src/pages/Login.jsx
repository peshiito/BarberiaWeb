import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import FormField from "../components/ui/FormField";
import InlineFeedback from "../components/ui/InlineFeedback";
import { IconEye, IconEyeOff, IconLock } from "../components/ui/icons";
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
            const message = err.response?.data?.error || "No se pudo iniciar sesión";
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-screen">
            <div className="login-panel">
                <div className="login-mark">
                    <span className="login-mark-line" />
                    <span className="login-mark-label">BARBERÍA</span>
                    <span className="login-mark-line" />
                </div>

                <h1 className="login-title">Panel de barberos</h1>
                <p className="login-subtitle">Ingresá con tu cuenta para ver tu agenda</p>

                <form className="login-form" onSubmit={handleSubmit}>
                    <FormField label="Email" htmlFor="email">
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="tu@barberia.com"
                            required
                            autoFocus
                        />
                    </FormField>

                    <FormField label="Contraseña" htmlFor="password">
                        <div className="input-affix">
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="••••••••"
                                autoComplete="current-password"
                                required
                            />
                            <button
                                type="button"
                                className="input-affix-suffix"
                                onClick={() => setShowPassword(v => !v)}
                                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                            >
                                {showPassword ? <IconEyeOff width={18} height={18} /> : <IconEye width={18} height={18} />}
                            </button>
                        </div>
                    </FormField>

                    {error && <InlineFeedback tone="error">{error}</InlineFeedback>}

                    <Button type="submit" loading={loading}>
                        Ingresar
                    </Button>

                    <p className="login-trust-note">
                        <IconLock width={14} height={14} />
                        Conexión cifrada — tu contraseña nunca se guarda en texto plano
                    </p>
                </form>
            </div>

            <div className="login-side">
                <div className="login-side-content">
                    <span className="login-side-eyebrow">Libro de turnos digital</span>
                    <p className="login-side-quote">Cada corte, cada horario, cada barbero — todo en un mismo lugar.</p>
                </div>
            </div>
        </div>
    );
};

export default Login;
