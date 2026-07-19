import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Login.css";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
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
                    <div className="login-field">
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="tu@barberia.com"
                            required
                            autoFocus
                        />
                    </div>

                    <div className="login-field">
                        <label htmlFor="password">Contraseña</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    {error && <p className="login-error">{error}</p>}

                    <button className="login-submit" type="submit" disabled={loading}>
                        {loading ? "Ingresando..." : "Ingresar"}
                    </button>
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
