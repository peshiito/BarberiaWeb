const cssVar = name => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

export const hexToRgba = (hex, alpha = 1) => {
    const clean = hex.replace("#", "");
    const bigint = parseInt(clean, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const chartColors = () => ({
    brass: cssVar("--brass"),
    brassBright: cssVar("--brass-bright"),
    burgundy: cssVar("--burgundy"),
    burgundyBright: cssVar("--burgundy-bright"),
    sage: cssVar("--sage"),
    sageBright: cssVar("--sage-bright"),
    textPrimary: cssVar("--text-primary"),
    textSecondary: cssVar("--text-secondary"),
    textMuted: cssVar("--text-muted"),
    borderSubtle: cssVar("--border-subtle"),
    borderStrong: cssVar("--border-strong"),
    bgSurface: cssVar("--bg-surface"),
    bgElevated: cssVar("--bg-elevated"),
});

export const chartFont = (size = 11, family = "mono") => ({
    family: family === "mono" ? "'JetBrains Mono', monospace" : "'Inter', sans-serif",
    size,
});

export const prefersReducedMotion = () =>
    typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

export const chartAnimation = () => (prefersReducedMotion() ? false : { duration: 320, easing: "easeOutQuart" });

export const chartTooltipBase = colors => ({
    backgroundColor: colors.bgElevated,
    borderColor: colors.borderStrong,
    borderWidth: 1,
    padding: 10,
    cornerRadius: 8,
    titleColor: colors.textPrimary,
    titleFont: chartFont(12, "body"),
    bodyColor: colors.textSecondary,
    bodyFont: chartFont(12, "body"),
    displayColors: false,
});
