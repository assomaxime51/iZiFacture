import Link from "next/link";
import { UserPlus } from "@/components/icons";
import AppShell from "@/components/app-shell";
import ClientList from "@/components/client-list";

export default function ClientsPage() {
  return <AppShell title="Clients" eyebrow="Centralisez vos contacts et votre historique commercial." action={<Link href="/clients/new" className="ds-button-primary"><UserPlus size={16} />Ajouter un client</Link>}><ClientList /></AppShell>;
}
