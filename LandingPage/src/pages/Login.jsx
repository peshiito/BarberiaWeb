import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useDocumentHead } from "../hooks/useDocumentHead";
import { useClientAuth } from "../hooks/useClientAuth";
import { getErrorMessage } from "../utils/apiError";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import FormField from "../components/ui/FormField";
import "./Login.css";

export default function Login() {
    useDocumentHead({ title: "Ingresar", description: "Ingresá a tu cuenta de Oficio Barbería para ver y gestionar tus turnos." });
    const { isAuthenticated, login } = useClientAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [form, setForm] = useState({ firstName: "", lastName: "", phone: "" });
    const [errors, setErrors] = useState({});
    const [status, setStatus] = useState("idle");
    const [apiError, setApiError] = useState(null);

    if (isAuthenticated) {
        return <Navigate to={location.state?.from?.pathname || "/cuenta"} replace />;
    }

    function validate() {
        const next = {};
        if (form.firstName.trim().length < 2) next.firstName = "Ingresá tu nombre.";
        if (form.lastName.trim().length < 2) next.lastName = "Ingresá tu apellido.";
        if (!/^[0-9+\-\s]{8,30}$/.test(form.phone.trim())) next.phone = "Ingresá un teléfono válido.";
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
            await login(form);
            navigate(location.state?.from?.pathname || "/cuenta", { replace: true });
        } catch (error) {
            setStatus("idle");
            setApiError(getErrorMessage(error));
        }
    }

    return (
        <section className="section section-dark login-page">
            <div className="container login-shell">
                <p className="eyebrow">Mi cuenta</p>
                <h1 className="booking-step-title">Ingresá con tu teléfono</h1>
                <p className="booking-step-lede">
                    No usamos contraseña: con tu nombre, apellido y teléfono identificamos tu cuenta. Si ya reservaste antes,
                    vas a entrar directo.
                </p>

                <Card style={{ padding: "var(--space-5)", marginTop: "var(--space-6)" }}>
                    <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
                        <FormField id="login-first-name" label="Nombre" required error={errors.firstName}>
                            <input
                                id="login-first-name"
                                className="form-input"
                                value={form.firstName}
                                onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                                autoComplete="given-name"
                                aria-invalid={Boolean(errors.firstName)}
                            />
                        </FormField>
                        <FormField id="login-last-name" label="Apellido" required error={errors.lastName}>
                            <input
                                id="login-last-name"
                                className="form-input"
                                value={form.lastName}
                                onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                                autoComplete="family-name"
                                aria-invalid={Boolean(errors.lastName)}
                            />
                        </FormField>
                        <FormField id="login-phone" label="Teléfono" required error={errors.phone} hint="Ej: 1123456789">
                            <input
                                id="login-phone"
                                className="form-input"
                                type="tel"
                                value={form.phone}
                                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                                autoComplete="tel"
                                aria-invalid={Boolean(errors.phone)}
                            />
                        </FormField>

                        {apiError && (
                            <p className="form-error" role="alert">
                                {apiError}
                            </p>
                        )}

                        <Button type="submit" loading={status === "loading"} style={{ marginTop: "var(--space-2)" }}>
                            Ingresar
                        </Button>
                    </form>
                </Card>
            </div>
        </section>
    );
}
