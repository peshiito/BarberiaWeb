export const BRAND = {
    name: "Oficio Barbería",
    shortName: "OFICIO",
    tagline: "Oficio clásico, filo moderno",
    heroHeadline: "El corte que te representa, con la tradición de siempre",
    heroSubtext:
        "Barbería de barrio con más de una década de oficio. Cortes a tijera y navaja, atención sin apuro y un ambiente que se siente como en casa.",
    aboutEyebrow: "Quiénes somos",
    aboutTitle: "Una barbería, no un local de paso",
    aboutText:
        "Empezamos en 2014 como una barbería de esquina, con dos sillones y un cliente fijo por día. Hoy seguimos siendo eso mismo, solo que más grandes: un lugar donde el oficio se respeta y cada corte se hace con el tiempo que necesita, no con el que sobra.",
    aboutTextExtra:
        "Formamos a cada barbero en las técnicas clásicas —navaja, tijera, toalla caliente— antes de dejarlo tomar su primer turno. Después, cada uno construye su propio estilo. Por eso cuando volvés a reservar con el mismo barbero, no tenés que explicar de nuevo cómo te gusta el corte.",
    aboutHighlights: [
        { value: "2014", label: "Primer local" },
        { value: "9", label: "Barberos en el equipo" },
        { value: "0", label: "Cortes apurados" },
    ],
    contactPhoneLabel: "Reservá por WhatsApp",
    whatsappNumber: "5491123456789",
    whatsappDisplay: "+54 9 11 2345-6789",
    contactEmail: "hola@oficiobarberia.com.ar",
};

export const WHATSAPP_URL = `https://wa.me/${BRAND.whatsappNumber}?text=${encodeURIComponent(
    "Hola! Quiero reservar un turno en " + BRAND.name,
)}`;
