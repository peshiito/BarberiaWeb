import { useEffect, useState } from "react";

export const useMediaQuery = query => {
    const [matches, setMatches] = useState(() => typeof window !== "undefined" && window.matchMedia(query).matches);

    useEffect(() => {
        const media = window.matchMedia(query);
        const handleChange = () => setMatches(media.matches);
        handleChange();
        media.addEventListener("change", handleChange);
        return () => media.removeEventListener("change", handleChange);
    }, [query]);

    return matches;
};
