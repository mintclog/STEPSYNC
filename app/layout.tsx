import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "STEPSYNC — Music for your pace.",
  description: "최근 러닝과 이번 목표를 분석해 페이스에 어울리는 음악을 찾습니다.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
