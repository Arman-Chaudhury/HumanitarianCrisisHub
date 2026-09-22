# Crisis Hub

**A free, open-source website documenting 52 global humanitarian crises and giving people actionable ways to help.**

For each crisis: what is happening, who is doing credible work on the ground, and what you can do today.

I started this because every time a crisis was in the news, the people around
me wanted to help and did not know where to start, and by the time they found a
charity they trusted the news had moved on. Crisis Hub keeps all of it in one
place: what is happening, who is doing real work on the ground, and three
things you can do today.

![Crisis Hub](public/og.jpg)

## Highlights

- **Cinematic 3D globe**: a scroll-driven WebGL Earth built with Three.js: the camera flies from a horizon view into an interactive orbital stage where you can spin the globe, zoom with on-screen controls, and click any of 52 color-coded crisis hotspots. Rendered with 4K NASA Blue Marble imagery and a custom GLSL shader for the day/night terminator, city lights on the dark side, ocean specular shimmer, and a drifting cloud layer.
- **Live data pipeline**: a nightly GitHub Action refreshes two data files and commits them, so the site updates itself without manual editing:
  - **Headlines**: the latest situation reports per crisis from **UN OCHA's ReliefWeb** (official API when an appname is configured; public RSS otherwise, with a Google News fallback).
  - **Live indicators**: people in need, internally displaced persons, and IPC Phase 3+ food insecurity per country from **OCHA's Humanitarian API (HAPI) on HDX**, shown alongside the hand-curated statistics with their reference dates.
- **Smart labeling**: hotspot name labels render only for the front-facing hemisphere and scale with zoom, keeping dense regions readable.
- **Deep crisis pages**: every crisis has sourced statistics, background context, vetted donation organizations, awareness and political-action guides, licensed photography with attribution, and JSON-LD structured data.
- **Scroll choreography**: GSAP ScrollTrigger and Lenis smooth-scrolling drive the hero sequence off a single scrubbed timeline, synced to the WebGL camera at 60fps.
- **No CMS, no database**: content lives in per-crisis JSON files; every page is statically generated at build time.

## Tech Stack

- **Framework:** Next.js 14 (App Router), TypeScript, static generation
- **3D:** Three.js via @react-three/fiber + drei, custom GLSL shaders
- **Animation:** GSAP ScrollTrigger + Lenis
- **Styling:** Tailwind CSS with a light, single-typeface (Inter) design system
- **Data:** JSON files + nightly ReliefWeb ingestion (GitHub Actions)
- **Hosting:** Vercel

## Getting Started

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build (SSG for all 52 crisis pages)
```

Refresh the automated data manually with:

```bash
node scripts/update-reliefweb.mjs     # headlines (ReliefWeb / Google News)
node scripts/update-live-stats.mjs    # live indicators (OCHA HDX HAPI)
```

Both run nightly via `.github/workflows/update-data.yml`. Optional: request a free ReliefWeb appname (apidoc.reliefweb.int) and add it as the `RELIEFWEB_APPNAME` repository secret to use the official API from GitHub's servers.

## Project Structure

```
crisis-hub/
├── .github/workflows/update-data.yml   # Nightly ReliefWeb refresh
├── scripts/update-reliefweb.mjs        # UN ReliefWeb headline ingestion
├── scripts/update-live-stats.mjs       # OCHA HDX HAPI indicator ingestion
├── public/
│   ├── textures/                       # 4K NASA Blue Marble set
│   └── images/crises/                  # Per-crisis photography (Wikimedia, attributed)
├── src/
│   ├── app/
│   │   ├── page.tsx                    # Homepage (cinematic globe + grid)
│   │   ├── crises/[slug]/page.tsx      # 52 statically generated crisis pages
│   │   ├── about/ · resources/ · take-action/
│   │   └── sitemap.ts · robots.ts · not-found.tsx
│   ├── components/
│   │   ├── cinematic/                  # WebGL hero
│   │   │   ├── CinematicHero.tsx       # Scroll runway + stage choreography
│   │   │   ├── CinematicGlobe.tsx      # Canvas, camera rig, zoom, label planner
│   │   │   ├── EarthLayers.tsx         # Day/night shader, clouds, fade-in
│   │   │   ├── Hotspot.tsx             # Pulsing markers + labels
│   │   │   └── CrisisTakeoverModal.tsx # Photos, credits, live updates, CTAs
│   │   └── ...                         # Grid, stats, tabs, nav
│   ├── data/
│   │   ├── crises/*.json               # One file per crisis (sourced)
│   │   ├── reliefweb.json              # Auto-refreshed headlines
│   │   └── live-stats.json             # Auto-refreshed UN indicators
│   ├── lib/crises.ts
│   └── types/crisis.ts
└── tailwind.config.ts
```

## Adding a New Crisis

1. Create `src/data/crises/[slug].json` following the schema in `src/types/crisis.ts`
2. Include coordinates: the hotspot appears on the globe automatically
3. Provide 3–5 vetted donation organizations, awareness and political action items
4. Add sourced statistics and a detailed context section
5. The page, sitemap entry, and globe marker all generate automatically

## Content Principles

- **Cite everything**: UNHCR, WHO, ICRC, Reuters, AP, HRW, Amnesty
- **Never sensationalize**: the facts speak for themselves
- **Center affected voices**: prioritize local journalists and organizations
- **Acknowledge complexity**: no oversimplified good/evil narratives
- **Vet every organization**: Charity Navigator, GiveWell, direct research
- **Credit photography**: images are Wikimedia Commons, attributed with license in situ
- **Stay current**: nightly ReliefWeb ingestion + per-page "Last Updated" timestamps

## License

Open source, built to help people act on humanitarian crises.

---

*Built and maintained by Arman Chaudhury.*
