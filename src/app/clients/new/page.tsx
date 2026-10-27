import Link from "next/link";
import { ArrowLeft } from "@/components/icons";
import AppShell from "@/components/app-shell";
import ClientForm from "@/components/client-form";

export default function NewClientPage() {
  return (
    <AppShell
      title="Nouveau client"
      eyebrow="Ajoutez un nouveau contact professionnel à votre répertoire."
      action={
        <Link href="/clients" className="ds-button-secondary">
          <ArrowLeft size={15} />
          Retour aux clients
        </Link>
      }
    >
      <ClientForm />
    </AppShell>
  );
}
