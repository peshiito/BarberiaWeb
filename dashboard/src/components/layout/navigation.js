export const NAV_SECTIONS = [
    {
        id: "daily",
        label: "Operación diaria",
        items: [
            { to: "/", label: "Agenda & Turnos", short: "Agenda", icon: "calendar_today", end: true },
            { to: "/clients", label: "Clientes", short: "Clientes", icon: "group" },
        ],
    },
    {
        id: "own",
        label: "Mi espacio",
        items: [
            { to: "/schedule", label: "Mis horarios", short: "Horarios", icon: "schedule", barberOnly: true },
            { to: "/photos", label: "Fotos y bio", short: "Fotos", icon: "photo_camera", barberOnly: true },
            { to: "/profile", label: "Mi perfil", short: "Perfil", icon: "person" },
        ],
    },
    {
        id: "admin",
        label: "Administración",
        items: [
            { to: "/admin/barbers", label: "Barberos & Equipo", short: "Barberos", icon: "content_cut", adminOnly: true },
            { to: "/admin/services", label: "Servicios & Tarifas", short: "Servicios", icon: "brush", adminOnly: true },
            { to: "/admin/finance", label: "Finanzas & Caja", short: "Finanzas", icon: "monitoring", adminOnly: true },
        ],
    },
];

export const ROLE_LABEL = { admin: "Administrador", admin_barber: "Barbero admin", barber: "Barbero" };

export const getVisibleSections = ({ isAdmin, isBarber }) =>
    NAV_SECTIONS.map(section => ({
        ...section,
        items: section.items.filter(item => (!item.barberOnly || isBarber) && (!item.adminOnly || isAdmin)),
    })).filter(section => section.items.length > 0);

export const findCurrentItem = (pathname, sections) => {
    const items = sections.flatMap(s => s.items);
    return (
        items.find(item => (item.end ? pathname === item.to : pathname === item.to || pathname.startsWith(`${item.to}/`))) ||
        null
    );
};
