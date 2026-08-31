/**
 * Pulls the latest humanitarian reports for every crisis from UN OCHA's
 * ReliefWeb (public RSS search feeds — no API key required) into
 * src/data/reliefweb.json. Run manually or via the nightly GitHub Action
 * (.github/workflows/update-data.yml).
 *
 *   node scripts/update-reliefweb.mjs
 */
import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const CRISES_DIR = "src/data/crises";
const OUT_FILE = "src/data/reliefweb.json";
const FEED = "https://reliefweb.int/updates/rss.xml?search=";
const UA = "CrisisHub/1.0";

/** Search terms that work better on ReliefWeb than the crisis's display name. */
const QUERY_OVERRIDES = {
  "bangladesh-climate": "Bangladesh floods",
  "pakistan-floods": "Pakistan floods",
  "horn-of-africa-drought": '"Horn of Africa" drought',
  "lake-chad": '"Lake Chad"',
  congo: '"Democratic Republic of the Congo"',
  palestine: '"occupied Palestinian territory"',
  "sahrawi-refugees": '"Western Sahara"',
  "amazon-indigenous": "Amazon indigenous",
  "pacific-islands": "Pacific sea level rise",
  "san-bushmen": "San Botswana indigenous",
  "tamils-sri-lanka": "Sri Lanka Tamil",
  "adivasi-india": "Adivasi India",
  rohingya: "Rohingya",
  uyghurs: "Uyghur Xinjiang",
  kashmir: "Kashmir",
  balochistan: "Balochistan",
  sahel: "Sahel",
  "west-papua": '"West Papua"',
  "aboriginal-australians": "Aboriginal Australia",
  "central-african-republic": '"Central African Republic"',
  "nagorno-karabakh": "Nagorno-Karabakh",
  "north-korea": '"Democratic People\'s Republic of Korea"',
  "saudi-arabia": "Saudi Arabia migrant workers",
  "south-sudan": '"South Sudan"',
};

const unescapeXml = (s) =>
  s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&amp;/g, "&")
    .trim();

function parseItems(xml) {
  const items = [];
  for (const m of xml.matchAll(/<item>([\s\S]*?)<\/item>/g)) {
    const block = m[1];
    const pick = (tag) => {
      const mm = block.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`));
      return mm ? unescapeXml(mm[1]) : "";
    };
    const title = pick("title");
    const link = pick("link");
    const pubDate = pick("pubDate");
    // Source orgs live inside the escaped description HTML
    const desc = pick("description");
    const src = desc.match(/Sources?:\s*([^<]+)</);
    const date = pubDate ? new Date(pubDate).toISOString().slice(0, 10) : "";
    if (title && link) {
      items.push({
        title,
        date,
        url: link,
        source: src ? src[1].trim().split(",")[0].trim() : "ReliefWeb",
      });
    }
  }
  return items;
}

let debuggedEmpty = false;
async function fetchReportsRss(term) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const res = await fetch(FEED + encodeURIComponent(term), {
      headers: { "User-Agent": UA },
    });
    if (res.ok) {
      const body = await res.text();
      const items = parseItems(body).slice(0, 3);
      if (items.length === 0 && !debuggedEmpty) {
        // Diagnose silently-empty responses (e.g. bot challenge served as 200)
        debuggedEmpty = true;
        console.error(
          `DEBUG empty feed for "${term}": content-type=${res.headers.get("content-type")}, ` +
            `bytes=${body.length}, head=${JSON.stringify(body.slice(0, 200))}`,
        );
      }
      return items;
    }
    // 406/429 are rate limiting — back off and retry
    if (res.status === 406 || res.status === 429) {
      await new Promise((r) => setTimeout(r, 20000 * (attempt + 1)));
      continue;
    }
    throw new Error(`ReliefWeb RSS ${res.status} for "${term}"`);
  }
  throw new Error(`ReliefWeb rate limit persisted for "${term}"`);
}

/**
 * Official ReliefWeb API v2 — used when RELIEFWEB_APPNAME is set (request one
 * free at https://apidoc.reliefweb.int/parameters#appname, then add it as a
 * repo secret so the GitHub Action can use it). More reliable than RSS, which
 * serves bot challenges to some datacenter IPs.
 */
async function fetchReportsApi(term) {
  const res = await fetch(
    `https://api.reliefweb.int/v2/reports?appname=${encodeURIComponent(process.env.RELIEFWEB_APPNAME)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "User-Agent": UA },
      body: JSON.stringify({
        query: { value: term, operator: "AND" },
        limit: 3,
        sort: ["date.created:desc"],
        fields: { include: ["title", "date.created", "url", "source.shortname"] },
      }),
    },
  );
  if (!res.ok) throw new Error(`ReliefWeb API ${res.status} for "${term}"`);
  const json = await res.json();
  return (json.data ?? []).map((d) => ({
    title: d.fields?.title ?? "",
    date: (d.fields?.date?.created ?? "").slice(0, 10),
    url: d.fields?.url ?? "",
    source: d.fields?.source?.[0]?.shortname ?? "",
  }));
}

const fetchReports = process.env.RELIEFWEB_APPNAME ? fetchReportsApi : fetchReportsRss;

const files = (await readdir(CRISES_DIR)).filter((f) => f.endsWith(".json"));
const out = { generated: new Date().toISOString().slice(0, 10), crises: {} };
let ok = 0;

for (const file of files) {
  const crisis = JSON.parse(await readFile(path.join(CRISES_DIR, file), "utf-8"));
  const term = QUERY_OVERRIDES[crisis.slug] ?? crisis.name;
  try {
    const items = await fetchReports(term);
    if (items.length > 0) {
      out.crises[crisis.slug] = items;
      ok += 1;
    }
  } catch (err) {
    console.error(`${crisis.slug}: ${err.message}`);
  }
  await new Promise((r) => setTimeout(r, 1500));
}

await writeFile(OUT_FILE, JSON.stringify(out, null, 2) + "\n");
console.log(`reliefweb.json written — ${ok}/${files.length} crises have updates`);
