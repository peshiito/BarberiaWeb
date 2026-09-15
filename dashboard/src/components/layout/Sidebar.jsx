import { useEffect, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useHomeData } from "../../context/HomeDashboardContext";
import BrandMark from "../ui/BrandMark";
import Icon from "../ui/Icon";
import { getVisibleSections } from "./navigation";
import "./Sidebar.css";

const FOCUSABLE_SELECTOR =
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

const LiveClock = () => {
    const [now, setNow] = useState(() => new Date());
    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);
    return (
        <time className="sidebar-clock-value" dateTime={now.toISOString()}>
            {now.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false })}
        </time>
    );
};

// Estado del día con datos reales: completados sobre agendados para quien
// tiene agenda propia; barberos con turnos completados para un admin puro.
const DayStatus = () => {
    const { loading, data } = useHomeData();

    if (loading || !data) {
        return <div className="sidebar-status is-loading" aria-hidden="true" />;
    }

    let label;
    let current;
    let total;
    let hint;

    if (data.kind === "business") {
        label = "Barberos activos hoy";
        current = data.activeBarbersToday ?? 0;
        total = data.totalBarbers ?? 0;
        hint = `${data.appointmentsToday ?? 0} turnos completados`;
    } else {
        label = "Completados hoy";
        total = data.todayAppointments.length;
        current = data.todayAppointments.filter(a => a.status === "completed").length;
        hint =
            data.freeSlotsToday === null
                ? "Sin agenda esta semana"
                : data.isTodayWorkDay
                  ? `${data.freeSlotsToday} horarios libres`
                  : "Hoy no trabajás";
    }

    const percent = total > 0 ? Math.round((current / total) * 100) : 0;

    return (
        <div className="sidebar-status">
            <div className="sidebar-status-head">
                <span className="t-label">{label}</span>
                <span className="t-mono-sm sidebar-status-count">
                    {current} / {total}
                </span>
            </div>
            <div
                className="sidebar-status-bar"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={total}
                aria-valuenow={current}
                aria-label={label}
            >
                <span className="sidebar-status-fill" style={{ transform: `scaleX(${percent / 100})` }} />
            </div>
            <span className="t-mono-sm sidebar-status-hint">{hint}</span>
        </div>
    );
};

const Sidebar = ({ open = false, onClose = () => {} }) => {
    const { isAdmin, isBarber } = useAuth();
    const asideRef = useRef(null);
    const sections = getVisibleSections({ isAdmin, isBarber });

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
            <div className="sidebar-drawer-head">
                <BrandMark subtitle="Panel de barbería" />
                <button type="button" className="sidebar-close" onClick={onClose} aria-label="Cerrar menú">
                    <Icon name="close" size={22} />
                </button>
            </div>

            <nav className="sidebar-nav" aria-label="Secciones">
                {sections.map(section => (
                    <div key={section.id} className="sidebar-section">
                        <span className="sidebar-section-label">{section.label}</span>
                        <ul className="sidebar-list">
                            {section.items.map(item => (
                                <li key={item.to}>
                                    <NavLink
                                        to={item.to}
                                        end={item.end}
                                        onClick={onClose}
                                        className={({ isActive }) => `sidebar-link ${isActive ? "is-active" : ""}`}
                                    >
                                        <Icon name={item.icon} size={22} className="sidebar-link-icon" />
                                        <span>{item.label}</span>
                                    </NavLink>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </nav>

            <div className="sidebar-footer">
                <DayStatus />
                <div className="sidebar-clock">
                    <div className="sidebar-clock-text">
                        <span className="t-label sidebar-clock-label">Hora local</span>
                        <LiveClock />
                    </div>
                    <Icon name="schedule" size={22} className="sidebar-clock-icon" />
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
