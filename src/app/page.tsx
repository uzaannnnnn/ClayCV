import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { TemplatesSection } from "@/components/landing/TemplatesSection";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { Footer } from "@/components/landing/Footer";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#F4F1EB] overflow-x-hidden">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Features />
        <div className="hidden md:block">
          <HowItWorks />
          <TemplatesSection />
        </div>
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
