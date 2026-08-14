import { BRAND } from "../../data/brand";
import { IconChair } from "../ui/icons";
import PlateFrame from "../ui/PlateFrame";
import "./IntroSection.css";

export default function IntroSection() {
    return (
        <section className="section section-cream intro-section">
            <div className="container intro-grid">
                <PlateFrame tone="light" number="N.º 01" caption="El sillón · desde 2014" className="intro-image-slot">
                    <IconChair />
                </PlateFrame>
                <div className="intro-copy">
                    <p className="eyebrow">Quiénes somos</p>
                    <h2 className="section-title">Una barbería, no un local de paso</h2>
                    <p className="intro-text">{BRAND.aboutText}</p>
                </div>
            </div>
        </section>
    );
}
