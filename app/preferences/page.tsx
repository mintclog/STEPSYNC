import type { Metadata } from "next";
import { RunWizard } from "@/components/run-wizard";
import { PreferencesPage } from "@/components/wizard-pages";

export const metadata: Metadata = { title: "음악 취향 | STEPSYNC" };

export default function Page() {
  return <RunWizard><PreferencesPage /></RunWizard>;
}
