import { useEffect, useState } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import { BRAND } from "../../data/brand";
import { useClientAuth } from "../../hooks/useClientAuth";
import Button from "../ui/Button";
import BrandMark from "../ui/BrandMark";
import { IconMenu, IconClose, IconUser } from "../ui/icons";
import "./Header.css";

const NAV_LINKS = [
    { to: "/", label: "Inicio", end: true },
    { to: "/barberos", label: "Barberos" },
    { to: "/sucursales", label: "Sucursales" },
];

export default function Header() {
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const { isAuthenticated } = useClientAuth();
    const location = useLocation();

    // Cierra el menú al cambiar de ruta (derivado en render, no en un efecto).
    const [menuOpenForPathname, setMenuOpenForPathname] = useState(location.pathname);
    if (menuOpenForPathname !== location.pathname) {
        setMenuOpenForPathname(location.pathname);
        if (menuOpen) setMenuOpen(false);
    }

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 8);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
        <header className={`site-header ${scrolled ? "is-scrolled" : ""}`}>
            <div className="site-header-inner container">
                <Link to="/" className="site-logo" aria-label={BRAND.name}>
                    <BrandMark size={32} />
                    <span className="site-logo-word">{BRAND.shortName}</span>
                </Link>

                <nav className="site-nav" aria-label="Navegación principal">
                    {NAV_LINKS.map((link) => (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            end={link.end}
                            className={({ isActive }) => `site-nav-link ${isActive ? "is-active" : ""}`}
                        >
                            {link.label}
                        </NavLink>
                    ))}
                </nav>

                <div className="site-header-actions">
                    <Link
                        to={isAuthenticated ? "/cuenta" : "/ingresar"}
                        className="site-account-link"
                        aria-label={isAuthenticated ? "Mi cuenta" : "Ingresar"}
                    >
                        <IconUser width={18} height={18} />
                        <span className="site-account-link-label">{isAuthenticated ? "Mi cuenta" : "Ingresar"}</span>
                    </Link>
                    <Button as={Link} to="/reservar" size="sm">
                        Reservar<span className="site-header-cta-suffix"> turno</span>
                    </Button>
                    <button
                        type="button"
                        className="site-menu-toggle"
                        onClick={() => setMenuOpen((v) => !v)}
                        aria-expanded={menuOpen}
                        aria-controls="mobile-nav"
                        aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
                    >
                        {menuOpen ? <IconClose /> : <IconMenu />}
                    </button>
                </div>
            </div>

            {menuOpen && (
                <nav id="mobile-nav" className="mobile-nav" aria-label="Navegación móvil">
                    {NAV_LINKS.map((link) => (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            end={link.end}
                            className={({ isActive }) => `mobile-nav-link ${isActive ? "is-active" : ""}`}
                            onClick={() => setMenuOpen(false)}
                        >
                            {link.label}
                        </NavLink>
                    ))}
                    <NavLink to={isAuthenticated ? "/cuenta" : "/ingresar"} className="mobile-nav-link" onClick={() => setMenuOpen(false)}>
                        {isAuthenticated ? "Mi cuenta" : "Ingresar"}
                    </NavLink>
                </nav>
            )}
        </header>
    );
}
