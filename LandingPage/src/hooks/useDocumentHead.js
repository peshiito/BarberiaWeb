import { useEffect } from "react";
import { BRAND } from "../data/brand";

function setMeta(name, content, attr = "name") {
    if (!content) return;
    let el = document.querySelector(`meta[${attr}="${name}"]`);
    if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, name);
        document.head.appendChild(el);
    }
    el.setAttribute("content", content);
}

function setCanonical(href) {
    let el = document.querySelector('link[rel="canonical"]');
    if (!el) {
        el = document.createElement("link");
        el.setAttribute("rel", "canonical");
        document.head.appendChild(el);
    }
    el.setAttribute("href", href);
}

export function useDocumentHead({ title, description, noIndex = false, image = "/assets/images/og/og-image.png" }) {
    useEffect(() => {
        const fullTitle = title ? `${title} · ${BRAND.name}` : BRAND.name;
        const absoluteImage = image.startsWith("http") ? image : window.location.origin + image;
        document.title = fullTitle;
        setMeta("description", description);
        setMeta("robots", noIndex ? "noindex, nofollow" : "index, follow");
        setMeta("og:title", fullTitle, "property");
        setMeta("og:description", description, "property");
        setMeta("og:type", "website", "property");
        setMeta("og:url", window.location.href, "property");
        setMeta("og:image", absoluteImage, "property");
        setMeta("twitter:card", "summary_large_image");
        setMeta("twitter:title", fullTitle);
        setMeta("twitter:description", description);
        setMeta("twitter:image", absoluteImage);
        setCanonical(window.location.origin + window.location.pathname);
    }, [title, description, noIndex, image]);
}
