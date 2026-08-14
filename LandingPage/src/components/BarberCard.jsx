import { Link } from "react-router-dom";
import AsyncImage from "./ui/AsyncImage";
import { buildAssetUrl } from "../services/api";
import "./BarberCard.css";

export default function BarberCard({ barber }) {
    const fullName = `${barber.first_name} ${barber.last_name}`;
    const photoUrl = barber.photos?.[0] ? buildAssetUrl(barber.photos[0]) : null;
    const initials = `${barber.first_name?.[0] || ""}${barber.last_name?.[0] || ""}`.toUpperCase();

    return (
        <Link to={`/barberos/${barber.id}`} className="barber-card card card-hover">
            <AsyncImage src={photoUrl} alt={`Foto de ${fullName}`} aspectRatio="4 / 5" initials={initials} />
            <div className="barber-card-body">
                <p className="barber-card-name">{fullName}</p>
                <p className="barber-card-bio">{barber.bio || "Barbero del equipo"}</p>
            </div>
        </Link>
    );
}
