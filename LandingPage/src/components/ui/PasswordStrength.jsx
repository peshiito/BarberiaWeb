import { motion } from "motion/react";
import { IconCheck, IconClose } from "./icons";
import "./PasswordStrength.css";

const EASE_OUT = [0.23, 1, 0.32, 1];

const REQUIREMENTS = [
    { key: "length", label: "Mínimo 8 caracteres", test: (v) => v.length >= 8 },
    { key: "upper", label: "Una mayúscula", test: (v) => /[A-Z]/.test(v) },
    { key: "number", label: "Un número", test: (v) => /[0-9]/.test(v) },
    { key: "special", label: "Un símbolo especial", test: (v) => /[^a-zA-Z0-9]/.test(v) },
];

export function getPasswordLevel(password) {
    if (!password) return "empty";
    const metCount = REQUIREMENTS.filter((r) => r.test(password)).length;
    if (metCount <= 1) return "weak";
    if (metCount <= 3) return "medium";
    return "strong";
}

export default function PasswordStrength({ password }) {
    if (!password) return null;

    const results = REQUIREMENTS.map((r) => ({ ...r, met: r.test(password) }));
    const metCount = results.filter((r) => r.met).length;
    const level = getPasswordLevel(password);

    return (
        <div className="password-strength" data-level={level}>
            <div className="password-strength-bar" role="progressbar" aria-valuenow={metCount} aria-valuemin={0} aria-valuemax={4}>
                {REQUIREMENTS.map((_, i) => (
                    <motion.span
                        key={i}
                        className="password-strength-seg"
                        data-level={level}
                        initial={false}
                        animate={{ opacity: i < metCount ? 1 : 0.18 }}
                        transition={{ duration: 0.25, ease: EASE_OUT }}
                    />
                ))}
            </div>

            <ul className="password-strength-list">
                {results.map((r) => (
                    <li key={r.key} className={r.met ? "is-met" : ""}>
                        <motion.span
                            className="password-strength-icon"
                            initial={false}
                            animate={{ scale: r.met ? 1 : 0.85, opacity: r.met ? 1 : 0.55 }}
                            transition={{ duration: 0.18, ease: EASE_OUT }}
                        >
                            {r.met ? <IconCheck width={11} height={11} /> : <IconClose width={11} height={11} />}
                        </motion.span>
                        {r.label}
                    </li>
                ))}
            </ul>
        </div>
    );
}
