/**
 * Pulls live humanitarian indicators for every crisis from UN OCHA's
 * Humanitarian API (HAPI, hapi.humdata.org) into src/data/live-stats.json.
 * No API key: HAPI accepts a self-generated app identifier.
 *
 *   node scripts/update-live-stats.mjs
 *
 * Indicators (national level, latest reference period):
 *   peopleInNeed  — intersectoral people in need (Humanitarian Needs Overview)
 *   idps          — internally displaced persons (IOM DTM baseline)
 *   foodInsecure  — population in IPC Phase 3+ (crisis or worse)
 */
import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const CRISES_DIR = "src/data/crises";
const OUT_FILE = "src/data/live-stats.json";
const BASE = "https://hapi.humdata.org/api/v2";
const APP = Buffer.from("crisishub:chaudhura@gmail.com").toString("base64");

/** Crisis slug → ISO3 country HAPI reports on. Multi-country or
 *  sub-national crises without a clean national proxy are omitted. */
const ISO3 = {
  afghanistan: "AFG", "bangladesh-climate": "BGD", "burkina-faso": "BFA",
  cameroon: "CMR", "central-african-republic": "CAF", chad: "TCD",
  colombia: "COL", congo: "COD", eritrea: "ERI", ethiopia: "ETH", haiti: "HTI",
  iraq: "IRQ", lebanon: "LBN", libya: "LBY", madagascar: "MDG", mali: "MLI",
  mozambique: "MOZ", myanmar: "MMR", niger: "NER", nigeria: "NGA",
  "north-korea": "PRK", "pakistan-floods": "PAK", balochistan: "PAK",
  palestine: "PSE", rohingya: "BGD", somalia: "SOM", "south-sudan": "SSD",
  sudan: "SDN", syria: "SYR", "tamils-sri-lanka": "LKA", ukraine: "UKR",
  venezuela: "VEN", yemen: "YEM", "horn-of-africa-drought": "SOM",
  "amazon-indigenous": "BRA", "adivasi-india": "IND", iran: "IRN",
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Polite, retrying fetch — HDX rate-limits bursts as "bot activity". */
async function hapi(endpoint, params) {
  const qs = new URLSearchParams({ ...params, output_format: "json", limit: "200", app_identifier: APP });
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const res = await fetch(`${BASE}/${endpoint}?${qs}`, { headers: { "User-Agent": "CrisisHub/1.0" } });
    await sleep(1500);
    if (res.ok) return (await res.json()).data ?? [];
    if (res.status === 429) {
      await sleep(30000 * (attempt + 1));
      continue;
    }
    throw new Error(`HAPI ${res.status} ${endpoint}`);
  }
  throw new Error(`HAPI rate limit persisted for ${endpoint}`);
}

const latest = (rows) =>
  rows.sort((a, b) => (b.reference_period_end ?? "").localeCompare(a.reference_period_end ?? ""))[0];

const period = (r) => (r?.reference_period_end ?? "").slice(0, 10);

async function indicators(iso3) {
  const out = {};
  try {
    const pin = latest((await hapi("affected-people/humanitarian-needs", {
      location_code: iso3, admin_level: "0", sector_code: "Intersectoral",
      population_status: "INN",
    })).filter((r) => !r.category));
    if (pin?.population) out.peopleInNeed = { value: pin.population, asOf: period(pin), source: "OCHA HNO via HDX HAPI" };
  } catch (e) { console.error(`${iso3} PIN: ${e.message}`); }
  try {
    const idp = latest(await hapi("affected-people/idps", { location_code: iso3, admin_level: "0" }));
    if (idp?.population) out.idps = { value: idp.population, asOf: period(idp), source: "IOM DTM via HDX HAPI" };
  } catch (e) { console.error(`${iso3} IDP: ${e.message}`); }
  try {
    const ipc = latest(await hapi("food-security-nutrition-poverty/food-security", {
      location_code: iso3, admin_level: "0", ipc_phase: "3+", ipc_type: "current",
    }));
    if (ipc?.population_in_phase) out.foodInsecure = { value: ipc.population_in_phase, asOf: period(ipc), source: "IPC Phase 3+ via HDX HAPI" };
  } catch (e) { console.error(`${iso3} IPC: ${e.message}`); }
  return out;
}

const files = (await readdir(CRISES_DIR)).filter((f) => f.endsWith(".json"));
const out = { generated: new Date().toISOString().slice(0, 10), crises: {} };
let ok = 0;
for (const file of files) {
  const crisis = JSON.parse(await readFile(path.join(CRISES_DIR, file), "utf-8"));
  const iso3 = ISO3[crisis.slug];
  if (!iso3) continue;
  const ind = await indicators(iso3);
  if (Object.keys(ind).length > 0) {
    out.crises[crisis.slug] = { iso3, ...ind };
    ok += 1;
  }
  await sleep(500);
}
await writeFile(OUT_FILE, JSON.stringify(out, null, 2) + "\n");
console.log(`live-stats.json written — ${ok}/${files.length} crises have live indicators`);
