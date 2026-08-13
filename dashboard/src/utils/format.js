export const formatMoney = value =>
    `$${Math.round(Number(value)).toLocaleString("es-AR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
