import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Sidebar.css";

const navItems = [
    { to: "/", label: "Agenda", icon: "calendar" },
    { to: "/schedule", label: "Mis horarios", icon: "clock" },
    { to: "/photos", label: "Perfil y fotos", icon: "image" },
];

const adminItems = [
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

const Sidebar = () => {
    const { user, logout, isAdmin } = useAuth();

    const initials = user ? `${user.first_name[0]}${user.last_name[0]}` : "";

    return (
        <aside className="sidebar">
            <div className="sidebar-brand">
                <span className="sidebar-brand-mark">B</span>
                <span className="sidebar-brand-label">BARBERÍA</span>
            </div>

            <nav className="sidebar-nav">
                <span className="sidebar-nav-heading">General</span>
                {navItems.map(item => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.to === "/"}
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
                <button className="sidebar-logout" onClick={logout} title="Cerrar sesión">
                    <svg viewBox="0 0 20 20" fill="none">
                        <path
                            d="M7.5 17H4a1 1 0 01-1-1V4a1 1 0 011-1h3.5"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                        />
                        <path
                            d="M13 14l4-4-4-4M8.5 10H17"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
