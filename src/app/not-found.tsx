import Link from "next/link";

export default function NotFound() {
  return (
    <div className="text-center py-24 animate-fade-up">
      <h1 className="font-display text-[clamp(60px,15vw,120px)] text-text-bright tracking-[0.05em] leading-none mb-4">
        404
      </h1>
      <p className="font-serif italic text-lg text-text-muted mb-8">
        This page doesn&apos;t exist — but the crises do.
      </p>
      <Link
        href="/"
        className="inline-block font-sans text-sm font-semibold text-crisis-red tracking-wider py-3 px-8 border-[1.5px] border-crisis-red rounded transition-all duration-200 hover:bg-crisis-red hover:text-text-bright"
      >
        Back to All Crises →
      </Link>
    </div>
  );
}
