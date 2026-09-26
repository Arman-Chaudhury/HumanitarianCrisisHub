import type { Crisis } from "@/types/crisis";

interface CrisisPhotosProps {
  crisis: Crisis;
  compact?: boolean;
}

export default function CrisisPhotos({
  crisis,
  compact = false,
}: CrisisPhotosProps) {
  if (!crisis.photos?.length) return null;

  return (
    <div
      className={
        compact
          ? "grid grid-cols-1 gap-4"
          : "grid items-start gap-6 md:grid-cols-2"
      }
    >
      {crisis.photos.map((src, index) => {
        const credit = crisis.photoCredits?.[index];
        return (
          <figure
            key={src}
            className={!compact && index === 0 ? "md:col-span-2" : ""}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={`${crisis.name}: documentary photograph ${index + 1}${credit ? `, credited to ${credit.artist}` : ""}`}
              loading={index === 0 && !compact ? "eager" : "lazy"}
              className={`w-full object-cover ${compact ? "aspect-[16/9]" : index === 0 ? "aspect-[4/3] md:aspect-[2/1]" : "aspect-[4/3]"}`}
            />
            {credit && (
              <figcaption className="mt-2 text-xs leading-relaxed text-gray-600">
                <a
                  href={credit.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2 hover:text-gray-900"
                >
                  {credit.artist}
                </a>
                {" · "}
                {credit.license}
              </figcaption>
            )}
          </figure>
        );
      })}
    </div>
  );
}
