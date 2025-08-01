import HeroSection from "@/src/app/[lang]/(private)/_components/hero-section"
import ProblemSection from "@/src/app/[lang]/(private)/_components/problem-section"
import SolutionSection from "@/src/app/[lang]/(private)/_components/solution-section"
import AssessmentSection from "@/src/app/[lang]/(private)/_components/assessment-section"
import MarketingStrategyGenerator from "@/src/app/[lang]/(private)/_components/marketing-strategy-generator"
import TestimonialsSection from "@/src/app/[lang]/(private)/_components/testimonials-section"
import CtaSection from "@/src/app/[lang]/(private)/_components/cta-section"
import SubNavbar from "@/src/app/[lang]/(public)/_components/sub-navbar" // Import SubNavbar

// Define IDs for sections that SubNavbar will link to
const sectionIds = {
  metodo: "metodo",
  paraQuien: "para-quien",
  exito: "exito",
  recursosHome: "recursos-home", // Ensure this ID exists on a relevant section
}

export default function HomePage() {
  return (
    <>
      <SubNavbar /> {/* Add SubNavbar here */}
      <HeroSection />
      {/* Ensure sections have the IDs defined in sub-navbar-routes.json */}
      <div id={sectionIds.metodo}>
        <SolutionSection />
      </div>
      <div id={sectionIds.paraQuien}>
        <AssessmentSection />
      </div>
      <div id={sectionIds.recursosHome}>
        {" "}
        {/* Example: MarketingStrategy could be 'Recursos' */}
        <MarketingStrategyGenerator />
      </div>
      <div id={sectionIds.exito}>
        <TestimonialsSection />
      </div>
      <ProblemSection /> {/* This section was not in sub-navbar, can be placed anywhere */}
      <CtaSection />
    </>
  )
}
