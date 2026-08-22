import Badge from "../ui/Badge";
import { IconCamera, IconCheck } from "../ui/icons";
import "./PhotoGuide.css";

const TIPS = [
    "Buena luz natural y el corte o trabajo bien visible",
    "Encuadre de frente, con el sujeto centrado",
    "Sin objetos ni fondos que distraigan la atención",
];

const PhotoGuide = () => (
    <div className="photo-guide">
        <div className="photo-guide-header">
            <IconCamera className="photo-guide-icon" />
            <h4>Consejos para tus fotos</h4>
        </div>

        <ul className="photo-guide-tips">
            {TIPS.map(tip => (
                <li key={tip}>
                    <IconCheck className="photo-guide-tip-icon" />
                    <span>{tip}</span>
                </li>
            ))}
        </ul>

        <div className="photo-guide-badges">
            <Badge>JPG</Badge>
            <Badge>PNG</Badge>
            <Badge>WEBP</Badge>
            <Badge tone="brass">Máx. 5 MB</Badge>
        </div>

        <p className="photo-guide-note">
            La primera foto es tu imagen principal: es la que se ve más grande en tu perfil público. Elegí una foto
            vertical y con el sujeto centrado para que se recorte bien en cualquier tamaño.
        </p>
    </div>
);

export default PhotoGuide;
