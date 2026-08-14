import { useEffect, useRef, useState } from "react";

function prefersReducedMotion() {
    return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function useReveal(threshold = 0.18) {
    const ref = useRef(null);
    const [inView, setInView] = useState(prefersReducedMotion);

    useEffect(() => {
        const node = ref.current;
        if (!node || prefersReducedMotion()) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setInView(true);
                    observer.disconnect();
                }
            },
            { threshold, rootMargin: "0px 0px -8% 0px" },
        );
        observer.observe(node);
        return () => observer.disconnect();
    }, [threshold]);

    return [ref, inView];
}
