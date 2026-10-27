"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/app-shell";
import { fetchClients, fetchFactures } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";
import { formatXof, statusStyles, type InvoiceStatus } from "@/data/app-data";
import { FilePlus2, FileText, Users } from "@/components/icons";

type Invoice = {
  id: string;
  number: string;
  date: string;
  due_date: string;
  total_amount: number | string;
  status: InvoiceStatus;
  clients?: { name?: string | null } | null;
};

export default function DashboardShell() {
  const { entreprise } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clientCount, setClientCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [factures, clients] = await Promise.all([
          fetchFactures(undefined, undefined, entreprise?.id),
          fetchClients(entreprise?.id),
        ]);
        setInvoices(Array.isArray(factures) ? factures : []);
        setClientCount(Array.isArray(clients) ? clients.length : 0);
      } catch (error) {
        console.error("Erreur lors du chargement du tableau de bord:", error);
        setInvoices([]);
        setClientCount(0);
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [entreprise?.id]);

  const metrics = useMemo(() => {
    const total = invoices.reduce((sum, invoice) => sum + Number(invoice.total_amount || 0), 0);
    const paid = invoices
      .filter((invoice) => invoice.status === "Payee")
      .reduce((sum, invoice) => sum + Number(invoice.total_amount || 0), 0);
    const pending = invoices
      .filter((invoice) => invoice.status === "Envoyee")
      .reduce((sum, invoice) => sum + Number(invoice.total_amount || 0), 0);
    const overdue = invoices
      .filter((invoice) => invoice.status === "En retard")
      .reduce((sum, invoice) => sum + Number(invoice.total_amount || 0), 0);
    return { total, paid, pending, overdue };
  }, [invoices]);

  const cards = [
    { label: "Total facturé", value: metrics.total },
    { label: "Total encaissé", value: metrics.paid },
    { label: "En attente", value: metrics.pending },
    { label: "En retard", value: metrics.overdue },
  ];

  return (
    <AppShell
      title="Vue d'ensemble"
      eyebrow={entreprise?.name ? `Bienvenue dans ${entreprise.name}.` : "Configurez votre entreprise pour commencer."}
      action={<Link href="/invoices/new" className="ds-button-primary"><FilePlus2 size={16} />Nouvelle facture</Link>}
    >
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <article key={card.label} className="ds-card p-5">
            <p className="text-xs font-semibold text-muted">{card.label}</p>
            <strong className="mt-3 block font-display text-2xl font-extrabold">{loading ? "…" : formatXof(card.value)}</strong>
          </article>
        ))}
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_.8fr]">
        <article className="ds-card p-6">
          <h2 className="font-display text-lg font-bold">Dernières factures</h2>
          <p className="mt-1 text-xs text-muted">Vos factures créées apparaîtront ici.</p>
          {invoices.length === 0 && !loading ? (
            <div className="py-14 text-center text-sm text-muted">Aucune facture pour le moment.</div>
          ) : (
            <div className="mt-5 space-y-3">
              {invoices.slice(0, 5).map((invoice) => (
                <Link key={invoice.id} href={`/invoices/${encodeURIComponent(invoice.number)}`} className="flex items-center justify-between rounded-control border border-line p-3 hover:bg-[#f7f9f6]">
                  <span><strong className="block text-sm">{invoice.number}</strong><span className="text-xs text-muted">{invoice.clients?.name || "Client"}</span></span>
                  <span className="text-right"><strong className="block text-sm">{formatXof(Number(invoice.total_amount || 0))}</strong><span className={`ds-status mt-1 ${statusStyles[invoice.status] || statusStyles.Brouillon}`}>{invoice.status}</span></span>
                </Link>
              ))}
            </div>
          )}
        </article>

        <article className="ds-card p-6">
          <h2 className="font-display text-lg font-bold">Votre espace</h2>
          <div className="mt-6 space-y-4 text-sm">
            <div className="flex items-center justify-between"><span className="flex items-center gap-2 text-muted"><Users size={16} />Clients</span><strong>{loading ? "…" : clientCount}</strong></div>
            <div className="flex items-center justify-between"><span className="flex items-center gap-2 text-muted"><FileText size={16} />Factures</span><strong>{loading ? "…" : invoices.length}</strong></div>
          </div>
          {invoices.length === 0 && !loading && <p className="mt-8 rounded-control bg-[#f7f9f6] p-4 text-xs text-muted">Commencez par ajouter un client, puis créez votre première facture.</p>}
        </article>
      </section>
    </AppShell>
  );
}
