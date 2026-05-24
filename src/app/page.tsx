import { CollectionSection } from "@/components/collection-section";
import { ExhibitionSection } from "@/components/exhibition-section";
import { Hero } from "@/components/hero";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { StudioSection } from "@/components/studio-section";
import { VisitSection } from "@/components/visit-section";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
        <ExhibitionSection />
        <CollectionSection />
        <StudioSection />
        <VisitSection />
      </main>
      <SiteFooter />
    </>
  );
}
