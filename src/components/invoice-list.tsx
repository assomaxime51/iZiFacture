"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { FilePlus2, Search } from "@/components/icons";
import { formatXof, statusStyles, type InvoiceStatus } from "@/data/app-data";
import { fetchFactures } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";

const filters: Array<"Tous" | InvoiceStatus> = ["Tous", "Brouillon", "Envoyee", "Payee", "En retard"];

interface FormattedInvoice {
  number: string;
  client: string;
  date: string;
  due: string;
  status: InvoiceStatus;
  amount: number;
}

export default function InvoiceList() {
  const { entreprise } = useAuth();
  const [filter, setFilter] = useState<(typeof filters)[number]>("Tous");
  const [query, setQuery] = useState("");
  const [invoices, setInvoices] = useState<FormattedInvoice[]>([]);
  const [loading, setLoading] = useState(true);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const data = await fetchFactures(undefined, undefined, entreprise?.id);
      if (data && Array.isArray(data) && data.length > 0) {
        const formatted: FormattedInvoice[] = data.map((item: any) => ({
          number: item.number,
          client: item.clients?.name || "Client inconnu",
          date: item.date,
          due: item.due_date,
          status: (item.status as InvoiceStatus) || "Brouillon",
          amount: Number(item.total_amount) || Number(item.amount) || 0,
        }));
        setInvoices(formatted);
      } else {
        // Si la base est encore vide, afficher les données exemples
        setInvoices([]);
      }
    } catch (err) {
      console.error("Erreur chargement factures:", err);
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, [entreprise?.id]);

  const filtered = useMemo(
    () =>
      invoices.filter(
        (invoice) =>
          (filter === "Tous" || invoice.status === filter) &&
          invoice.client.toLowerCase().includes(query.toLowerCase())
      ),
    [filter, query, invoices]
  );

  return (
    <section className="ds-card overflow-hidden">
      <div className="flex flex-col gap-4 border-b border-line p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="font-display text-lg font-bold">Toutes les factures</h2>
          <p className="mt-1 text-xs text-muted">
            {loading ? "Chargement..." : `${filtered.length} facture${filtered.length > 1 ? "s" : ""} dans votre espace`}
          </p>
        </div>
        <Link href="/invoices/new" className="ds-button-primary">
          <FilePlus2 size={16} />
          Nouvelle facture
        </Link>
      </div>

      <div className="flex flex-col gap-3 border-b border-line p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex max-w-full gap-1 overflow-x-auto pb-1">
          {filters.map((item) => (
            <button
              key={item}
              onClick={() => setFilter(item)}
              className={`whitespace-nowrap rounded-control px-3 py-2 text-xs font-bold transition-motion ${
                filter === item ? "bg-[#e1f3e6] text-sage" : "text-muted hover:bg-[#f3f7f2] hover:text-ink"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
        <label className="relative block w-full lg:max-w-xs">
          <Search size={16} className="pointer-events-none absolute left-3 top-3 text-muted" />
          <input
            className="ds-input w-full pl-9"
            placeholder="Rechercher un client"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px] border-collapse text-left">
          <thead>
            <tr className="border-b border-line text-[10px] font-bold uppercase tracking-[.1em] text-muted">
              <th className="px-6 py-3">Numéro</th>
              <th>Client</th>
              <th>Date</th>
              <th>Échéance</th>
              <th>Statut</th>
              <th className="px-6 py-3 text-right">Montant TTC</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((invoice) => (
              <tr key={invoice.number} className="border-b border-[#f0f3ef] last:border-0 hover:bg-[#fbfcfa]">
                <td className="px-6 py-4">
                  <Link href={`/invoices/${encodeURIComponent(invoice.number)}`} className="text-xs font-bold text-sage hover:underline">
                    {invoice.number}
                  </Link>
                </td>
                <td className="py-4 text-xs font-semibold">{invoice.client}</td>
                <td className="py-4 text-xs text-muted">{invoice.date}</td>
                <td className="py-4 text-xs text-muted">{invoice.due}</td>
                <td className="py-4">
                  <span className={`ds-status ${statusStyles[invoice.status] || statusStyles["Brouillon"]}`}>
                    {invoice.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right text-xs font-bold">{formatXof(invoice.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="p-12 text-center text-sm text-muted">
            {loading ? "Chargement des factures..." : "Aucune facture ne correspond à votre recherche."}
          </div>
        )}
      </div>
    </section>
  );
}
