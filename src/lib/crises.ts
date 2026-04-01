import fs from "fs";
import path from "path";
import type { Crisis } from "@/types/crisis";

const CRISES_DIR = path.join(process.cwd(), "src/data/crises");

export function getAllCrises(): Crisis[] {
  const files = fs.readdirSync(CRISES_DIR).filter((f) => f.endsWith(".json"));
  return files
    .map((file) => {
      const raw = fs.readFileSync(path.join(CRISES_DIR, file), "utf-8");
      return JSON.parse(raw) as Crisis;
    })
    .sort((a, b) => {
      const order: Record<string, number> = {
        escalating: 0,
        active: 1,
        underreported: 2,
      };
      return (order[a.status] ?? 3) - (order[b.status] ?? 3);
    });
}

export function getCrisisBySlug(slug: string): Crisis | null {
  const filePath = path.join(CRISES_DIR, `${slug}.json`);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as Crisis;
}

export function getAllCrisisSlugs(): string[] {
  const files = fs.readdirSync(CRISES_DIR).filter((f) => f.endsWith(".json"));
  return files.map((f) => f.replace(".json", ""));
}
