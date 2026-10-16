import type { Metadata } from "next";
import { RunWizard } from "@/components/run-wizard";
import { ResultsPage } from "@/components/wizard-pages";

export const metadata: Metadata = { title: "추천 결과 | STEPSYNC" };

export default function Page() {
  return <RunWizard><ResultsPage /></RunWizard>;
}
