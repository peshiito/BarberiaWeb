import { useCallback, useState } from "react";
import { Outlet } from "react-router-dom";
import { AppointmentComposerProvider } from "../../context/AppointmentComposerContext";
import { HomeDashboardProvider } from "../../context/HomeDashboardContext";
import AppHeader from "./AppHeader";
import BottomNav from "./BottomNav";
import Sidebar from "./Sidebar";
import "./DashboardLayout.css";

const DashboardLayout = () => {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const closeDrawer = useCallback(() => setDrawerOpen(false), []);

    return (
        <HomeDashboardProvider>
            <AppointmentComposerProvider>
                <div className="shell">
                    <a href="#main-content" className="shell-skip-link">
                        Saltar al contenido
                    </a>
                    <AppHeader />
                    <Sidebar open={drawerOpen} onClose={closeDrawer} />
                    {drawerOpen && <div className="shell-overlay" onClick={closeDrawer} aria-hidden="true" />}

                    <main id="main-content" className="shell-main" tabIndex={-1}>
                        <div className="shell-content">
                            <Outlet />
                        </div>
                    </main>

                    <BottomNav onOpenMenu={() => setDrawerOpen(true)} />
                </div>
            </AppointmentComposerProvider>
        </HomeDashboardProvider>
    );
};

export default DashboardLayout;
