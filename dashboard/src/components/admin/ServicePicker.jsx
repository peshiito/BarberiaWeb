import Icon from "../ui/Icon";
import "./ServiceChips.css";

const ServicePicker = ({ services, selectedIds, onChange }) => {
    if (services.length === 0) {
        return <p className="svc-empty">Todavía no hay servicios en el catálogo. Cargalos primero en Servicios.</p>;
    }

    const toggle = id => {
        onChange(selectedIds.includes(id) ? selectedIds.filter(s => s !== id) : [...selectedIds, id]);
    };

    return (
        <div className="svc-chips" role="group" aria-label="Servicios que ofrece">
            {services.map(service => {
                const selected = selectedIds.includes(service.id);
                return (
                    <button
                        key={service.id}
                        type="button"
                        className={`svc-chip ${selected ? "is-selected" : ""}`}
                        onClick={() => toggle(service.id)}
                        aria-pressed={selected}
                    >
                        <Icon name={selected ? "check" : "add"} size={16} />
                        {service.name}
                        {!service.active && <span className="svc-chip-muted">Inactivo</span>}
                    </button>
                );
            })}
        </div>
    );
};

export default ServicePicker;
