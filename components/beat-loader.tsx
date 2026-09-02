interface BeatLoaderProps {
  label: string;
}

export function BeatLoader({ label }: BeatLoaderProps) {
  return (
    <div className="flex min-h-56 flex-col items-center justify-center gap-6 text-center" role="status" aria-live="polite">
      <div className="flex items-center gap-5" aria-hidden="true">
        {[0, 1, 2, 3].map((beat) => (
          <span key={beat} className="beat-dot block size-4 rounded-full bg-[#C7F000]" />
        ))}
      </div>
      <p className="max-w-sm text-lg font-semibold">{label}</p>
    </div>
  );
}
