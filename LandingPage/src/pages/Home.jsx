import { useDocumentHead } from "../hooks/useDocumentHead";
import { BRAND } from "../data/brand";
import Hero from "../components/home/Hero";
import IntroSection from "../components/home/IntroSection";
import ServicesSection from "../components/home/ServicesSection";
import WhyUsSection from "../components/home/WhyUsSection";
import BarbersTeaser from "../components/home/BarbersTeaser";
import GallerySection from "../components/home/GallerySection";
import BranchesTeaser from "../components/home/BranchesTeaser";
import CtaBand from "../components/home/CtaBand";

export default function Home() {
    useDocumentHead({
        title: undefined,
        description: `${BRAND.name} — ${BRAND.heroSubtext}`,
    });

    return (
        <>
            <Hero />
            <IntroSection />
            <ServicesSection />
            <WhyUsSection />
            <BarbersTeaser />
            <GallerySection />
            <BranchesTeaser />
            <CtaBand />
        </>
    );
}
