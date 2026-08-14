/*
  Contenido comercial ilustrativo — NO proviene del backend.
  El backend no modela un catálogo de servicios (ver NECESIDADES_FRONTEND.md,
  gap #1): cada barbero tiene un único precio plano. Esta lista solo orienta
  al cliente en la sección "Servicios" de la Home y en el paso 1 del booking;
  el precio real y definitivo siempre lo confirma el barbero.
*/
export const SERVICES = [
    {
        id: "clasico",
        name: "Corte clásico",
        description: "Tijera y máquina, terminación prolija con navaja en contornos.",
        priceLabel: "desde $8.000",
        durationLabel: "30 min",
    },
    {
        id: "corte-barba",
        name: "Corte + Barba",
        description: "El combo completo: corte a medida y perfilado de barba con toalla caliente.",
        priceLabel: "desde $13.000",
        durationLabel: "50 min",
    },
    {
        id: "barba",
        name: "Arreglo de barba",
        description: "Perfilado, definición de línea y afeitado de contornos.",
        priceLabel: "desde $6.000",
        durationLabel: "20 min",
    },
    {
        id: "fade",
        name: "Fade",
        description: "Degradé preciso en máquina, del cero al largo que seas.",
        priceLabel: "desde $9.000",
        durationLabel: "40 min",
    },
    {
        id: "premium",
        name: "Corte premium",
        description: "Diagnóstico personalizado, corte, barba y ritual de toalla caliente.",
        priceLabel: "desde $16.000",
        durationLabel: "60 min",
    },
    {
        id: "perfilado",
        name: "Perfilado",
        description: "Contornos de cabeza y patillas a navaja, ideal entre cortes.",
        priceLabel: "desde $4.000",
        durationLabel: "15 min",
    },
];
