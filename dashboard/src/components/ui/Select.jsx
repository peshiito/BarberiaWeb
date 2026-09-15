import { useEffect, useId, useRef, useState } from "react";
import Icon from "./Icon";
import "./Select.css";

// Select de una sola opción con el patrón ARIA "select-only combobox":
// el foco queda en el disparador y la opción activa se anuncia con
// aria-activedescendant. Reemplaza al <select> nativo, que no se puede estilar.
const Select = ({
    id,
    value,
    onChange,
    options,
    placeholder = "Elegí una opción",
    disabled = false,
    leadingIcon,
    renderValue,
    emptyMessage = "No hay opciones",
    className = "",
    ...rest
}) => {
    const autoId = useId();
    const triggerId = id || `${autoId}-trigger`;
    const listboxId = `${autoId}-listbox`;
    const rootRef = useRef(null);
    const listRef = useRef(null);
    const typeahead = useRef({ text: "", timer: null });

    const [open, setOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);

    const selectedIndex = options.findIndex(o => o.value === value);
    const selected = selectedIndex >= 0 ? options[selectedIndex] : null;

    useEffect(() => {
        if (!open) return undefined;
        const handlePointerDown = e => {
            if (!rootRef.current?.contains(e.target)) setOpen(false);
        };
        document.addEventListener("mousedown", handlePointerDown);
        return () => document.removeEventListener("mousedown", handlePointerDown);
    }, [open]);

    useEffect(() => {
        if (!open || activeIndex < 0) return;
        const node = listRef.current?.querySelector(`[data-index="${activeIndex}"]`);
        node?.scrollIntoView({ block: "nearest" });
    }, [open, activeIndex]);

    const firstEnabled = () => options.findIndex(o => !o.disabled);
    const lastEnabled = () => {
        for (let i = options.length - 1; i >= 0; i -= 1) if (!options[i].disabled) return i;
        return -1;
    };

    const move = (from, step) => {
        if (options.length === 0) return -1;
        let i = from;
        for (let tries = 0; tries < options.length; tries += 1) {
            i = (i + step + options.length) % options.length;
            if (!options[i].disabled) return i;
        }
        return from;
    };

    const openList = () => {
        if (disabled) return;
        setOpen(true);
        setActiveIndex(selectedIndex >= 0 ? selectedIndex : firstEnabled());
    };

    const commit = index => {
        const option = options[index];
        if (!option || option.disabled) return;
        onChange(option.value);
        setOpen(false);
    };

    const handleKeyDown = e => {
        if (disabled) return;

        if (!open) {
            if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
                e.preventDefault();
                openList();
            }
            return;
        }

        switch (e.key) {
            case "ArrowDown":
                e.preventDefault();
                setActiveIndex(i => move(i, 1));
                break;
            case "ArrowUp":
                e.preventDefault();
                setActiveIndex(i => move(i < 0 ? 0 : i, -1));
                break;
            case "Home":
                e.preventDefault();
                setActiveIndex(firstEnabled());
                break;
            case "End":
                e.preventDefault();
                setActiveIndex(lastEnabled());
                break;
            case "Enter":
            case " ":
                e.preventDefault();
                commit(activeIndex);
                break;
            case "Escape":
                e.preventDefault();
                setOpen(false);
                break;
            case "Tab":
                setOpen(false);
                break;
            default:
                if (e.key.length === 1) {
                    clearTimeout(typeahead.current.timer);
                    typeahead.current.text += e.key.toLowerCase();
                    typeahead.current.timer = setTimeout(() => {
                        typeahead.current.text = "";
                    }, 500);
                    const match = options.findIndex(
                        o => !o.disabled && String(o.label).toLowerCase().startsWith(typeahead.current.text),
                    );
                    if (match >= 0) setActiveIndex(match);
                }
        }
    };

    return (
        <div ref={rootRef} className={`select ${open ? "is-open" : ""} ${disabled ? "is-disabled" : ""} ${className}`}>
            <button
                id={triggerId}
                type="button"
                role="combobox"
                className="select-trigger"
                aria-haspopup="listbox"
                aria-expanded={open}
                aria-controls={listboxId}
                aria-activedescendant={open && activeIndex >= 0 ? `${listboxId}-${activeIndex}` : undefined}
                disabled={disabled}
                onClick={() => (open ? setOpen(false) : openList())}
                onKeyDown={handleKeyDown}
                {...rest}
            >
                {leadingIcon && <Icon name={leadingIcon} size={20} className="select-leading" />}
                <span className="select-value">
                    {selected ? (
                        renderValue ? (
                            renderValue(selected)
                        ) : (
                            <>
                                {selected.leading}
                                <span className="select-value-text">
                                    <span className="select-value-label">{selected.label}</span>
                                    {selected.description && (
                                        <span className="select-value-description">{selected.description}</span>
                                    )}
                                </span>
                            </>
                        )
                    ) : (
                        <span className="select-placeholder">{placeholder}</span>
                    )}
                </span>
                {selected?.trailing && <span className="select-trailing">{selected.trailing}</span>}
                <Icon name="unfold_more" size={20} className="select-chevron" />
            </button>

            {open && (
                <ul ref={listRef} id={listboxId} role="listbox" className="select-listbox" aria-labelledby={triggerId}>
                    {options.length === 0 && <li className="select-empty">{emptyMessage}</li>}
                    {options.map((option, index) => (
                        <li
                            key={option.value}
                            id={`${listboxId}-${index}`}
                            data-index={index}
                            role="option"
                            aria-selected={option.value === value}
                            aria-disabled={option.disabled || undefined}
                            className={`select-option ${index === activeIndex ? "is-active" : ""} ${
                                option.value === value ? "is-selected" : ""
                            }`}
                            onMouseEnter={() => !option.disabled && setActiveIndex(index)}
                            onMouseDown={e => e.preventDefault()}
                            onClick={() => commit(index)}
                        >
                            {option.leading}
                            <span className="select-option-text">
                                <span className="select-option-label">{option.label}</span>
                                {option.description && (
                                    <span className="select-option-description">{option.description}</span>
                                )}
                            </span>
                            {option.trailing && <span className="select-option-trailing">{option.trailing}</span>}
                            {option.value === value && <Icon name="check" size={18} className="select-option-check" />}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default Select;
