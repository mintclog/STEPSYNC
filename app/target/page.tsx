import type { Metadata } from "next";
import { RunWizard } from "@/components/run-wizard";
import { TargetPage } from "@/components/wizard-pages";

export const metadata: Metadata = { title: "러닝 목표 | STEPSYNC" };

export default function Page() {
  return <RunWizard><TargetPage /></RunWizard>;
}
