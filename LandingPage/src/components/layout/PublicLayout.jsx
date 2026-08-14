import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

export default function PublicLayout() {
    return (
        <>
            <a href="#main-content" className="skip-link">
                Saltar al contenido principal
            </a>
            <Header />
            <main id="main-content">
                <Outlet />
            </main>
            <Footer />
        </>
    );
}
