import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { BRAND } from "../../data/brand";
import { BRANCHES } from "../../data/branches";
import { telUrl, whatsappUrl } from "../../utils/links";
import BrandMark from "../ui/BrandMark";
import Icon from "../ui/Icon";
import { IconWhatsapp } from "../ui/icons";
import "./Header.css";

const NAV_LINKS = [
    { to: "/", label: "Inicio", end: true },
    { to: "/barberos", label: "Barberos" },
    { to: "/sucursales", label: "Sucursales" },
];

export default function Header() {
    const location = useLocation();
    const isHome = location.pathname === "/";
    const isBooking = location.pathname.startsWith("/reservar");
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const toggleRef = useRef(null);
    const firstLinkRef = useRef(null);

    // Cierra el menú al cambiar de ruta (derivado en render, sin efecto).
    const [lastPath, setLastPath] = useState(location.pathname);
    if (lastPath !== location.pathname) {
        setLastPath(location.pathname);
        if (menuOpen) setMenuOpen(false);
    }

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 12);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    useEffect(() => {
        if (!menuOpen) return undefined;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        firstLinkRef.current?.focus();
        const toggle = toggleRef.current;
        const onKey = (e) => {
            if (e.key === "Escape") setMenuOpen(false);
        };
        document.addEventListener("keydown", onKey);
        return () => {
            document.body.style.overflow = previousOverflow;
            document.removeEventListener("keydown", onKey);
            toggle?.focus();
        };
    }, [menuOpen]);

    const overlay = isHome && !scrolled && !menuOpen;

    return (
        <>
        <header className={`site-header ${overlay ? "is-overlay" : ""} ${scrolled || menuOpen ? "is-solid" : ""}`}>
            <div className="site-header-inner container">
                <Link to="/" className="site-logo" aria-label={`${BRAND.name}, ir al inicio`}>
                    <BrandMark size={34} />
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
                    <a
                        className="site-header-whatsapp"
                        href={whatsappUrl()}
                        target="_blank"
                        rel="noreferrer"
                    >
                        <IconWhatsapp width={18} height={18} />
                        <span>WhatsApp</span>
                    </a>
                    {!isBooking && (
                        <Link to="/reservar" className="btn btn-primary btn-md site-header-cta">
                            Reservar<span className="site-header-cta-suffix"> turno</span>
                        </Link>
                    )}
                    <button
                        ref={toggleRef}
                        type="button"
                        className="site-menu-toggle"
                        onClick={() => setMenuOpen((v) => !v)}
                        aria-expanded={menuOpen}
                        aria-controls="mobile-menu"
                        aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
                    >
                        <Icon name={menuOpen ? "close" : "menu"} size={24} />
                    </button>
                </div>
            </div>

        </header>
        <div
            id="mobile-menu"
            className={`mobile-menu ${menuOpen ? "is-open" : ""}`}
            role="dialog"
            aria-modal="true"
            aria-label="Menú"
            inert={!menuOpen || undefined}
        >
            <nav className="mobile-menu-nav container" aria-label="Navegación móvil">
                {NAV_LINKS.map((link, index) => (
                    <NavLink
                        key={link.to}
                        ref={index === 0 ? firstLinkRef : undefined}
                        to={link.to}
                        end={link.end}
                        className={({ isActive }) => `mobile-menu-link ${isActive ? "is-active" : ""}`}
                        onClick={() => setMenuOpen(false)}
                    >
                        {link.label}
                        <Icon name="arrow_forward" size={22} />
                    </NavLink>
                ))}

                <Link to="/reservar" className="btn btn-primary btn-lg btn-block mobile-menu-cta" onClick={() => setMenuOpen(false)}>
                    <Icon name="calendar_month" size={20} />
                    Reservar turno
                </Link>
                <a className="btn btn-whatsapp btn-lg btn-block" href={whatsappUrl()} target="_blank" rel="noreferrer">
                    <IconWhatsapp width={20} height={20} />
                    Escribinos por WhatsApp
                </a>

                <ul className="mobile-menu-branches">
                    {BRANCHES.map((branch) => (
                        <li key={branch.id}>
                            <p className="mobile-menu-branch-name">{branch.neighborhood}</p>
                            <p>{branch.address}, {branch.city}</p>
                            <a href={telUrl(branch.phone)} className="mono">
                                {branch.phone}
                            </a>
                        </li>
                    ))}
                </ul>
            </nav>
        </div>
        </>
    );
}
