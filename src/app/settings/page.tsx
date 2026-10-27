import AppShell from "@/components/app-shell";
import { SettingsPage } from "@/components/settings-pages";

export default function SettingsRoute() {
  return <AppShell title="Paramètres" eyebrow="Configurez votre entreprise et vos préférences."><SettingsPage /></AppShell>;
}
