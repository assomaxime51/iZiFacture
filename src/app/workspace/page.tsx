import AppShell from "@/components/app-shell";
import { WorkspacePage } from "@/components/settings-pages";

export default function WorkspaceRoute() {
  return <AppShell title="Espace de travail" eyebrow="Choisissez l’espace que vous souhaitez gérer."><WorkspacePage /></AppShell>;
}
