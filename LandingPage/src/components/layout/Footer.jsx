import { Link } from "react-router-dom";
import { BRAND } from "../../data/brand";
import { BRANCHES } from "../../data/branches";
import { telUrl, whatsappUrl } from "../../utils/links";
import BrandMark from "../ui/BrandMark";
import { IconWhatsapp } from "../ui/icons";
import "./Footer.css";

export default function Footer() {
    const year = new Date().getFullYear();

    return (
        <footer className="site-footer">
            <div className="container site-footer-grid">
                <div className="site-footer-brand">
                    <Link to="/" className="site-footer-logo" aria-label={`${BRAND.name}, ir al inicio`}>
                        <BrandMark size={32} />
                        <span>{BRAND.shortName}</span>
                    </Link>
                    <p className="site-footer-tagline">{BRAND.tagline}</p>
                    <p className="site-footer-about">
                        Barbería de barrio desde {BRAND.since}. Cortes a tijera y navaja, con turno.
                    </p>
                </div>

                <nav className="site-footer-col" aria-label="Navegación del pie">
                    <p className="site-footer-heading">Navegación</p>
                    <Link to="/">Inicio</Link>
                    <Link to="/barberos">Barberos</Link>
                    <Link to="/sucursales">Sucursales</Link>
                    <Link to="/reservar">Reservar turno</Link>
                </nav>

                <div className="site-footer-col">
                    <p className="site-footer-heading">Sucursales</p>
                    {BRANCHES.map((branch) => (
                        <div key={branch.id} className="site-footer-branch">
                            <p className="site-footer-branch-name">{branch.neighborhood}</p>
                            <p>{branch.address}, {branch.city}</p>
                            {branch.hours.map((row) => (
                                <p key={row.days} className="mono site-footer-small">
                                    {row.days} {row.closed ? "cerrado" : row.time}
                                </p>
                            ))}
                            <a href={telUrl(branch.phone)} className="mono">
                                {branch.phone}
                            </a>
                        </div>
                    ))}
                </div>

                <div className="site-footer-col">
                    <p className="site-footer-heading">Contacto</p>
                    <a className="whatsapp-link" href={whatsappUrl()} target="_blank" rel="noreferrer">
                        <IconWhatsapp width={18} height={18} />
                        <span className="mono">{BRAND.whatsappDisplay}</span>
                    </a>
                    <a href={`mailto:${BRAND.contactEmail}`}>{BRAND.contactEmail}</a>
                </div>
            </div>

            <div className="container site-footer-bottom">
                <p>
                    © {year} {BRAND.name} · Buenos Aires
                </p>
                <div className="site-footer-legal">
                    <Link to="/legal/terminos">Términos y condiciones</Link>
                    <Link to="/legal/privacidad">Política de privacidad</Link>
                </div>
            </div>
        </footer>
    );
}
