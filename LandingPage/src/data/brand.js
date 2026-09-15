export const BRAND = {
    name: "Oficio Barbería",
    shortName: "OFICIO",
    tagline: "Oficio clásico, filo moderno",
    since: 2014,
    heroTitleLines: ["Tijera, navaja", "y el tiempo", "que el corte necesita"],
    heroSubtext: "Cortes a tijera y navaja, atención sin apuro, con el mismo barbero cada vez.",
    aboutEyebrow: "El oficio",
    aboutTitle: "Una barbería, no un local de paso",
    aboutText:
        "Empezamos en 2014 como una barbería de esquina. Hoy seguimos siendo eso mismo, solo que más grandes: un lugar donde cada corte se hace con el tiempo que necesita, no con el que sobra.",
    aboutTextExtra:
        "Cada barbero aprende navaja, tijera y toalla caliente antes de tomar su primer turno. Por eso, si volvés con el mismo barbero, no tenés que explicar de nuevo cómo te gusta el corte.",
    paymentNote: "Pagás en el local, en efectivo o transferencia.",
    contactPhoneLabel: "Reservá por WhatsApp",
    whatsappNumber: "5491123456789",
    whatsappDisplay: "+54 9 11 2345-6789",
    contactEmail: "hola@oficiobarberia.com.ar",
};

export const WHATSAPP_URL = `https://wa.me/${BRAND.whatsappNumber}?text=${encodeURIComponent(
    "Hola! Quiero reservar un turno en " + BRAND.name,
)}`;
