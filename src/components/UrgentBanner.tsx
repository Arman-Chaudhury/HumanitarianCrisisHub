interface UrgentBannerProps {
  message: string;
}

export default function UrgentBanner({ message }: UrgentBannerProps) {
  return (
    <div className="relative mb-11 py-[18px] px-6 overflow-hidden bg-crisis-red-dim border-l-4 border-crisis-red rounded-r-lg animate-fade-up-1">
      {/* Scanline effect */}
      <div
        className="absolute inset-0 animate-scanline"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(230,57,70,0.06), transparent)",
        }}
      />
      <p className="relative z-10 font-sans text-sm leading-relaxed text-text-body">
        <strong className="text-crisis-red font-semibold">Urgent:</strong>{" "}
        {message}
      </p>
    </div>
  );
}
