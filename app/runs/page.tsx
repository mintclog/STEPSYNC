import type { Metadata } from "next";
import { RunWizard } from "@/components/run-wizard";
import { RunsPage } from "@/components/wizard-pages";

export const metadata: Metadata = { title: "러닝 기록 | STEPSYNC" };

export default function Page() {
  return <RunWizard><RunsPage /></RunWizard>;
}
