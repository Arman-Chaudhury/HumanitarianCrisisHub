import type { CrisisStatus } from "@/types/crisis";

export const STATUS_COLORS: Record<CrisisStatus, string> = {
  active: "#E63946",        // Red — immediate danger
  escalating: "#FFD166",    // Yellow — worsening situation
  underreported: "#D4580E", // Dark orange — overlooked but urgent
};

export function getStatusColor(status: CrisisStatus): string {
  return STATUS_COLORS[status] ?? "#FFD166";
}
