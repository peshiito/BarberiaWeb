import PlateFrame from "../ui/PlateFrame";
import { IconRazor, IconScissors, IconComb, IconChair, IconMirror, IconTowel } from "../ui/icons";
import "./CraftMosaic.css";

const PLATES = [
    { icon: IconRazor, number: "N.º 02", caption: "Navaja · afeitado clásico" },
    { icon: IconScissors, number: "N.º 03", caption: "Tijera · corte a medida" },
    { icon: IconComb, number: "N.º 04", caption: "Peine · precisión de línea" },
    { icon: IconChair, number: "N.º 05", caption: "Sillón · otra época" },
    { icon: IconTowel, number: "N.º 06", caption: "Toalla caliente · ritual final" },
    { icon: IconMirror, number: "N.º 07", caption: "Espejo · el resultado" },
];

export default function CraftMosaic() {
    return (
        <section className="section section-ink">
            <div className="container">
                <p className="eyebrow">Nuestro oficio</p>
                <h2 className="section-title">El detalle que se nota</h2>
                <p className="section-lede">
                    Seis herramientas, un mismo criterio: hacer las cosas como se aprendieron a hacer bien.
                </p>

                <div className="craft-mosaic-grid">
                    {PLATES.map(({ icon: Icon, number, caption }) => (
                        <PlateFrame key={caption} number={number} caption={caption} className="craft-mosaic-plate">
                            <Icon />
                        </PlateFrame>
                    ))}
                </div>
            </div>
        </section>
    );
}
