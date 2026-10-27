import AppShell from "@/components/app-shell";
import { ProfilePage } from "@/components/settings-pages";

export default function ProfileRoute() {
  return <AppShell title="Mon profil" eyebrow="Gérez votre compte et vos informations personnelles."><ProfilePage /></AppShell>;
}
