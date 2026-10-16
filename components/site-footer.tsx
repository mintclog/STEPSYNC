export function SiteFooter() {
  return (
    <footer className="border-t border-[#D9D9D2] px-4 py-6 text-center text-xs text-[#6C6C66]">
      <p>STEPSYNC는 음악을 재생하지 않으며, 추천 적합도는 과학적·의학적 효과를 보장하지 않습니다.</p>
      <a
        href="/privacy"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 inline-flex min-h-11 items-center px-3 text-sm font-bold text-[#171717] underline underline-offset-4 hover:decoration-[#87A600]"
      >
        개인정보 처리방침<span className="sr-only"> (새 탭에서 열림)</span>
      </a>
    </footer>
  );
}
