import { Link } from "react-router-dom";
import { useDocumentHead } from "../hooks/useDocumentHead";
import Button from "../components/ui/Button";
import { IconScissors } from "../components/ui/icons";
import "./NotFound.css";

export default function NotFound() {
    useDocumentHead({ title: "Página no encontrada", description: "Esta página no existe." });

    return (
        <section className="section section-ink not-found">
            <div className="container not-found-inner">
                <div className="not-found-icon">
                    <IconScissors width={40} height={40} />
                </div>
                <p className="eyebrow" style={{ justifyContent: "center" }}>
                    Error 404
                </p>
                <h1 className="not-found-title">Este corte no existe</h1>
                <p className="not-found-text">
                    La página que buscás no está disponible. Puede que el enlace haya cambiado o ya no exista.
                </p>
                <Button as={Link} to="/" size="lg">
                    Volver al inicio
                </Button>
            </div>
        </section>
    );
}
