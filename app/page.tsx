import { Navbar } from "@/components/layout/Navbar";
import { HeroSection } from "@/components/homepage/HeroSection";
import { CinematicSection } from "@/components/homepage/CinematicSection";
import { ProjectsSection } from "@/components/homepage/ProjectsSection";
import { AboutSection } from "@/components/homepage/AboutSection";
import { BrandSignSection } from "@/components/homepage/BrandSignSection";
import { ContactSection } from "@/components/homepage/ContactSection";
import { Footer } from "@/components/layout/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <CinematicSection />
        <ProjectsSection />
        <BrandSignSection />
        <AboutSection />
        <ContactSection>
          <Footer />
        </ContactSection>
      </main>
    </>
  );
}
