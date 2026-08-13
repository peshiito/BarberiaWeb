import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import IconButton from "../ui/IconButton";
import { IconMenu } from "../ui/icons";
import "./DashboardLayout.css";
import Sidebar, { adminItems, barberOnlyNavItems, navItems } from "./Sidebar";

const allNavItems = [...navItems, ...barberOnlyNavItems, ...adminItems];

const DashboardLayout = () => {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const location = useLocation();

    const currentLabel =
        allNavItems.find(item => (item.to === "/" ? location.pathname === "/" : location.pathname.startsWith(item.to)))
            ?.label ?? "Barbería";

    return (
        <div className="dashboard-shell">
            <header className="mobile-topbar">
                <IconButton
                    icon={<IconMenu />}
                    label="Abrir menú"
                    size="md"
                    onClick={() => setDrawerOpen(true)}
                    className="mobile-topbar-menu"
                />
                <span className="mobile-topbar-title">{currentLabel}</span>
            </header>

            <Sidebar open={drawerOpen} onClose={() => setDrawerOpen(false)} />
            {drawerOpen && <div className="sidebar-overlay" onClick={() => setDrawerOpen(false)} />}

            <main className="dashboard-content">
                <Outlet />
            </main>
        </div>
    );
};

export default DashboardLayout;
