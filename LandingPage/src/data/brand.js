/*
  Contenido de marca — nombre y copy definitivos elegidos para este lanzamiento
  (ver NECESIDADES_FRONTEND.md, sección Marca, sobre cómo reemplazarlos si en
  algún momento se define una marca distinta). El isotipo vive en
  src/components/ui/BrandMark.jsx; el número de WhatsApp/dirección de
  sucursales son datos comerciales placeholder, documentados como tal.
*/
export const BRAND = {
    name: "Oficio Barbería",
    shortName: "OFICIO",
    tagline: "Oficio clásico, filo moderno",
    heroHeadline: "El corte que te representa, con la tradición de siempre",
    heroSubtext:
        "Barbería de barrio con más de una década de oficio. Cortes a tijera y navaja, atención sin apuro y un ambiente que se siente como en casa.",
    aboutText:
        "Empezamos como una barbería de esquina y hoy seguimos siendo eso: un lugar donde el oficio se respeta y cada corte se hace con tiempo. Formamos a nuestro equipo en las técnicas clásicas y las combinamos con las tendencias que pide la calle.",
    contactPhoneLabel: "Reservá por WhatsApp",
    whatsappNumber: "5491123456789",
    whatsappDisplay: "+54 9 11 2345-6789",
    contactEmail: "hola@oficiobarberia.com.ar",
};

export const WHATSAPP_URL = `https://wa.me/${BRAND.whatsappNumber}?text=${encodeURIComponent(
    "Hola! Quiero reservar un turno en " + BRAND.name,
)}`;
