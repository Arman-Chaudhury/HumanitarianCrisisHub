import type { Metadata } from "next";
import { getAllCrises } from "@/lib/crises";
import CrisisGrid from "@/components/CrisisGrid";

export const metadata: Metadata = {
  title: "All crises",
  description:
    "Browse and search every humanitarian crisis briefing on Crisis Hub by country, community, region or status.",
};

export default function CrisesPage() {
  const crises = getAllCrises();
  return <CrisisGrid crises={crises} />;
}
