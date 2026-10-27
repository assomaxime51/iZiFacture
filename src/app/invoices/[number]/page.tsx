import AppShell from "@/components/app-shell";
import InvoiceDetail from "@/components/invoice-detail";

export const dynamic = "force-dynamic";

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ number: string }>;
}) {
  const { number } = await params;
  return (
    <AppShell
      title="Détail de la facture"
      eyebrow="Consultez les informations et l'historique de votre facture."
    >
      <InvoiceDetail number={decodeURIComponent(number)} />
    </AppShell>
  );
}
