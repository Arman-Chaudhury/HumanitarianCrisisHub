import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Resources",
  description:
    "Universal humanitarian resources, charity vetting tools, and international humanitarian law basics to help you take informed action.",
};

const UNIVERSAL_ORGS = [
  {
    name: "UNHCR — The UN Refugee Agency",
    url: "https://www.unhcr.org",
    desc: "Protects refugees and displaced communities worldwide. Provides shelter, legal assistance, and resettlement support.",
  },
  {
    name: "Doctors Without Borders (MSF)",
    url: "https://www.msf.org",
    desc: "Independent medical humanitarian organization providing emergency aid in conflict zones, epidemics, and natural disasters.",
  },
  {
    name: "International Committee of the Red Cross",
    url: "https://www.icrc.org",
    desc: "Protects civilians in armed conflict. Visits detainees, reunites families, and promotes international humanitarian law.",
  },
  {
    name: "UNICEF",
    url: "https://www.unicef.org",
    desc: "Works in over 190 countries to protect children's rights, provide healthcare, nutrition, education, and emergency relief.",
  },
  {
    name: "World Food Programme",
    url: "https://www.wfp.org",
    desc: "The world's largest humanitarian organization addressing hunger. Provides food assistance in emergencies and supports food systems.",
  },
  {
    name: "Human Rights Watch",
    url: "https://www.hrw.org",
    desc: "Investigates and reports on human rights abuses worldwide. Provides evidence-based advocacy to governments and institutions.",
  },
  {
    name: "Amnesty International",
    url: "https://www.amnesty.org",
    desc: "Global movement campaigning for human rights. Documents abuses, mobilizes public pressure, and advocates for justice.",
  },
  {
    name: "International Rescue Committee",
    url: "https://www.rescue.org",
    desc: "Responds to the world's worst humanitarian crises with healthcare, education, economic wellbeing, and safety programs.",
  },
];

const VETTING_TOOLS = [
  { name: "Charity Navigator", url: "https://www.charitynavigator.org", desc: "Rates charities on financial health, accountability, and transparency." },
  { name: "GiveWell", url: "https://www.givewell.org", desc: "In-depth research to find outstanding giving opportunities based on impact." },
  { name: "GuideStar (Candid)", url: "https://www.guidestar.org", desc: "Nonprofit data including financials, leadership, and mission information." },
  { name: "CharityWatch", url: "https://www.charitywatch.org", desc: "Independent watchdog grading charities on efficiency and governance." },
];

export default function ResourcesPage() {
  return (
    <>
      <header className="mb-12 animate-fade-up">
        <h1 className="font-display text-[clamp(48px,10vw,90px)] text-text-bright tracking-[0.05em] leading-[0.92] mb-3">
          RESOURCES
        </h1>
        <p className="font-serif italic text-base text-text-muted">
          Tools and organizations that work across every crisis
        </p>
      </header>

      {/* Universal Organizations */}
      <section className="mb-12 animate-fade-up-1">
        <h2 className="font-display text-3xl text-text-muted tracking-[0.08em] mb-6">
          UNIVERSAL ORGANIZATIONS
        </h2>
        <div className="flex flex-col gap-0">
          {UNIVERSAL_ORGS.map((org, i) => (
            <a
              key={org.name}
              href={org.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`group flex flex-col sm:flex-row items-start sm:items-center justify-between py-6 px-1 text-inherit no-underline border-b border-border transition-all duration-300 hover:pl-4 hover:bg-gradient-to-r hover:from-[rgba(255,255,255,0.03)] hover:to-transparent ${
                i === 0 ? "border-t border-border" : ""
              }`}
            >
              <div>
                <h3 className="font-serif text-xl text-text-bright mb-1">{org.name}</h3>
                <p className="font-sans text-sm text-text-muted leading-relaxed max-w-[520px]">
                  {org.desc}
                </p>
              </div>
              <span className="mt-3 sm:mt-0 font-sans text-xs font-semibold text-crisis-red tracking-wider whitespace-nowrap py-2.5 px-5 border-[1.5px] border-crisis-red rounded transition-all duration-200 group-hover:bg-crisis-red group-hover:text-text-bright">
                Visit →
              </span>
            </a>
          ))}
        </div>
      </section>

      {/* How to Vet a Charity */}
      <section className="mb-12 pt-9 border-t-2 border-text-bright animate-fade-up-2">
        <h2 className="font-display text-3xl text-text-muted tracking-[0.08em] mb-5">
          HOW TO VET A CHARITY
        </h2>
        <div className="max-w-[680px] space-y-4 mb-8">
          <p className="font-sans text-base font-light leading-[1.8] text-text-body">
            Before donating to any organization, take a few minutes to verify
            it. Look for transparent financial reporting, a clear mission, and
            evidence of on-the-ground impact. Be cautious of organizations that
            spend a disproportionate share on overhead or marketing rather than
            programs.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {VETTING_TOOLS.map((tool) => (
            <a
              key={tool.name}
              href={tool.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-5 border border-border rounded-lg bg-bg-card transition-all duration-300 hover:bg-bg-card-hover hover:border-border-hard"
            >
              <h3 className="font-serif text-lg text-text-bright mb-1.5">{tool.name}</h3>
              <p className="font-sans text-sm text-text-muted leading-relaxed">{tool.desc}</p>
            </a>
          ))}
        </div>
      </section>

      {/* IHL Basics */}
      <section className="mb-8 animate-fade-up-3">
        <h2 className="font-display text-3xl text-text-muted tracking-[0.08em] mb-5">
          INTERNATIONAL HUMANITARIAN LAW
        </h2>
        <div className="max-w-[680px] space-y-4">
          <p className="font-sans text-base font-light leading-[1.8] text-text-body">
            International Humanitarian Law (IHL), also known as the laws of war,
            is a set of rules that seeks to limit the effects of armed conflict.
            It protects people who are not participating in hostilities and
            restricts the means and methods of warfare. The Geneva Conventions of
            1949 and their Additional Protocols are the core treaties of IHL.
          </p>
          <p className="font-sans text-base font-light leading-[1.8] text-text-body">
            Key principles include distinction (between civilians and
            combatants), proportionality (force must not be excessive relative to
            military advantage), precaution (all feasible steps to minimize
            civilian harm), and the prohibition of collective punishment. When
            these principles are violated, it may constitute a war crime.
          </p>
          <p className="font-sans text-sm text-text-muted mt-6">
            Learn more:{" "}
            <a
              href="https://www.icrc.org/en/war-and-law"
              target="_blank"
              rel="noopener noreferrer"
              className="text-crisis-red hover:underline"
            >
              ICRC — War and Law
            </a>
          </p>
        </div>
      </section>
    </>
  );
}
