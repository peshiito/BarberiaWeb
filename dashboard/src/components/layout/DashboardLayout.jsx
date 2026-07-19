import { Outlet } from "react-router-dom";
import "./DashboardLayout.css";
import Sidebar from "./Sidebar";

const DashboardLayout = () => {
    return (
        <div className="dashboard-shell">
            <Sidebar />
            <main className="dashboard-content">
                <Outlet />
            </main>
        </div>
    );
};

export default DashboardLayout;
