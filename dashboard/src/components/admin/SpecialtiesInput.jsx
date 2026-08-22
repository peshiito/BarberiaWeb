import { useState } from "react";
import "./SpecialtiesInput.css";

const MAX_SPECIALTIES = 10;
const MAX_LENGTH = 40;

// Chip input simple: escribir + Enter/coma agrega, click en la x saca.
// Reusado por AdminBarbers (alta) y EditBarberModal (edición).
const SpecialtiesInput = ({ value, onChange }) => {
    const [draft, setDraft] = useState("");

    const addSpecialty = () => {
        const clean = draft.trim();
        if (!clean || value.length >= MAX_SPECIALTIES || value.includes(clean)) {
            setDraft("");
            return;
        }
        onChange([...value, clean.slice(0, MAX_LENGTH)]);
        setDraft("");
    };

    const handleKeyDown = e => {
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            addSpecialty();
        }
    };

    const removeSpecialty = specialty => {
        onChange(value.filter(s => s !== specialty));
    };

    return (
        <div className="specialties-input">
            {value.length > 0 && (
                <div className="specialty-chip-list">
                    {value.map(specialty => (
                        <span key={specialty} className="specialty-chip">
                            {specialty}
                            <button type="button" onClick={() => removeSpecialty(specialty)} aria-label={`Quitar ${specialty}`}>
                                ×
                            </button>
                        </span>
                    ))}
                </div>
            )}
            {value.length < MAX_SPECIALTIES && (
                <input
                    type="text"
                    value={draft}
                    onChange={e => setDraft(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={addSpecialty}
                    placeholder="Ej: fade, barba, color — Enter para agregar"
                    maxLength={MAX_LENGTH}
                />
            )}
        </div>
    );
};

export default SpecialtiesInput;
