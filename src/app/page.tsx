import { getAllCrises } from "@/lib/crises";
import CinematicHero from "@/components/cinematic/CinematicHero";
import CrisisGrid from "@/components/CrisisGrid";
import HomeStats from "@/components/HomeStats";

const HEADLINE_STATS = [
  { value: "52", label: "Crises documented" },
  { value: "32", label: "With live UN indicators" },
  { value: "156", label: "Sourced photographs" },
  { value: "24h", label: "Data refresh cycle" },
];

export default function HomePage() {
  const crises = getAllCrises();

  return (
    <>
      {/* Interactive globe: scroll-driven on desktop, static-orbit on touch devices */}
      <CinematicHero crises={crises} />

      <section id="impact" className="relative z-10">
        <HomeStats stats={HEADLINE_STATS} />
      </section>

      <section id="crises" className="relative z-10">
        <CrisisGrid crises={crises} />
      </section>
    </>
  );
}
