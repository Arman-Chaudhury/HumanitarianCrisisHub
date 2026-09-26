import { getAllCrises } from "@/lib/crises";
import Explorer from "@/components/explorer/Explorer";
import CrisisGrid from "@/components/CrisisGrid";

export default function HomePage() {
  const crises = getAllCrises();

  return (
    <>
      <header className="mb-8 grid gap-5 lg:grid-cols-[2fr_1fr] lg:items-end">
        <div>
          <p className="mb-3 text-sm text-gray-600">
            Independent humanitarian reference
          </p>
          <h1 className="text-3xl font-semibold leading-tight tracking-tight text-gray-900 sm:text-4xl lg:text-[44px]">
            {crises.length} humanitarian crises.
            <span className="block font-normal">
              What is happening, and how to help.
            </span>
          </h1>
        </div>
        <p className="max-w-md text-base leading-relaxed text-gray-600">
          Explore sourced briefings and find organizations working with people
          affected by humanitarian emergencies.
        </p>
      </header>
      <Explorer crises={crises} />
      <section id="crises" className="scroll-mt-24 pt-12">
        <CrisisGrid crises={crises} />
      </section>
    </>
  );
}
