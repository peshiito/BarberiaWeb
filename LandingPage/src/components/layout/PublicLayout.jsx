import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

export default function PublicLayout() {
    const location = useLocation();

    return (
        <>
            <a href="#main-content" className="skip-link">
                Saltar al contenido principal
            </a>
            <Header />
            <main id="main-content">
                <div key={location.pathname} className="page-transition">
                    <Outlet />
                </div>
            </main>
            <Footer />
        </>
    );
}
