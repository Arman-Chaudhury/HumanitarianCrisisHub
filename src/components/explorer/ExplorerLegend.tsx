import Link from "next/link";
import StatusLabel from "./StatusLabel";

/** Status key shown under the globe and the selected-crisis panel. */
export default function ExplorerLegend() {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-t border-gray-200 px-5 py-4">
      <div className="flex flex-wrap gap-x-5 gap-y-2">
        <StatusLabel status="escalating" />
        <StatusLabel status="active" />
        <StatusLabel status="underreported" />
      </div>
      <Link
        href="/methodology"
        className="text-sm text-gray-600 underline underline-offset-4"
      >
        How we classify crises
      </Link>
    </div>
  );
}
