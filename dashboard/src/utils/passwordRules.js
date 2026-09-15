// Mismas reglas que strongPasswordField en el backend (alta de barberos y
// cambio de contraseña).
export const PASSWORD_RULES = [
    { key: "length", label: "8+ caracteres", test: p => p.length >= 8 },
    { key: "upper", label: "1 mayúscula", test: p => /[A-Z]/.test(p) },
    { key: "lower", label: "1 minúscula", test: p => /[a-z]/.test(p) },
    { key: "number", label: "1 número", test: p => /[0-9]/.test(p) },
    { key: "symbol", label: "1 símbolo", test: p => /[^A-Za-z0-9]/.test(p) },
];

export const isStrongPassword = password => PASSWORD_RULES.every(rule => rule.test(password));
