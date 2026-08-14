import { Link } from "react-router-dom";
import { BRAND, WHATSAPP_URL } from "../../data/brand";
import BrandMark from "../ui/BrandMark";
import { IconWhatsapp, IconPhone } from "../ui/icons";
import "./Footer.css";

export default function Footer() {
    const year = new Date().getFullYear();

    return (
        <footer className="site-footer">
            <div className="container site-footer-grid">
                <div className="site-footer-brand">
                    <p className="site-footer-logo">
                        <BrandMark size={28} />
                        <span>{BRAND.name}</span>
                    </p>
                    <p className="site-footer-tagline">{BRAND.tagline}</p>
                    <a className="site-footer-whatsapp" href={WHATSAPP_URL} target="_blank" rel="noreferrer">
                        <IconWhatsapp />
                        {BRAND.contactPhoneLabel}
                    </a>
                    <a className="site-footer-whatsapp" href={`tel:${BRAND.whatsappNumber}`}>
                        <IconPhone width={18} height={18} />
                        {BRAND.whatsappDisplay}
                    </a>
                </div>

                <div className="site-footer-col">
                    <p className="site-footer-heading">Navegación</p>
                    <Link to="/">Inicio</Link>
                    <Link to="/barberos">Barberos</Link>
                    <Link to="/sucursales">Sucursales</Link>
                    <Link to="/reservar">Reservar turno</Link>
                </div>

                <div className="site-footer-col">
                    <p className="site-footer-heading">Cuenta</p>
                    <Link to="/ingresar">Ingresar</Link>
                    <Link to="/cuenta">Mis turnos</Link>
                </div>

                <div className="site-footer-col">
                    <p className="site-footer-heading">Legal</p>
                    <Link to="/legal/terminos">Términos y condiciones</Link>
                    <Link to="/legal/privacidad">Política de privacidad</Link>
                </div>
            </div>

            <div className="container site-footer-bottom">
                <p>© {year} {BRAND.name}. Todos los derechos reservados.</p>
            </div>
        </footer>
    );
}
