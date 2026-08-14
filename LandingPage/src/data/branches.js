/*
  No existe entidad Sucursal en el backend (ver NECESIDADES_FRONTEND.md,
  sección Sucursales) — este contenido es comercial/ilustrativo, centralizado
  acá a propósito para poder reemplazarlo por datos reales editando un único
  archivo. Coordenadas aproximadas de las zonas indicadas (no la dirección
  exacta del local ficticio); confirmar dirección y coordenadas exactas antes
  de publicar.

  Forma de cada sucursal:
  {
    id: string,
    name: string,
    address: string,
    phone: string,
    hours: string,
    lat: number,
    lng: number,
    mapsUrl: string, // link "Cómo llegar" a Google Maps, sin API key
  }
*/
export const BRANCHES = [
    {
        id: "palermo",
        name: "Oficio Barbería — Palermo",
        address: "Av. Santa Fe 3456, CABA",
        phone: "+54 11 4821-3456",
        hours: "Lun a sáb, 10:00 a 20:00 · Dom cerrado",
        lat: -34.5875,
        lng: -58.4205,
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=Av.+Santa+Fe+3456+CABA",
    },
    {
        id: "belgrano",
        name: "Oficio Barbería — Belgrano",
        address: "Av. Cabildo 2100, CABA",
        phone: "+54 11 4780-2100",
        hours: "Lun a sáb, 10:00 a 20:00 · Dom cerrado",
        lat: -34.5633,
        lng: -58.4553,
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=Av.+Cabildo+2100+CABA",
    },
];
