export const IconClose = props => (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" {...props}>
        <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
);

export const IconMenu = props => (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" {...props}>
        <path d="M3 5.5h14M3 10h14M3 14.5h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
);

export const IconWarning = props => (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" {...props}>
        <path d="M10 2.5l8 14H2l8-14z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M10 8v3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="10" cy="14.2" r="0.9" fill="currentColor" />
    </svg>
);

export const IconCamera = props => (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" {...props}>
        <path
            d="M3 7a1.5 1.5 0 011.5-1.5h1.2l.7-1.2a1 1 0 01.86-.5h5.48a1 1 0 01.86.5l.7 1.2h1.2A1.5 1.5 0 0117 7v7a1.5 1.5 0 01-1.5 1.5h-11A1.5 1.5 0 013 14V7z"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinejoin="round"
        />
        <circle cx="10" cy="10.5" r="3" stroke="currentColor" strokeWidth="1.4" />
    </svg>
);

export const IconCheck = props => (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" {...props}>
        <path d="M4 10.5l3.5 3.5L16 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

// --- Set compartido Sidebar / StatCards, consolidado acá para evitar que
// cada página redefina el mismo SVG (calendar/clock/coin/users estaban
// duplicados byte a byte en Sidebar.jsx y AgendaHome.jsx).

export const IconCalendar = props => (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" {...props}>
        <rect x="3" y="4" width="14" height="13" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M3 8h14M7 2.5v3M13 2.5v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
);

export const IconWeek = props => (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" {...props}>
        <rect x="2.5" y="4" width="15" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M2.5 8.5h15" stroke="currentColor" strokeWidth="1.5" />
        <path d="M6.5 2.5v3M13.5 2.5v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
);

export const IconClock = props => (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" {...props}>
        <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" />
        <path d="M10 6.5V10l2.5 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
);

export const IconHourglass = props => (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" {...props}>
        <path
            d="M5 3h10M5 17h10M5.5 3c0 3.5 2 5 4.5 7-2.5 2-4.5 3.5-4.5 7M14.5 3c0 3.5-2 5-4.5 7 2.5 2 4.5 3.5 4.5 7"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

export const IconSunrise = props => (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" {...props}>
        <circle cx="10" cy="11" r="3.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M2.5 16.5h15M10 3.5v2M4 7l1.5 1.5M16 7l-1.5 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
);

export const IconImage = props => (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" {...props}>
        <rect x="3" y="4" width="14" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="7.5" cy="8.5" r="1.25" stroke="currentColor" strokeWidth="1.5" />
        <path d="M17 12.5l-3.5-3.5-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
);

export const IconUser = props => (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" {...props}>
        <circle cx="10" cy="7" r="3.25" stroke="currentColor" strokeWidth="1.5" />
        <path d="M3.75 16.5c0-3.45 2.8-6.25 6.25-6.25s6.25 2.8 6.25 6.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
);

export const IconUsers = props => (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" {...props}>
        <circle cx="7.5" cy="6.5" r="2.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M2.5 16c0-2.76 2.24-5 5-5s5 2.24 5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="14.5" cy="7" r="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M12.5 11.2c1.9.3 3.5 1.9 3.9 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
);

export const IconUserPlus = props => (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" {...props}>
        <circle cx="8" cy="7" r="3" stroke="currentColor" strokeWidth="1.5" />
        <path d="M2.5 17c0-3.3 2.5-6 5.5-6s5.5 2.7 5.5 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M16 6v5M13.5 8.5h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
);

export const IconContacts = props => (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" {...props}>
        <rect x="2.5" y="3.5" width="15" height="13" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="8" cy="8.2" r="1.9" stroke="currentColor" strokeWidth="1.5" />
        <path d="M5 13.2c0-1.7 1.3-2.8 3-2.8s3 1.1 3 2.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M12.5 7.5h3M12.5 10.5h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
);

export const IconCoin = props => (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" {...props}>
        <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" />
        <path
            d="M10 6.5v7M8 8h2.75a1.25 1.25 0 010 2.5H9.5a1.25 1.25 0 000 2.5H12"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

export const IconScissors = props => (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" {...props}>
        <circle cx="5.5" cy="5.5" r="2" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="5.5" cy="14.5" r="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M7 6.8L16.5 15M7 13.2L16.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
);

export const IconLogout = props => (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" {...props}>
        <path d="M7.5 17H4a1 1 0 01-1-1V4a1 1 0 011-1h3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M13 14l4-4-4-4M8.5 10H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export const IconUnlock = props => (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" {...props}>
        <rect x="4" y="9" width="12" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M6.5 9V6.5a3.5 3.5 0 016.5-1.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
);

export const IconGauge = props => (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" {...props}>
        <path d="M3 14a7 7 0 1114 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M10 14l3.5-4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
);

export const IconCheckCircle = props => (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" {...props}>
        <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" />
        <path d="M7 10l2 2 4-4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);
