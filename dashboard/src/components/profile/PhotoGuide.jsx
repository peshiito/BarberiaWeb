import Icon from "../ui/Icon";
import "./PhotoTips.css";

const TIPS = [
    { icon: "wb_sunny", text: "Buena luz natural y el corte bien visible." },
    { icon: "center_focus_strong", text: "De frente, con el sujeto centrado." },
    { icon: "hide_image", text: "Sin fondos ni objetos que distraigan." },
];

const PhotoGuide = () => (
    <div className="photo-tips">
        <ul className="photo-tips-list">
            {TIPS.map(tip => (
                <li key={tip.text}>
                    <Icon name={tip.icon} size={18} />
                    {tip.text}
                </li>
            ))}
        </ul>
        <p className="photo-tips-formats">
            <span>JPG</span>
            <span>PNG</span>
            <span>WEBP</span>
            <span className="is-accent">Máx. 5 MB</span>
        </p>
    </div>
);

export default PhotoGuide;
