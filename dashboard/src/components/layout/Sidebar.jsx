import { useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import IconButton from "../ui/IconButton";
import { IconClose } from "../ui/icons";
import "./Sidebar.css";

const iconLogout = (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M7.5 17H4a1 1 0 01-1-1V4a1 1 0 011-1h3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path
            d="M13 14l4-4-4-4M8.5 10H17"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

const FOCUSABLE_SELECTOR =
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export const navItems = [
    { to: "/", label: "Agenda", icon: "calendar" },
    { to: "/clients", label: "Clientes", icon: "contacts" },
    { to: "/profile", label: "Mi perfil", icon: "user" },
];

// Solo barber/admin_barber tienen agenda y fotos propias en el backend
// (`/schedules/*` y `/photos/*` devuelven 403 para un admin puro) — un
// admin sin rol de barbero no debe ver estos links.
export const barberOnlyNavItems = [
    { to: "/schedule", label: "Mis horarios", icon: "clock" },
    { to: "/photos", label: "Fotos y bio", icon: "image" },
];

export const adminItems = [
    { to: "/admin/barbers", label: "Barberos", icon: "users" },
    { to: "/admin/finance", label: "Finanzas", icon: "coin" },
];

const icons = {
    calendar: (
        <svg viewBox="0 0 20 20" fill="none">
            <rect x="3" y="4" width="14" height="13" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M3 8h14M7 2.5v3M13 2.5v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
    ),
    clock: (
        <svg viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" />
            <path d="M10 6.5V10l2.5 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
    ),
    image: (
        <svg viewBox="0 0 20 20" fill="none">
            <rect x="3" y="4" width="14" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="7.5" cy="8.5" r="1.25" stroke="currentColor" strokeWidth="1.5" />
            <path d="M17 12.5l-3.5-3.5-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
    ),
    user: (
        <svg viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="7" r="3.25" stroke="currentColor" strokeWidth="1.5" />
            <path
                d="M3.75 16.5c0-3.45 2.8-6.25 6.25-6.25s6.25 2.8 6.25 6.25"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
            />
        </svg>
    ),
    users: (
        <svg viewBox="0 0 20 20" fill="none">
            <circle cx="7.5" cy="6.5" r="2.5" stroke="currentColor" strokeWidth="1.5" />
            <path
                d="M2.5 16c0-2.76 2.24-5 5-5s5 2.24 5 5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
            />
            <circle cx="14.5" cy="7" r="2" stroke="currentColor" strokeWidth="1.5" />
            <path d="M12.5 11.2c1.9.3 3.5 1.9 3.9 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
    ),
    contacts: (
        <svg viewBox="0 0 20 20" fill="none">
            <rect x="2.5" y="3.5" width="15" height="13" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="8" cy="8.2" r="1.9" stroke="currentColor" strokeWidth="1.5" />
            <path d="M5 13.2c0-1.7 1.3-2.8 3-2.8s3 1.1 3 2.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M12.5 7.5h3M12.5 10.5h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
    ),
    coin: (
        <svg viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" />
            <path
                d="M10 6.5v7M8 8h2.75a1.25 1.25 0 010 2.5H9.5a1.25 1.25 0 000 2.5H12"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    ),
};

const Sidebar = ({ open = false, onClose = () => {} }) => {
    const { user, logout, isAdmin, isBarber } = useAuth();
    const asideRef = useRef(null);

    const initials = user ? `${user.first_name[0]}${user.last_name[0]}` : "";

    // El drawer solo se abre en mobile (< 900px, ver Sidebar.css); en desktop
    // `open` nunca pasa a true porque el botón hamburguesa que lo dispara no
    // se renderiza, así que este efecto es un no-op fuera de mobile.
    useEffect(() => {
        if (!open) return undefined;

        const previouslyFocused = document.activeElement;
        const focusables = asideRef.current?.querySelectorAll(FOCUSABLE_SELECTOR) || [];
        focusables[0]?.focus();

        const handleKeyDown = e => {
            if (e.key === "Escape") {
                onClose();
                return;
            }

            if (e.key !== "Tab") return;

            const nodes = Array.from(asideRef.current?.querySelectorAll(FOCUSABLE_SELECTOR) || []);
            if (nodes.length === 0) return;

            const first = nodes[0];
            const last = nodes[nodes.length - 1];

            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "";
            previouslyFocused?.focus?.();
        };
    }, [open, onClose]);

    return (
        <aside
            ref={asideRef}
            className={`sidebar ${open ? "is-open" : ""}`}
            role={open ? "dialog" : undefined}
            aria-modal={open || undefined}
            aria-label="Menú de navegación"
        >
            <div className="sidebar-brand">
                <span className="sidebar-brand-mark">B</span>
                <span className="sidebar-brand-label">BARBERÍA</span>
                <IconButton
                    icon={<IconClose />}
                    label="Cerrar menú"
                    onClick={onClose}
                    className="sidebar-mobile-close"
                />
            </div>

            <nav className="sidebar-nav">
                <span className="sidebar-nav-heading">General</span>
                {navItems.map(item => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.to === "/"}
                        onClick={onClose}
                        className={({ isActive }) => `sidebar-link ${isActive ? "is-active" : ""}`}
                    >
                        <span className="sidebar-link-icon">{icons[item.icon]}</span>
                        {item.label}
                    </NavLink>
                ))}

                {isBarber &&
                    barberOnlyNavItems.map(item => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            onClick={onClose}
                            className={({ isActive }) => `sidebar-link ${isActive ? "is-active" : ""}`}
                        >
                            <span className="sidebar-link-icon">{icons[item.icon]}</span>
                            {item.label}
                        </NavLink>
                    ))}

                {isAdmin && (
                    <>
                        <span className="sidebar-nav-heading">Administración</span>
                        {adminItems.map(item => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                onClick={onClose}
                                className={({ isActive }) => `sidebar-link ${isActive ? "is-active" : ""}`}
                            >
                                <span className="sidebar-link-icon">{icons[item.icon]}</span>
                                {item.label}
                            </NavLink>
                        ))}
                    </>
                )}
            </nav>

            <div className="sidebar-user">
                <span className="sidebar-user-avatar">{initials}</span>
                <div className="sidebar-user-info">
                    <span className="sidebar-user-name">
                        {user?.first_name} {user?.last_name}
                    </span>
                    <span className="sidebar-user-role">{user?.role}</span>
                </div>
                <IconButton icon={iconLogout} label="Cerrar sesión" variant="danger" onClick={logout} />
            </div>
        </aside>
    );
};

export default Sidebar;
