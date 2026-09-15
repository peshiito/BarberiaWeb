import { Link } from "react-router-dom";
import { whatsappUrl } from "../../utils/links";
import Icon from "../ui/Icon";
import { IconWhatsapp } from "../ui/icons";
import Reveal from "../ui/Reveal";
import "./CtaBand.css";

export default function CtaBand() {
    return (
        <section className="section section-dark cta-band" aria-labelledby="cta-title">
            <Reveal className="container cta-band-inner">
                <h2 id="cta-title" className="cta-band-title">
                    ¿Te toca corte?
                </h2>
                <p className="cta-band-text">Elegí servicio, barbero y horario en un par de minutos.</p>
                <div className="cta-band-actions">
                    <Link to="/reservar" className="btn btn-primary btn-lg">
                        <Icon name="calendar_month" size={20} />
                        Reservar turno
                    </Link>
                    <a className="whatsapp-link" href={whatsappUrl()} target="_blank" rel="noreferrer">
                        <IconWhatsapp width={18} height={18} />o escribinos por WhatsApp
                    </a>
                </div>
            </Reveal>
        </section>
    );
}
