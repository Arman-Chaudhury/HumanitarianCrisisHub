import { getAllCrises } from "@/lib/crises";
import Explorer from "@/components/explorer/Explorer";
import CrisisGrid from "@/components/CrisisGrid";

export default function HomePage() {
  const crises = getAllCrises();

  return (
    <>
      <Explorer crises={crises} />
      <section id="crises" className="scroll-mt-24 pt-10">
        <CrisisGrid crises={crises} />
      </section>
    </>
  );
}
