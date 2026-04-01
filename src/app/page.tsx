import { getAllCrises } from "@/lib/crises";
import GlobeLoader from "@/components/GlobeLoader";
import CrisisGrid from "@/components/CrisisGrid";
import UrgentBanner from "@/components/UrgentBanner";

export default function HomePage() {
  const crises = getAllCrises();

  return (
    <>
      <UrgentBanner message="Multiple humanitarian crises demand urgent attention. Millions face famine, displacement, and violence. Scroll down to learn how you can help — right now." />

      {/* Hero */}
      <section className="text-center mb-8 animate-fade-up-2">
        <h1 className="font-display text-[clamp(48px,12vw,100px)] text-text-bright tracking-[0.06em] leading-[0.92] mb-3">
          EVERY CRISIS.
          <br />
          <span className="text-crisis-red">REAL ACTION.</span>
        </h1>
        <p className="font-sans text-base sm:text-lg text-text-body font-light max-w-[520px] mx-auto leading-relaxed">
          One website documenting global humanitarian crises — with three clear
          paths to help: <strong className="text-text-bright font-medium">donate</strong>,{" "}
          <strong className="text-text-bright font-medium">amplify</strong>, and{" "}
          <strong className="text-text-bright font-medium">demand change</strong>.
        </p>
      </section>

      {/* Interactive Globe */}
      <GlobeLoader crises={crises} />

      {/* Crisis Grid */}
      <CrisisGrid crises={crises} />
    </>
  );
}
