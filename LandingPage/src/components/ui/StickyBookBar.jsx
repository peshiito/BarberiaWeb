import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { whatsappUrl } from "../../utils/links";
import Icon from "./Icon";
import { IconWhatsapp } from "./icons";
import "./StickyBookBar.css";

// Barra fija inferior (solo mobile): reservar + WhatsApp. `showAfter` en px de scroll.
export default function StickyBookBar({ to = "/reservar", label = "Reservar turno", whatsappText, showAfter = 0 }) {
    const [visible, setVisible] = useState(showAfter === 0);

    useEffect(() => {
        document.body.classList.add("has-bookbar");
        return () => document.body.classList.remove("has-bookbar");
    }, []);

    useEffect(() => {
        if (showAfter === 0) return undefined;
        const onScroll = () => setVisible(window.scrollY > showAfter);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, [showAfter]);

    return (
        <div className={`bookbar ${visible ? "is-visible" : ""}`} aria-hidden={!visible || undefined} inert={!visible || undefined}>
            <Link to={to} className="btn btn-primary btn-lg bookbar-cta">
                <Icon name="calendar_month" size={20} />
                <span className="btn-label">{label}</span>
            </Link>
            <a
                href={whatsappUrl(whatsappText)}
                target="_blank"
                rel="noreferrer"
                className="bookbar-whatsapp"
                aria-label="Escribinos por WhatsApp"
            >
                <IconWhatsapp width={22} height={22} />
            </a>
        </div>
    );
}
