import HomeHero from '../HomeHero';
import ClientsSection from './ClientsSection';
import HomeAboutSection from './HomeAboutSection';
import ThreeWaysSection from './ThreeWaysSection';
import CapabilitiesSection from './CapabilitiesSection';
import RayBlueprintSection from './RayBlueprintSection';
import WhyWemraySection from './WhyWemraySection';
import PortfolioPreviewSection from './PortfolioPreviewSection';
import RayAcademyPreviewSection from './RayAcademyPreviewSection';
import CTASection from '../../ui/CTASection';

export default function HomeSections() {
  return (
    <>
      <HomeHero />
      <ClientsSection />
      <HomeAboutSection />
      <ThreeWaysSection />
      <CapabilitiesSection />
      <RayBlueprintSection />
      <WhyWemraySection />
      <PortfolioPreviewSection />
      <RayAcademyPreviewSection />
      <CTASection primaryLabel="Start a Conversation" primaryHref="contact.html" />
    </>
  );
}
