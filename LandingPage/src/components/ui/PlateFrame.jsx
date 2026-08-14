import "./PlateFrame.css";

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
