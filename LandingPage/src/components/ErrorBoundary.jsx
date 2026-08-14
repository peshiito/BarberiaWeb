import { Component } from "react";
import Button from "./ui/Button";

export default class ErrorBoundary extends Component {
    state = { hasError: false };

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error, info) {
        console.error("Unhandled UI error:", error, info);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="container section" style={{ textAlign: "center" }}>
                    <p className="eyebrow" style={{ justifyContent: "center" }}>
                        Error inesperado
                    </p>
                    <h1 style={{ fontSize: "var(--text-3xl)", marginTop: "var(--space-3)" }}>
                        Algo se rompió de este lado
                    </h1>
                    <p style={{ color: "var(--text-on-dark-secondary)", marginTop: "var(--space-3)" }}>
                        Ya lo sabemos. Probá recargar la página o volver al inicio.
                    </p>
                    <div style={{ marginTop: "var(--space-6)", display: "flex", gap: "var(--space-3)", justifyContent: "center" }}>
                        <Button onClick={() => window.location.reload()}>Recargar</Button>
                        <Button as="a" href="/" variant="secondary">
                            Ir al inicio
                        </Button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
