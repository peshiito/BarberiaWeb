import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAppointmentComposer } from "../../context/AppointmentComposerContext";
import { useAuth } from "../../context/AuthContext";
import { useHomeData } from "../../context/HomeDashboardContext";
import BrandMark from "../ui/BrandMark";
import Icon from "../ui/Icon";
import { ROLE_LABEL, findCurrentItem, getVisibleSections } from "./navigation";
import "./AppHeader.css";

const useDismiss = (open, setOpen, ref) => {
    useEffect(() => {
        if (!open) return undefined;
        const handlePointer = e => {
            if (!ref.current?.contains(e.target)) setOpen(false);
        };
        const handleKey = e => {
            if (e.key === "Escape") setOpen(false);
        };
        document.addEventListener("mousedown", handlePointer);
        document.addEventListener("keydown", handleKey);
        return () => {
            document.removeEventListener("mousedown", handlePointer);
            document.removeEventListener("keydown", handleKey);
        };
    }, [open, setOpen, ref]);
};

const AppHeader = () => {
    const { user, logout, isAdmin, isBarber } = useAuth();
    const { data: home } = useHomeData();
    const { openComposer } = useAppointmentComposer();
    const navigate = useNavigate();
    const location = useLocation();

    const [alertsOpen, setAlertsOpen] = useState(false);
    const [userOpen, setUserOpen] = useState(false);
    const alertsRef = useRef(null);
    const userRef = useRef(null);
    useDismiss(alertsOpen, setAlertsOpen, alertsRef);
    useDismiss(userOpen, setUserOpen, userRef);

    const sections = getVisibleSections({ isAdmin, isBarber });
    const current = findCurrentItem(location.pathname, sections);
    const alerts = home?.alerts || [];
    const initials = user ? `${user.first_name?.[0] || ""}${user.last_name?.[0] || ""}` : "";

    return (
        <header className="app-header">
            <div className="app-header-left">
                <Link to="/" className="app-header-brand" aria-label="Oficio — ir a la agenda">
                    <BrandMark subtitle="Panel de barbería" />
                </Link>
                {current && <span className="app-header-section">{current.short}</span>}
            </div>

            <div className="app-header-actions">
                <button type="button" className="app-header-new" onClick={() => openComposer()}>
                    <Icon name="add" size={18} />
                    <span>Nuevo turno</span>
                </button>

                <span className="app-header-divider" aria-hidden="true" />

                <div className="app-header-popover-anchor" ref={alertsRef}>
                    <button
                        type="button"
                        className="app-header-icon-btn"
                        aria-label={alerts.length ? `Notificaciones: ${alerts.length} pendientes` : "Notificaciones"}
                        aria-expanded={alertsOpen}
                        aria-haspopup="true"
                        onClick={() => setAlertsOpen(o => !o)}
                    >
                        <Icon name="notifications" size={22} />
                        {alerts.length > 0 && <span className="app-header-dot" aria-hidden="true" />}
                    </button>
                    {alertsOpen && (
                        <div className="app-header-popover app-header-alerts" role="dialog" aria-label="Notificaciones">
                            <div className="app-header-popover-head">
                                <span className="t-label">Pendientes</span>
                                <span className="t-mono-sm app-header-popover-count">{alerts.length}</span>
                            </div>
                            {alerts.length === 0 ? (
                                <p className="app-header-empty">
                                    <Icon name="task_alt" size={20} />
                                    Todo al día, no hay nada pendiente.
                                </p>
                            ) : (
                                <ul className="app-header-alert-list">
                                    {alerts.map(alert => (
                                        <li key={alert.id}>
                                            <button
                                                type="button"
                                                className="app-header-alert"
                                                onClick={() => {
                                                    setAlertsOpen(false);
                                                    navigate(alert.to);
                                                }}
                                            >
                                                <Icon name="error" size={18} className="app-header-alert-icon" />
                                                <span className="app-header-alert-text">
                                                    <span>{alert.message}</span>
                                                    <span className="app-header-alert-action">{alert.actionLabel}</span>
                                                </span>
                                                <Icon name="chevron_right" size={18} className="app-header-alert-chevron" />
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )}
                </div>

                <div className="app-header-popover-anchor" ref={userRef}>
                    <button
                        type="button"
                        className="app-header-user"
                        aria-expanded={userOpen}
                        aria-haspopup="menu"
                        onClick={() => setUserOpen(o => !o)}
                    >
                        <span className="app-header-avatar" aria-hidden="true">
                            {initials}
                            <span className="app-header-avatar-status" />
                        </span>
                        <span className="app-header-user-text">
                            <span className="app-header-user-name">
                                {user?.first_name} {user?.last_name}
                            </span>
                            <span className="app-header-user-role">{ROLE_LABEL[user?.role] || user?.role}</span>
                        </span>
                        <Icon name="expand_more" size={18} className="app-header-user-chevron" />
                    </button>
                    {userOpen && (
                        <div className="app-header-popover app-header-user-menu" role="menu">
                            <button
                                type="button"
                                role="menuitem"
                                className="app-header-menu-item"
                                onClick={() => {
                                    setUserOpen(false);
                                    navigate("/profile");
                                }}
                            >
                                <Icon name="person" size={18} />
                                Mi perfil
                            </button>
                            <button
                                type="button"
                                role="menuitem"
                                className="app-header-menu-item is-danger"
                                onClick={logout}
                            >
                                <Icon name="logout" size={18} />
                                Cerrar sesión
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default AppHeader;
