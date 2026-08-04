import { getAllCrises } from "@/lib/crises";
import CinematicHero from "@/components/cinematic/CinematicHero";
import CrisisGrid from "@/components/CrisisGrid";
import UrgentBanner from "@/components/UrgentBanner";
import HomeStats from "@/components/HomeStats";

const HEADLINE_STATS = [
  { value: "10M+", label: "Displaced (Sudan)" },
  { value: "21M+", label: "Facing Famine" },
  { value: "96%", label: "Underreported" },
  { value: "1.8M", label: "Refugees Abroad" },
];

export default function HomePage() {
  const crises = getAllCrises();

  return (
    <>
      <UrgentBanner message="Multiple humanitarian crises demand urgent attention. Millions face famine, displacement, and violence. Scroll down to learn how you can help — right now." />

      {/* Cinematic hero: scroll-driven globe + takeover modal + mobile fallback */}
      <CinematicHero crises={crises} />

      {/* Stage 3 reveal: headline stats grid */}
      <section id="impact" className="relative z-10">
        <HomeStats stats={HEADLINE_STATS} />
      </section>

      {/* Crisis grid (existing) */}
      <section id="crises" className="relative z-10">
        <CrisisGrid crises={crises} />
      </section>
    </>
  );
}
