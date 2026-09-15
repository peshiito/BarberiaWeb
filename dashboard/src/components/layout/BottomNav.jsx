import { NavLink } from "react-router-dom";
import { useAppointmentComposer } from "../../context/AppointmentComposerContext";
import { useAuth } from "../../context/AuthContext";
import Icon from "../ui/Icon";
import "./BottomNav.css";

const BottomNav = ({ onOpenMenu }) => {
    const { isBarber } = useAuth();
    const { openComposer } = useAppointmentComposer();

    const thirdItem = isBarber
        ? { to: "/schedule", label: "Horarios", icon: "schedule" }
        : { to: "/admin/finance", label: "Finanzas", icon: "monitoring" };

    const items = [
        { to: "/", label: "Agenda", icon: "calendar_today", end: true },
        { to: "/clients", label: "Clientes", icon: "group" },
    ];

    const renderLink = item => (
        <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => `bottom-nav-item ${isActive ? "is-active" : ""}`}
        >
            <Icon name={item.icon} size={24} className="bottom-nav-icon" />
            <span>{item.label}</span>
        </NavLink>
    );

    return (
        <nav className="bottom-nav" aria-label="Navegación principal">
            {items.map(renderLink)}
            <div className="bottom-nav-fab-slot">
                <button type="button" className="bottom-nav-fab" onClick={() => openComposer()} aria-label="Nuevo turno">
                    <Icon name="add" size={30} />
                </button>
            </div>
            {renderLink(thirdItem)}
            <button type="button" className="bottom-nav-item" onClick={onOpenMenu}>
                <Icon name="menu" size={24} className="bottom-nav-icon" />
                <span>Menú</span>
            </button>
        </nav>
    );
};

export default BottomNav;
