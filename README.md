# Crisis Hub

**A free, open-source website documenting global humanitarian crises and giving people actionable ways to help.**

One website. Every crisis. Three actions: **Donate**, **Amplify**, **Demand Change**.

## Tech Stack

- **Framework:** Next.js 14 (App Router), TypeScript
- **Styling:** Tailwind CSS
- **Content:** JSON data files (no CMS, no database)
- **3D Globe:** Three.js via @react-three/fiber
- **Hosting:** Vercel (free tier)
- **Design:** Dark Ember × Bold — warm dark palette, Bebas Neue display headings, Instrument Serif accents, DM Sans body

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

## Project Structure

```
crisis-hub/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Global layout (nav, footer, fonts)
│   │   ├── page.tsx                # Homepage (globe + crisis grid)
│   │   ├── globals.css             # Tailwind + Dark Ember styles
│   │   ├── sitemap.ts              # Auto-generated sitemap
│   │   ├── robots.ts               # SEO robots.txt
│   │   ├── not-found.tsx           # Custom 404
│   │   ├── crises/[slug]/page.tsx  # Dynamic crisis pages
│   │   ├── about/page.tsx          # Mission & principles
│   │   ├── resources/page.tsx      # Universal orgs & vetting tools
│   │   └── take-action/page.tsx    # Rep lookup, call scripts, templates
│   ├── components/
│   │   ├── Navbar.tsx              # Site navigation
│   │   ├── Footer.tsx              # Site footer
│   │   ├── Globe.tsx               # Interactive 3D globe (Three.js)
│   │   ├── GlobeLoader.tsx         # Dynamic import wrapper (no SSR)
│   │   ├── CrisisCard.tsx          # Homepage crisis card
│   │   ├── CrisisGrid.tsx          # Grid of all crisis cards
│   │   ├── StatsBar.tsx            # Statistics bar on crisis pages
│   │   ├── ActionTabs.tsx          # Donate/Awareness/Action tabs
│   │   └── UrgentBanner.tsx        # Urgent alert banner
│   ├── data/crises/                # One JSON file per crisis
│   │   ├── palestine.json
│   │   ├── sudan.json
│   │   ├── congo.json
│   │   ├── myanmar.json
│   │   ├── yemen.json
│   │   └── uyghurs.json
│   ├── lib/
│   │   └── crises.ts               # Data loading utilities
│   └── types/
│       └── crisis.ts               # TypeScript interfaces
├── tailwind.config.ts
├── tsconfig.json
├── next.config.mjs
└── package.json
```

## Adding a New Crisis

1. Create a new file: `src/data/crises/[slug].json`
2. Follow the schema in `src/types/crisis.ts`
3. Include coordinates so the crisis appears on the homepage globe
4. Provide 3–5 vetted donation organizations
5. Write 4+ awareness and 4+ political action items
6. Write a detailed context section (500+ words, sourced)
7. Add key statistics with sources
8. The page auto-generates — no new route needed

## Content Principles

- **Cite everything** — link to UNHCR, WHO, ICRC, Reuters, AP, HRW, Amnesty
- **Never sensationalize** — the facts speak for themselves
- **Center affected voices** — prioritize local journalists and organizations
- **Acknowledge complexity** — no oversimplified good/evil narratives
- **Vet every organization** — use Charity Navigator, GiveWell, direct research
- **Stay current** — every page has a "Last Updated" timestamp

## Deployment

Push to GitHub and connect to [Vercel](https://vercel.com) for automatic deployments. The free tier is more than sufficient.

```bash
# Deploy via Vercel CLI
npx vercel
```

## SEO Checklist

- [x] Unique `<title>` and `<meta description>` per page
- [x] Open Graph + Twitter Card meta tags
- [x] Auto-generated sitemap.xml
- [x] robots.txt allowing full crawl
- [x] JSON-LD structured data on crisis pages
- [ ] Submit sitemap to Google Search Console
- [ ] Buy and connect custom domain
- [ ] Add OG images per crisis

## License

This project is open source. Built with the goal of helping people take action on humanitarian crises.

---

*Built by Arman Chaudhury. The most powerful thing you can do is start — and then keep going.*
