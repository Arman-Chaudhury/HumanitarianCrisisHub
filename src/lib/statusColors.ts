import type { CrisisStatus } from "@/types/crisis";

export const STATUS_COLORS: Record<CrisisStatus, string> = {
  escalating: "#A44136",
  active: "#8A681F",
  underreported: "#526D7C",
};

export const STATUS_LABELS: Record<CrisisStatus, string> = {
  escalating: "Escalating",
  active: "Active",
  underreported: "Underreported",
};

export const STATUS_CLASSES: Record<CrisisStatus, string> = {
  escalating: "text-[#A44136]",
  active: "text-[#8A681F]",
  underreported: "text-[#526D7C]",
};

export function getStatusColor(status: CrisisStatus): string {
  return STATUS_COLORS[status] ?? STATUS_COLORS.active;
}
