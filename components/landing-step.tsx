import Link from "next/link";

export function LandingStep() {
  return (
    <section className="mx-auto grid min-h-[calc(100vh-77px)] max-w-7xl items-center gap-12 px-4 py-14 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:px-8">
      <div>
        <p className="mb-5 text-xs font-black uppercase tracking-[0.24em]">Running science, presented like music.</p>
        <h1 className="max-w-4xl text-6xl font-black leading-[0.9] tracking-[-0.07em] sm:text-8xl lg:text-[7.5rem]">
          Music for<br />your <span className="bg-[#C7F000] px-2">pace.</span>
        </h1>
        <p className="mt-8 max-w-xl text-lg font-semibold leading-8 text-[#4F4F49] sm:text-xl">
          최근 러닝을 분석해 이번 목표 거리와 목표 페이스에 어울리는 음악을 찾아드립니다.
        </p>
        <Link
          href="/runs"
          className="mt-9 inline-flex min-h-16 w-full items-center justify-center gap-2 rounded-[10px] bg-[#171717] px-8 text-lg font-black text-white transition-[filter] hover:brightness-90 sm:w-auto"
        >
          내 러닝 음악 찾기 <span aria-hidden="true">→</span>
        </Link>
      </div>
      <div className="border-y-2 border-[#171717] py-8 lg:border-y-0 lg:border-l-2 lg:py-16 lg:pl-12">
        <div className="flex items-end justify-between gap-4 border-b border-[#A8A8A0] pb-7">
          <span className="text-xs font-black uppercase tracking-[0.18em]">Target pace</span>
          <span><strong className="number-face text-5xl font-black sm:text-6xl">5&apos;30</strong> <small className="font-bold">/km</small></span>
        </div>
        <div className="flex items-end justify-between gap-4 border-b border-[#A8A8A0] py-7">
          <span className="text-xs font-black uppercase tracking-[0.18em]">Distance</span>
          <span><strong className="number-face text-5xl font-black sm:text-6xl">10</strong> <small className="font-bold">km</small></span>
        </div>
        <div className="flex items-end justify-between gap-4 pt-7">
          <span className="text-xs font-black uppercase tracking-[0.18em]">Rhythm</span>
          <span><strong className="number-face text-5xl font-black text-[#87A600] sm:text-6xl">170</strong> <small className="font-bold">BPM</small></span>
        </div>
        <div className="mt-10 flex justify-between" aria-hidden="true">
          {[0, 1, 2, 3, 4, 5].map((beat) => <span key={beat} className="h-12 w-px bg-[#171717]" />)}
        </div>
      </div>
    </section>
  );
}
