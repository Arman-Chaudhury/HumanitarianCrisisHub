import { STATUS_CLASSES, STATUS_LABELS } from "@/lib/statusColors";
import type { CrisisStatus } from "@/types/crisis";

export default function StatusLabel({ status }: { status: CrisisStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-2 text-sm font-medium ${STATUS_CLASSES[status]}`}
    >
      <span
        aria-hidden="true"
        className="h-2 w-2 shrink-0 rounded-full bg-current"
      />
      {STATUS_LABELS[status]}
    </span>
  );
}
