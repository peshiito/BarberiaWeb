import { Link } from "react-router-dom";
import Button from "../ui/Button";
import "./CtaBand.css";

export default function CtaBand() {
    return (
        <section className="cta-band section-ink">
            <div className="container cta-band-inner">
                <h2 className="cta-band-title">¿Listo para tu próximo corte?</h2>
                <p className="cta-band-text">Elegí barbero, día y horario en menos de dos minutos.</p>
                <Button as={Link} to="/reservar" size="lg">
                    Reservar turno
                </Button>
            </div>
        </section>
    );
}
