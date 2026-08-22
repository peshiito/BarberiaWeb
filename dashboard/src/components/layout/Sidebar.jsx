import { useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import IconButton from "../ui/IconButton";
import {
    IconCalendar,
    IconClock,
    IconClose,
    IconCoin,
    IconContacts,
    IconImage,
    IconLogout,
    IconScissors,
    IconUser,
    IconUsers,
} from "../ui/icons";
import "./Sidebar.css";

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
    { to: "/admin/services", label: "Servicios", icon: "scissors" },
    { to: "/admin/finance", label: "Finanzas", icon: "coin" },
];

const icons = {
    calendar: <IconCalendar />,
    clock: <IconClock />,
    image: <IconImage />,
    user: <IconUser />,
    users: <IconUsers />,
    contacts: <IconContacts />,
    coin: <IconCoin />,
    scissors: <IconScissors />,
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
                <IconButton icon={<IconLogout />} label="Cerrar sesión" variant="danger" onClick={logout} />
            </div>
        </aside>
    );
};

export default Sidebar;
