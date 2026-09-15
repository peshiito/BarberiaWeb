export const BRANCHES = [
    {
        id: "palermo",
        neighborhood: "Palermo",
        name: "Oficio Barbería — Palermo",
        address: "Av. Santa Fe 3456",
        city: "CABA",
        phone: "+54 11 4821-3456",
        hours: [
            { days: "Lun a sáb", time: "10:00 – 20:00" },
            { days: "Domingo", time: "Cerrado", closed: true },
        ],
        lat: -34.5875,
        lng: -58.4205,
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=Av.+Santa+Fe+3456+CABA",
    },
    {
        id: "belgrano",
        neighborhood: "Belgrano",
        name: "Oficio Barbería — Belgrano",
        address: "Av. Cabildo 2100",
        city: "CABA",
        phone: "+54 11 4780-2100",
        hours: [
            { days: "Lun a sáb", time: "10:00 – 20:00" },
            { days: "Domingo", time: "Cerrado", closed: true },
        ],
        lat: -34.5633,
        lng: -58.4553,
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=Av.+Cabildo+2100+CABA",
    },
];

export const BRANCH_NAMES = BRANCHES.map((branch) => branch.neighborhood).join(" y ");

export const hoursSummary = (branch) =>
    branch.hours.map((row) => `${row.days} ${row.closed ? "cerrado" : row.time}`).join(" · ");
