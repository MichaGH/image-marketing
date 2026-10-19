import { Navbar } from "@/components/layout/Navbar";
import { HeroSection } from "@/components/homepage/HeroSection";
import { CinematicSection } from "@/components/homepage/CinematicSection";
import { ProjectsSection } from "@/components/homepage/ProjectsSection";
import { AboutSection } from "@/components/homepage/AboutSection";
import { ProcessSection } from "@/components/homepage/ProcessSection";
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
        <AboutSection />
        <ProcessSection />
        <ContactSection>
          <Footer />
        </ContactSection>
      </main>
    </>
  );
}
