import AppShell from "@/components/app-shell";
import InvoiceList from "@/components/invoice-list";

export default function InvoicesPage() {
  return <AppShell title="Factures" eyebrow="Créez, suivez et gérez vos factures."><InvoiceList /></AppShell>;
}
