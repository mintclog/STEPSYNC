import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "개인정보 처리방침 | STEPSYNC",
  description: "STEPSYNC의 러닝 기록, 스크린샷, 음악 취향 처리와 OpenAI 전송 및 이용자 권리 안내",
};

const sections = [
  { id: "purpose", title: "1. 처리 목적과 항목" },
  { id: "retention", title: "2. 보유 기간과 파기" },
  { id: "providers", title: "3. 외부 처리와 국외 이전" },
  { id: "external", title: "4. 외부 링크와 앨범 이미지" },
  { id: "cookies", title: "5. 쿠키와 자동 수집" },
  { id: "rights", title: "6. 이용자 권리와 행사 방법" },
  { id: "security", title: "7. 안전성 확보 조치" },
  { id: "contact", title: "8. 개인정보 보호 담당자와 구제 방법" },
  { id: "changes", title: "9. 방침 변경" },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-[#D9D9D2]">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link href="/" className="inline-flex min-h-11 items-center text-lg font-black tracking-[-0.06em]" aria-label="STEPSYNC 처음 화면으로">
            STEP<span className="bg-[#C7F000] px-1">SYNC</span>
          </Link>
          <a href="#privacy-content" className="min-h-11 content-center text-sm font-bold underline underline-offset-4">본문으로 이동</a>
        </div>
      </header>

      <main id="privacy-content" className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-16">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-[#6C6C66]">Your data · Your pace</p>
        <h1 className="mt-4 text-3xl font-black tracking-[-0.045em] sm:text-5xl">개인정보 처리방침</h1>
        <p className="mt-5 max-w-3xl leading-7 text-[#4F4F49]">
          STEPSYNC 운영자 김진환은 러닝 음악 추천에 필요한 정보의 처리 방법을 안내합니다.
          이 방침은 현재 OpenAI 음악 검색을 사용하는 MVP를 기준으로 작성되었습니다.
        </p>
        <p className="mt-3 text-sm text-[#6C6C66]">작성일: <time dateTime="2026-10-12">2026년 10월 12일</time> · 공개 배포 전 검토본</p>

        <aside className="mt-8 rounded-[10px] border border-[#D9D9D2] bg-white p-5 text-sm leading-7" aria-labelledby="review-title">
          <h2 id="review-title" className="font-black">공개 배포 전 확인이 필요한 사항</h2>
          <p className="mt-2">
            호스팅 업체와 접속 로그 보관 기간, OpenAI 계약상 수탁 법인·처리 국가 및 국외 이전의 법적 근거는 아직 확정되지 않았습니다.
            운영자는 이를 확인하고 필요한 계약·고지·동의 절차를 마련한 후 시행일과 확정 내용을 게시합니다.
            이 페이지의 열람이나 분석 버튼 클릭 자체를 개인정보 처리 동의로 간주하지 않습니다.
          </p>
        </aside>

        <nav aria-label="개인정보 처리방침 목차" className="my-10 border-y border-[#D9D9D2] py-6">
          <h2 className="text-sm font-black">목차</h2>
          <ol className="mt-3 grid gap-x-6 sm:grid-cols-2">
            {sections.map((section) => (
              <li key={section.id}>
                <a href={`#${section.id}`} className="inline-flex min-h-11 items-center text-sm font-semibold underline underline-offset-4">{section.title}</a>
              </li>
            ))}
          </ol>
        </nav>

        <article className="space-y-10 text-sm leading-7 text-[#4F4F49] sm:text-base [&_h2]:mb-4 [&_h2]:text-xl [&_h2]:font-black [&_h2]:text-[#171717] [&_section]:scroll-mt-6 [&_a]:underline [&_a]:underline-offset-4">
          <section id="purpose" aria-labelledby="purpose-title">
            <h2 id="purpose-title">{sections[0].title}</h2>
            <dl className="divide-y divide-[#D9D9D2] border-y border-[#D9D9D2] [&>div]:py-4 [&_dt]:font-bold [&_dt]:text-[#171717] [&_dd]:mt-1">
              <div><dt>러닝 기록과 목표 — 추천에 필요한 입력</dt><dd>최근 3~5회 거리, 운동 시간 또는 평균 페이스, 목표 거리·목표 페이스를 처리합니다. 추천 리듬·예상 시간 계산과 음악 추천에 사용합니다.</dd></div>
              <div><dt>추가 러닝 정보 — 선택 입력</dt><dd>평균 케이던스 및 스크린샷에 보이는 구간별 거리·페이스를 처리해 리듬 계산을 보완합니다. 직접 입력 화면에서는 심박, 날짜, 상승 고도, 러닝 유형, 구간별 케이던스를 받지 않습니다.</dd></div>
              <div><dt>음악 취향 — 선택 입력</dt><dd>선호·제외 장르와 아티스트를 추천 개인화에 사용합니다. 입력하지 않고 건너뛸 수 있습니다. 이름·연락처·건강 정보 등 음악 취향과 무관한 정보는 입력하지 마세요.</dd></div>
              <div><dt>스크린샷 — 선택한 경우</dt><dd>이용자가 고른 이미지 파일과 파일명·형식·용량을 업로드 처리에 사용합니다. 분석 시 이미지 전체가 OpenAI에 전송됩니다. 이름, 프로필, 경로 지도, 심박·건강 정보 등 불필요한 내용을 먼저 자르거나 가려주세요. 앱이 특정 값을 추출하지 않더라도 이미지에 남아 있으면 외부 처리 대상에 포함됩니다.</dd></div>
              <div><dt>분석·추천 결과</dt><dd>추출 기록, 추천 BPM, 분석 요약, 곡 목록·추천 이유·적합도 점수를 결과 제공에 사용합니다. AI 추출값은 직접 확인·수정할 수 있습니다. 의료 진단이나 법적 효과를 갖는 자동화된 결정을 제공하지 않습니다.</dd></div>
              <div><dt>이메일 문의 — 문의한 경우</dt><dd>발신 이메일 주소와 문의 내용은 문의 답변, 권리행사 및 오류·추천 이의제기 처리에 사용합니다. 문의 해결에 필요하지 않은 개인정보는 보내지 마세요.</dd></div>
            </dl>
            <p className="mt-4">현재 회원가입, 실시간 위치 추적, 결제, 러닝 앱 계정 연동은 없습니다. 공개 운영 시 서비스 제공에 필요한 처리의 근거와, 건강 관련 민감정보가 포함되는 경우 별도 동의 필요 여부를 확인해 수집 전에 안내합니다.</p>
          </section>

          <section id="retention" aria-labelledby="retention-title">
            <h2 id="retention-title">{sections[1].title}</h2>
            <ul className="list-disc space-y-2 pl-5">
              <li>앱의 입력·결과는 현재 페이지의 브라우저 메모리에 유지됩니다. 새로고침, 페이지 종료 또는 처음부터 다시 시작하면 앱 상태가 초기화됩니다. 브라우저의 페이지 복원 기능에 따라 메모리가 남을 수 있습니다.</li>
              <li>서버는 요청 처리 중 데이터와 이미지를 메모리에서 사용하며, 앱 코드에는 사용자 기록·이미지·결과를 DB나 파일로 영구 저장하는 기능이 없습니다. 요청 종료 후 해당 데이터에 대한 참조가 해제되고 런타임의 메모리 관리에 따라 정리됩니다.</li>
              <li>OpenAI의 보관은 앱의 임시 처리와 별개이며 아래 항목을 따릅니다. 이미 전송된 내용을 새로고침으로 OpenAI에서 삭제할 수는 없습니다.</li>
              <li>이메일 문의는 처리 완료 후 불필요한 내용을 삭제합니다. 법령상 보관 의무 등이 발생하면 해당 항목·근거·기간을 별도로 안내합니다. 배포 인프라의 접속 로그 보관 기준도 확정 후 안내합니다.</li>
            </ul>
          </section>

          <section id="providers" aria-labelledby="providers-title">
            <h2 id="providers-title">{sections[2].title}</h2>
            <p>STEPSYNC는 광고·판매 목적으로 이용자의 입력을 제3자에게 제공하지 않습니다. 기능 처리를 위해 OpenAI API를 사용하며, 공개 운영 전 계약에 따른 처리위탁·국외 이전 사항을 확정합니다.</p>
            <dl className="mt-4 space-y-3 [&_dt]:font-bold [&_dt]:text-[#171717] [&_dd]:mt-1">
              <div><dt>처리 업체·연락 경로</dt><dd>OpenAI(API 제공업체). 계약상 수탁 법인은 확인 후 기재합니다. 관련 문의는 STEPSYNC 담당자 이메일로 보내주세요.</dd></div>
              <div><dt>전송 항목·목적</dt><dd>스크린샷 분석은 이미지 전체를 보내 러닝 수치를 추출합니다. 음악 검색은 계산된 BPM 범위, 목표 거리·페이스, 예상 시간, 에너지 안내와 음악 취향을 보냅니다. 음악 검색 요청에 최근 러닝 원본 목록은 보내지 않습니다. 웹 검색 도구가 검색어를 생성하므로 취향란에 개인정보를 입력하지 마세요.</dd></div>
              <div><dt>전송 시기·방법</dt><dd>이용자가 스크린샷 분석 또는 음악 추천을 요청할 때 서버에서 OpenAI API로 HTTPS 통신합니다.</dd></div>
              <div><dt>이전 국가·근거</dt><dd>현재 코드에는 OpenAI 데이터 처리 지역을 지정하는 설정이 없습니다. 실제 처리·보관 국가 및 이전 근거는 운영자의 계정 설정·계약을 확인한 뒤 확정하며, 국내에서만 처리된다고 보장하지 않습니다.</dd></div>
              <div><dt>외부 보관</dt><dd>API 요청은 응답 저장을 비활성화합니다(store: false). 이것이 모든 데이터의 즉시 삭제를 의미하지는 않습니다. OpenAI의 기본 오남용 모니터링 로그는 최대 30일 보관되며, 법률·보안상의 예외 또는 모델·기능별 보관이 적용될 수 있습니다. 계정의 별도 무보관 승인은 확인되지 않았습니다. <a href="https://developers.openai.com/api/docs/guides/your-data" target="_blank" rel="noopener noreferrer">OpenAI 데이터 처리 안내 (새 탭)</a>를 참고하세요.</dd></div>
              <div><dt>AI 학습</dt><dd>STEPSYNC 자체에는 입력을 모아 모델 학습에 사용하는 기능이 없습니다. OpenAI는 API 데이터를 기본적으로 모델 학습에 사용하지 않는다고 안내합니다. 운영자가 데이터 공유에 별도로 참여하는 경우에는 그 변경을 사전에 고지하고 필요한 절차를 마련합니다.</dd></div>
              <div><dt>전송을 원하지 않는 경우</dt><dd>스크린샷은 업로드하지 않고 직접 입력할 수 있습니다. 음악 추천도 OpenAI를 사용하므로 외부 전송을 원하지 않으면 추천을 요청하지 마세요. 목표 예상 시간 계산과 입력 화면은 이용할 수 있지만 AI 추출·음악 추천 결과는 제공되지 않습니다.</dd></div>
            </dl>
          </section>

          <section id="external" aria-labelledby="external-title">
            <h2 id="external-title">{sections[3].title}</h2>
            <p>Spotify, Apple Music, YouTube Music 및 BPM 출처는 외부 링크입니다. 클릭하면 해당 사이트에서 곡명·아티스트 검색 또는 출처 확인 요청이 발생하며, 그 사이트의 처리방침이 적용됩니다.</p>
            <p className="mt-3">실제 앨범 이미지를 표시할 때 브라우저는 이미지 제공 서버에 직접 접속합니다. 이미지 서버는 IP 주소·브라우저 정보 등 통신 정보를 받을 수 있습니다. 페이지 주소를 보내지 않는 설정을 사용하며, 이미지가 없거나 로드에 실패하면 외부 요청이 없는 대체 이미지를 표시합니다.</p>
          </section>

          <section id="cookies" aria-labelledby="cookies-title">
            <h2 id="cookies-title">{sections[4].title}</h2>
            <p>현재 앱에는 광고·방문 분석 도구와 자체 추적 쿠키가 없으며, 입력을 localStorage 또는 sessionStorage에 저장하지 않습니다. 통신 과정에서 서버·호스팅 업체는 IP 주소, 요청 시각·경로, 브라우저 정보 등 접속 정보를 처리할 수 있습니다. 아직 호스팅 업체를 선정하지 않았으므로 공개 배포 전에 실제 수집 항목·기간·처리 업체를 확정해 이 방침을 갱신합니다.</p>
          </section>

          <section id="rights" aria-labelledby="rights-title">
            <h2 id="rights-title">{sections[5].title}</h2>
            <p>이용자는 자신의 개인정보에 대한 열람, 정정·삭제, 처리정지 및 동의 철회를 요청할 수 있습니다. 입력값은 화면에서 수정할 수 있고, 처음부터 다시 시작하거나 페이지를 새로고침하면 앱의 입력·결과를 초기화할 수 있습니다.</p>
            <p className="mt-3">추가 요청은 아래 이메일에 요청 종류와 이용 시점 등 필요한 최소 정보만 보내주세요. 운영자는 필요한 범위에서 본인 확인 후 관련 법령에 따라 처리하고 결과를 안내합니다. 서버에 기록을 영구 보관하지 않아 이미 종료된 세션의 기록을 찾아 제공하기 어려울 수 있습니다. 외부 업체에 전송된 데이터는 해당 계약·정책과 적용 법령에 따라 확인하고 가능한 조치를 안내합니다.</p>
            <p className="mt-3">잘못 추출된 기록, 부정확한 BPM, 부적절한 추천도 이메일로 신고하거나 설명을 요청할 수 있습니다. 음악 취향은 생략할 수 있으나, 필수 러닝 기록·목표를 입력하지 않으면 추천을 제공할 수 없습니다. 현재 법정대리인 동의 기능이 없어 만 14세 미만을 대상으로 개인정보 입력 서비스를 제공하지 않습니다.</p>
          </section>

          <section id="security" aria-labelledby="security-title">
            <h2 id="security-title">{sections[6].title}</h2>
            <p>API 키는 서버 환경 변수로 관리하고 브라우저에 노출하지 않습니다. 업로드 파일의 형식·용량과 입력·응답을 검증하며 앱 코드에서 요청 원문·API 키를 오류 로그로 출력하지 않습니다. 공개 배포 시 HTTPS와 관리자 접근 제한을 적용하고 실제 배포 로그 및 외부 계약의 보호 조치를 확인합니다. 현재 로컬 개발 환경은 공개 운영 환경과 다릅니다.</p>
          </section>

          <section id="contact" aria-labelledby="contact-title">
            <h2 id="contact-title">{sections[7].title}</h2>
            <dl className="space-y-3 [&_dt]:font-bold [&_dt]:text-[#171717]">
              <div><dt>운영자 · 개인정보 보호 담당자</dt><dd>김진환</dd></div>
              <div><dt>문의 이메일</dt><dd><a href="mailto:wlsghks1217@naver.com" className="break-all">wlsghks1217@naver.com</a></dd></div>
            </dl>
            <p className="mt-4">서비스 문의 외에 개인정보 침해 상담·신고 또는 분쟁조정을 원하면 다음 기관을 이용할 수 있습니다.</p>
            <ul className="mt-2 list-disc space-y-2 pl-5">
              <li><a href="https://privacy.kisa.or.kr/" target="_blank" rel="noopener noreferrer">KISA 개인정보침해 신고센터 (새 탭)</a></li>
              <li><a href="https://www.kopico.go.kr/" target="_blank" rel="noopener noreferrer">개인정보 분쟁조정위원회 (새 탭)</a></li>
            </ul>
          </section>

          <section id="changes" aria-labelledby="changes-title">
            <h2 id="changes-title">{sections[8].title}</h2>
            <p>이 문서는 2026년 10월 12일 작성한 최초 공개 준비본입니다. 정식 시행일은 공개 운영 조건 확정 후 게시합니다. 처리 항목·목적·보관·수탁자 등 변경 시 변경 내용과 시행일을 사이트에 안내하며, 이용자 권리에 중대한 영향을 주는 변경은 적용 전 또는 즉시 고지하고 필요한 동의를 별도로 받습니다. 이전 시행본은 이 페이지에서 확인할 수 있도록 보관합니다.</p>
          </section>
        </article>

        <aside className="mt-12 border-t border-[#D9D9D2] pt-6 text-xs leading-6 text-[#6C6C66]" aria-labelledby="sources-title">
          <h2 id="sources-title" className="font-bold text-[#171717]">작성 참고 자료</h2>
          <ul className="mt-2 space-y-2 [&_a]:underline [&_a]:underline-offset-4">
            <li><a href="https://www.privacy.go.kr/front/bbs/bbsView.do?bbsNo=BBSMSTR_000000000049&amp;bbscttNo=20885" target="_blank" rel="noopener noreferrer">개인정보보호위원회 · 2026 개인정보 처리방침 작성지침 (새 탭)</a></li>
            <li><a href="https://www.law.go.kr/lsLinkCommonInfo.do?lsJoLnkSeq=1029335711" target="_blank" rel="noopener noreferrer">개인정보 보호법 제30조 (새 탭)</a></li>
            <li><a href="https://law.go.kr/LSW/lsLinkCommonInfo.do?lsJoLnkSeq=1029332501" target="_blank" rel="noopener noreferrer">개인정보 보호법 제28조의8 · 국외 이전 고지 항목 (새 탭)</a></li>
          </ul>
        </aside>
      </main>
      <SiteFooter />
    </div>
  );
}
