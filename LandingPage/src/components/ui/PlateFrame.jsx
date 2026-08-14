import "./PlateFrame.css";

/*
  Sistema de "placas editoriales": sustituye la fotografía que no existe hoy
  (ver NECESIDADES_FRONTEND.md, sección Imágenes) por ilustraciones de línea
  propias, presentadas como láminas de catálogo/blueprint clásico de
  barbería — coherente con el marco de esquinas ya usado en la imagen OG.
  Reemplazar por fotografía real más adelante es tan simple como cambiar el
  children de <PlateFrame> por un <img>.
*/
export default function PlateFrame({ number, caption, children, tone = "dark", className = "" }) {
    return (
        <div className={`plate-frame plate-frame-${tone} ${className}`.trim()}>
            <span className="plate-frame-corner plate-frame-corner-tl" aria-hidden="true" />
            <span className="plate-frame-corner plate-frame-corner-br" aria-hidden="true" />
            <div className="plate-frame-art" aria-hidden="true">
                {children}
            </div>
            {(number || caption) && (
                <p className="plate-frame-caption">
                    {number && <span className="plate-frame-number">{number}</span>}
                    {caption}
                </p>
            )}
        </div>
    );
}
