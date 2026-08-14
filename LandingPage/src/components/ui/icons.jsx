const base = { width: 20, height: 20, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round" };

export function IconMenu(props) {
    return (
        <svg {...base} {...props}>
            <path d="M3 6h18M3 12h18M3 18h18" />
        </svg>
    );
}

export function IconClose(props) {
    return (
        <svg {...base} {...props}>
            <path d="M18 6 6 18M6 6l12 12" />
        </svg>
    );
}

export function IconScissors(props) {
    return (
        <svg {...base} {...props}>
            <circle cx="6" cy="6" r="3" />
            <circle cx="6" cy="18" r="3" />
            <path d="M20 4 8.12 15.88M14.47 14.48 20 20M8.12 8.12 12 12" />
        </svg>
    );
}

export function IconCalendar(props) {
    return (
        <svg {...base} {...props}>
            <rect x="3" y="5" width="18" height="16" rx="2" />
            <path d="M16 3v4M8 3v4M3 10h18" />
        </svg>
    );
}

export function IconClock(props) {
    return (
        <svg {...base} {...props}>
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3.5 2" />
        </svg>
    );
}

export function IconPin(props) {
    return (
        <svg {...base} {...props}>
            <path d="M12 21s7-6.4 7-12a7 7 0 1 0-14 0c0 5.6 7 12 7 12Z" />
            <circle cx="12" cy="9" r="2.4" />
        </svg>
    );
}

export function IconPhone(props) {
    return (
        <svg {...base} {...props}>
            <path d="M6.6 3h3.2l1.4 4.6-2.3 1.7a12 12 0 0 0 5.8 5.8l1.7-2.3 4.6 1.4v3.2c0 1-.8 1.9-1.8 1.8-8-.6-14.4-7-15-15C3 3.8 4 3 5 3Z" />
        </svg>
    );
}

export function IconUser(props) {
    return (
        <svg {...base} {...props}>
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21c1.5-4.5 5-6 8-6s6.5 1.5 8 6" />
        </svg>
    );
}

export function IconCheck(props) {
    return (
        <svg {...base} {...props}>
            <path d="m5 13 4 4 10-10" />
        </svg>
    );
}

export function IconArrowRight(props) {
    return (
        <svg {...base} {...props}>
            <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
    );
}

export function IconArrowLeft(props) {
    return (
        <svg {...base} {...props}>
            <path d="M19 12H5M11 6l-6 6 6 6" />
        </svg>
    );
}

export function IconStar(props) {
    return (
        <svg {...base} {...props} fill="currentColor" stroke="none">
            <path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.9L12 17.8 5.8 21.1 7 14.2l-5-4.9 6.9-1L12 2Z" />
        </svg>
    );
}

export function IconImageBroken(props) {
    return (
        <svg {...base} {...props}>
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="m8 15 3-3 2 2 3-4 3 5M9 9h.01" />
        </svg>
    );
}

export function IconInbox(props) {
    return (
        <svg {...base} {...props}>
            <path d="M3 12h4l2 3h6l2-3h4" />
            <path d="M5.5 6h13L21 12v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-6L5.5 6Z" />
        </svg>
    );
}

export function IconWarning(props) {
    return (
        <svg {...base} {...props}>
            <path d="M12 3 2 20h20L12 3Z" />
            <path d="M12 10v4M12 17h.01" />
        </svg>
    );
}

export function IconRazor(props) {
    return (
        <svg {...base} {...props}>
            <path d="M4 20 15 9" />
            <path d="M13 7l4-4 3 3-4 4-6 6-3-3Z" />
            <path d="M4 20l2-5" />
        </svg>
    );
}

export function IconComb(props) {
    return (
        <svg {...base} {...props}>
            <path d="M4 4h16v4H4z" />
            <path d="M6 8v12M9.5 8v12M13 8v12M16.5 8v12M20 8v12" />
        </svg>
    );
}

export function IconChair(props) {
    return (
        <svg {...base} {...props}>
            <path d="M6 3v9a3 3 0 0 0 3 3h3" />
            <path d="M6 9h8" />
            <path d="M17 3v9" />
            <path d="M9 15v6M15 15l1 6" />
            <path d="M5 21h14" />
        </svg>
    );
}

export function IconTowel(props) {
    return (
        <svg {...base} {...props}>
            <path d="M4 3h16v6a8 8 0 0 1-8 8 8 8 0 0 1-8-8V3Z" />
            <path d="M4 7h16M8 3v4M12 3v4M16 3v4" />
        </svg>
    );
}

export function IconMirror(props) {
    return (
        <svg {...base} {...props}>
            <ellipse cx="12" cy="10" rx="7" ry="8" />
            <path d="M9 22h6M12 18v4" />
        </svg>
    );
}

export function IconWhatsapp(props) {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" width={20} height={20} {...props}>
            <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.39 1.26 4.81L2 22l5.41-1.42a9.9 9.9 0 0 0 4.63 1.15h.01c5.46 0 9.9-4.45 9.9-9.91C21.96 6.45 17.5 2 12.04 2Zm5.8 14.02c-.24.68-1.4 1.31-1.93 1.36-.5.06-1.03.28-3.44-.72-2.9-1.2-4.77-4.15-4.92-4.34-.14-.2-1.18-1.57-1.18-3 0-1.42.75-2.12 1.01-2.41.27-.29.58-.36.78-.36.19 0 .39 0 .55.01.18.01.42-.07.65.5.24.58.82 2 .89 2.14.07.15.12.32.02.51-.09.2-.14.32-.28.49-.14.17-.29.37-.42.5-.14.14-.28.29-.12.57.16.29.71 1.17 1.53 1.9 1.05.94 1.94 1.23 2.22 1.37.29.14.46.12.63-.07.17-.2.71-.83.9-1.11.19-.29.38-.24.63-.14.26.09 1.65.78 1.93.92.29.15.48.22.55.34.07.13.07.72-.17 1.4Z" />
        </svg>
    );
}
