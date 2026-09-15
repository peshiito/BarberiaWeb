import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

export default function PublicLayout() {
    const location = useLocation();
    const isHome = location.pathname === "/";

    // Cada página nueva arranca desde arriba.
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [location.pathname]);

    return (
        <>
            <a href="#main-content" className="skip-link">
                Saltar al contenido principal
            </a>
            <Header />
            <main id="main-content" className={isHome ? "site-main is-under-header" : "site-main"} tabIndex={-1}>
                <div key={location.pathname} className="page-transition">
                    <Outlet />
                </div>
            </main>
            <Footer />
        </>
    );
}
