import { BRAND } from "../data/brand";

export function whatsappUrl(text = `Hola! Quiero reservar un turno en ${BRAND.name}`) {
    return `https://wa.me/${BRAND.whatsappNumber}?text=${encodeURIComponent(text)}`;
}

export function telUrl(phone) {
    return `tel:${String(phone).replace(/[^\d+]/g, "")}`;
}
