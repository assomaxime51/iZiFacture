import AppShell from "@/components/app-shell";
import { ReportsPage } from "@/components/settings-pages";

export default function ReportsRoute() {
  return <AppShell title="Rapports" eyebrow="Comprenez votre activité et suivez vos performances."><ReportsPage /></AppShell>;
}
