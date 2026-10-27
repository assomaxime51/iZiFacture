import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import AppShell from "@/components/app-shell";
import InvoiceForm from "@/components/invoice-form";
export default async function EditInvoicePage({ params }: { params: Promise<{ number: string }> }) {
  const { number } = await params;
  return <AppShell title={`Modifier ${number}`} eyebrow="Mettez à jour les lignes et les conditions de paiement." action={<Link href={`/invoices/${number}`} className="ds-button-secondary"><ArrowLeft size={15} />Retour au détail</Link>}><InvoiceForm /></AppShell>;
}
