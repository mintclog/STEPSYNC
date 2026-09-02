interface ProgressHeaderProps {
  step: number;
  onLogoClick: () => void;
}

const LABELS = ["러닝 기록", "목표", "음악 취향", "결과"];

export function ProgressHeader({ step, onLogoClick }: ProgressHeaderProps) {
  return (
    <header className="border-b border-[#D9D9D2]">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onLogoClick}
          className="min-h-11 text-left text-lg font-black tracking-[-0.06em]"
          aria-label="STEPSYNC 처음 화면으로"
        >
          STEP<span className="bg-[#C7F000] px-1">SYNC</span>
        </button>
        {step > 0 ? (
          <div className="flex items-center gap-2" aria-label={`전체 4단계 중 ${step}단계`}>
            {LABELS.map((label, index) => (
              <span
                key={label}
                className={`h-1.5 w-8 rounded-full sm:w-12 ${index < step ? "bg-[#171717]" : "bg-[#D9D9D2]"}`}
                title={label}
              />
            ))}
          </div>
        ) : (
          <p className="hidden text-xs font-bold uppercase tracking-[0.2em] text-[#6C6C66] sm:block">Run in rhythm.</p>
        )}
      </div>
    </header>
  );
}
