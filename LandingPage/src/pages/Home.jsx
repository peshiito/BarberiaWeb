import { useDocumentHead } from "../hooks/useDocumentHead";
import { BRAND } from "../data/brand";
import Hero from "../components/home/Hero";
import PriceBoard from "../components/home/PriceBoard";
import IntroSection from "../components/home/IntroSection";
import BarbersTeaser from "../components/home/BarbersTeaser";
import GallerySection from "../components/home/GallerySection";
import BranchesTeaser from "../components/home/BranchesTeaser";
import CtaBand from "../components/home/CtaBand";
import StickyBookBar from "../components/ui/StickyBookBar";

export default function Home() {
    useDocumentHead({
        title: undefined,
        description: `${BRAND.name} — ${BRAND.heroSubtext}`,
    });

    return (
        <>
            <Hero />
            <PriceBoard />
            <IntroSection />
            <BarbersTeaser />
            <GallerySection />
            <BranchesTeaser />
            <CtaBand />
            <StickyBookBar showAfter={560} />
        </>
    );
}
