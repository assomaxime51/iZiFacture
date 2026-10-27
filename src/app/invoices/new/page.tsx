import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import AppShell from "@/components/app-shell";
import InvoiceForm from "@/components/invoice-form";

export default function NewInvoicePage() {
  return <AppShell title="Nouvelle facture" eyebrow="Créez une facture claire et professionnelle." action={<Link href="/invoices" className="ds-button-secondary"><ArrowLeft size={15} />Retour aux factures</Link>}><InvoiceForm /></AppShell>;
}
