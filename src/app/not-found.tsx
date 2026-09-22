import Link from "next/link";

export default function NotFound() {
  return (
    <div className="text-center py-24">
      <h1 className="font-sans font-bold text-6xl text-text-bright tracking-normal leading-none mb-4">
        404
      </h1>
      <p className="font-sans text-lg text-text-muted mb-8">
        This page does not exist.
      </p>
      <Link
        href="/"
        className="inline-block font-sans text-sm font-semibold text-crisis-red tracking-normal py-3 px-8 border-[1.5px] border-crisis-red rounded transition-all duration-200 hover:bg-crisis-red hover:text-text-bright"
      >
        Back to All Crises →
      </Link>
    </div>
  );
}
