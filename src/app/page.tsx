import { getAllCrises } from "@/lib/crises";
import HomeExperience from "@/components/explorer/HomeExperience";
import FeaturedCrises from "@/components/FeaturedCrises";

export default function HomePage() {
  const crises = getAllCrises();

  return (
    <>
      <HomeExperience crises={crises} />
      <section id="crises" className="scroll-mt-24 pt-12">
        <FeaturedCrises crises={crises} />
      </section>
    </>
  );
}
