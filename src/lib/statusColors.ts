import { institutionColors } from "../../tailwind.config";
import type { CrisisStatus } from "@/types/crisis";

export const STATUS_COLORS: Record<CrisisStatus, string> = {
  escalating: institutionColors.escalating,
  active: institutionColors.active,
  underreported: institutionColors.underreported,
};

export const STATUS_LABELS: Record<CrisisStatus, string> = {
  escalating: "Escalating",
  active: "Active",
  underreported: "Underreported",
};

export const STATUS_CLASSES: Record<CrisisStatus, string> = {
  escalating: "text-institution-escalating",
  active: "text-institution-active",
  underreported: "text-institution-underreported",
};

export function getStatusColor(status: CrisisStatus): string {
  return STATUS_COLORS[status] ?? STATUS_COLORS.active;
}
