export const formatMoney = value =>
    `$${Math.round(Number(value)).toLocaleString("es-AR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

const digitsOnly = value => String(value || "").replace(/\D/g, "");

// Los teléfonos se guardan como los escribió el cliente (ej. "1122334455").
// Para wa.me hace falta el número internacional: se asume Argentina (+54 9)
// cuando no trae código de país.
export const toWhatsAppNumber = phone => {
    const digits = digitsOnly(phone);
    if (!digits) return "";
    if (digits.startsWith("549")) return digits;
    if (digits.startsWith("54")) return `549${digits.slice(2)}`;
    return `549${digits.replace(/^0/, "").replace(/^15/, "")}`;
};

export const whatsappLink = (phone, text) => {
    const number = toWhatsAppNumber(phone);
    if (!number) return null;
    return `https://wa.me/${number}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
};

export const telLink = phone => {
    const number = toWhatsAppNumber(phone);
    return number ? `tel:+${number}` : null;
};

// "1165892231" → "11 6589-2231"; si no tiene el largo esperado, se deja igual.
export const formatPhone = phone => {
    const digits = digitsOnly(phone).replace(/^549/, "").replace(/^54/, "");
    if (digits.length === 10) return `${digits.slice(0, 2)} ${digits.slice(2, 6)}-${digits.slice(6)}`;
    return phone || "";
};

export const getInitials = (firstName, lastName) =>
    `${(firstName || "").trim()[0] || ""}${(lastName || "").trim()[0] || ""}`.toUpperCase();

export const timeToMinutes = time => {
    const [h, m] = String(time).slice(0, 5).split(":").map(Number);
    return h * 60 + m;
};

export const minutesToTime = minutes => {
    const h = String(Math.floor(minutes / 60) % 24).padStart(2, "0");
    const m = String(minutes % 60).padStart(2, "0");
    return `${h}:${m}`;
};
