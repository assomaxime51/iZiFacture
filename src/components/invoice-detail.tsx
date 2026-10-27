"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Download, Pencil, Send, Trash2 } from "lucide-react";
import { formatXof, statusStyles, type InvoiceStatus } from "@/data/app-data";
import { useAuth } from "@/contexts/auth-context";
import { fetchFacture, updateFacture, deleteFacture } from "@/lib/api";

interface InvoiceData {
  id?: string;
  number: string;
  client: string;
  client_email?: string;
  client_phone?: string;
  client_address?: string;
  date: string;
  due: string;
  status: InvoiceStatus;
  notes?: string;
  lines: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
  }>;
}

export default function InvoiceDetail({ number }: { number: string }) {
  const router = useRouter();
  const { entreprise } = useAuth();
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [status, setStatus] = useState<InvoiceStatus>("Brouillon");
  const [loading, setLoading] = useState(true);
  const [deleted, setDeleted] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await fetchFacture(number);
        if (data) {
          const lines = (data.lignes_facture || []).map((l: any) => ({
            description: l.description,
            quantity: Number(l.quantity) || 1,
            unitPrice: Number(l.unit_price) || 0,
          }));

          const inv: InvoiceData = {
            id: data.id,
            number: data.number,
            client: data.clients?.name || "Client",
            client_email: data.clients?.email,
            client_phone: data.clients?.phone,
            client_address: data.clients?.address,
            date: data.date,
            due: data.due_date,
            status: (data.status as InvoiceStatus) || "Brouillon",
            notes: data.notes,
            lines,
          };
          setInvoice(inv);
          setStatus(inv.status);
          return;
        }
      } catch (err) {
        console.warn("Facture non trouvée en base, recherche dans les exemples:", err);
      }

      // Fallback dans les données d'exemple
      setInvoice(null);
      setLoading(false);
    }

    load().finally(() => setLoading(false));
  }, [number]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleStatusChange = async (newStatus: InvoiceStatus) => {
    setStatus(newStatus);
    if (invoice?.id) {
      try {
        await updateFacture(invoice.id, { status: newStatus });
        showToast(`Statut mis à jour : ${newStatus}`);
      } catch (err) {
        console.error("Erreur mise à jour statut:", err);
        showToast("Erreur lors de la mise à jour du statut.");
      }
    } else {
      showToast(`Statut changé en ${newStatus} (mode démo)`);
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Supprimer définitivement la facture ${invoice?.number} ?`)) {
      if (invoice?.id) {
        try {
          await deleteFacture(invoice.id);
          setDeleted(true);
        } catch (err) {
          console.error("Erreur suppression facture:", err);
          alert("Erreur lors de la suppression.");
        }
      } else {
        setDeleted(true);
      }
    }
  };

  if (loading) {
    return (
      <div className="ds-card p-12 text-center text-muted">
        Chargement de la facture...
      </div>
    );
  }

  if (deleted) {
    return (
      <div className="ds-card p-10 text-center animate-rise">
        <Trash2 className="mx-auto text-[#b25247]" size={28} />
        <h2 className="mt-4 font-display text-xl font-bold">Facture supprimée</h2>
        <p className="mt-2 text-sm text-muted">Cette facture a été retirée de votre espace.</p>
        <Link href="/invoices" className="ds-button-primary mt-6 inline-flex">
          Retour aux factures
        </Link>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="ds-card p-10 text-center">
        <h2 className="font-display text-xl font-bold">Facture introuvable</h2>
        <Link href="/invoices" className="ds-button-primary mt-6 inline-flex">
          Retour aux factures
        </Link>
      </div>
    );
  }

  const subtotal = invoice.lines.reduce((total, line) => total + line.quantity * line.unitPrice, 0);
  const tax = Math.round(subtotal * 0.18);
  const total = subtotal + tax;

  return (
    <div className="space-y-6">
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 rounded-xl bg-[#17221d] px-4 py-3 text-xs font-bold text-white shadow-xl animate-rise">
          <Check size={16} className="text-[#b7d8bf]" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/invoices" className="ds-button-secondary w-full sm:w-auto">
          <ArrowLeft size={15} />
          Retour aux factures
        </Link>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <button
            onClick={() => window.print()}
            className="ds-button-secondary flex-1 sm:flex-none"
          >
            <Download size={15} />
            Imprimer / PDF
          </button>
          <button
            onClick={() => handleStatusChange("Envoyee")}
            className="ds-button-secondary flex-1 sm:flex-none"
          >
            <Send size={15} />
            Marquer envoyée
          </button>
          <button
            onClick={handleDelete}
            className="ds-button-secondary flex-1 sm:flex-none text-[#b25247] hover:bg-[#fbe4e0]"
          >
            <Trash2 size={15} />
            Supprimer
          </button>
        </div>
      </div>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(260px,.65fr)]">
        <article className="ds-card p-6 sm:p-9">
          <div className="flex flex-col items-start gap-5 border-b border-line pb-7 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="mb-4 grid h-11 w-11 place-items-center rounded-control bg-[#e1f3e6] text-sage font-display text-xl font-extrabold">
                {entreprise?.name ? entreprise.name.slice(0, 1).toUpperCase() : "i"}
              </div>
              <p className="text-sm font-bold text-ink">{entreprise?.name || ""}</p>
              {entreprise?.address && <p className="mt-1 text-xs text-muted">{entreprise.address}</p>}
              {entreprise?.phone && <p className="text-xs text-muted">{entreprise.phone}</p>}
            </div>
            <div className="text-left sm:text-right">
              <p className="text-[11px] font-bold uppercase tracking-[.14em] text-muted">Facture</p>
              <h2 className="mt-1 font-display text-2xl font-extrabold">{invoice.number}</h2>
              <span className={`ds-status mt-3 inline-block ${statusStyles[status] || statusStyles["Brouillon"]}`}>
                {status}
              </span>
            </div>
          </div>

          <div className="grid gap-5 border-b border-line py-7 sm:grid-cols-2">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[.12em] text-muted">Facturé à</p>
              <p className="mt-2 font-bold text-base text-ink">{invoice.client}</p>
              {invoice.client_email && <p className="mt-1 text-xs text-muted">{invoice.client_email}</p>}
              {invoice.client_phone && <p className="text-xs text-muted">{invoice.client_phone}</p>}
              {invoice.client_address && <p className="text-xs text-muted">{invoice.client_address}</p>}
            </div>
            <div className="sm:text-right">
              <p className="text-[10px] font-bold uppercase tracking-[.12em] text-muted">Dates</p>
              <p className="mt-2 text-sm">
                Émise le <strong>{invoice.date}</strong>
              </p>
              <p className="mt-1 text-sm text-muted">
                Échéance le <strong>{invoice.due}</strong>
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px] border-collapse text-left">
              <thead>
                <tr className="border-b border-line text-[10px] font-bold uppercase tracking-[.1em] text-muted">
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3 text-right">Quantité</th>
                  <th className="px-4 py-3 text-right">Prix unitaire</th>
                  <th className="px-4 py-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.lines.map((line, index) => (
                  <tr key={index} className="border-b border-[#f0f3ef] last:border-0">
                    <td className="px-4 py-3 text-sm font-medium">{line.description}</td>
                    <td className="px-4 py-3 text-right text-sm">{line.quantity}</td>
                    <td className="px-4 py-3 text-right text-sm">{formatXof(line.unitPrice)}</td>
                    <td className="px-4 py-3 text-right text-sm font-bold">
                      {formatXof(line.quantity * line.unitPrice)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex flex-col items-end gap-3 border-t border-line pt-6">
            <div className="flex w-full items-center justify-between gap-5 sm:w-auto sm:block">
              <span className="text-muted text-sm">Sous-total</span>
              <strong className="text-sm sm:mt-1 sm:block">{formatXof(subtotal)}</strong>
            </div>
            <div className="flex w-full items-center justify-between gap-5 sm:w-auto sm:block">
              <span className="text-muted text-sm">
                TVA <span className="text-[11px]">(18%)</span>
              </span>
              <strong className="text-sm sm:mt-1 sm:block">{formatXof(tax)}</strong>
            </div>
            <div className="flex w-full items-center justify-between gap-5 rounded-control bg-[#e1f3e6] px-4 py-3 sm:w-auto sm:block">
              <span className="font-bold text-sm">Total TTC</span>
              <strong className="font-display text-lg text-sage sm:mt-1 sm:block">
                {formatXof(total)}
              </strong>
            </div>
          </div>

          {invoice.notes && (
            <div className="mt-8 rounded-xl bg-[#f7f9f6] p-4 text-xs text-muted border border-line">
              <strong className="block text-ink font-bold mb-1">Notes et conditions :</strong>
              <p className="whitespace-pre-line">{invoice.notes}</p>
            </div>
          )}
        </article>

        <aside className="ds-card p-5 sm:p-6 h-fit">
          <div className="mb-5">
            <h3 className="font-display font-bold">Actions de gestion</h3>
            <p className="mt-1 text-xs text-muted">Mettez à jour le statut en un clic.</p>
          </div>
          <div className="space-y-2">
            <button
              onClick={() => handleStatusChange("Payee")}
              className={`ds-button-secondary w-full justify-start ${
                status === "Payee" ? "bg-[#e1f3e6] text-sage font-bold" : ""
              }`}
            >
              ✓ Marquer comme payée
            </button>
            <button
              onClick={() => handleStatusChange("Envoyee")}
              className={`ds-button-secondary w-full justify-start ${
                status === "Envoyee" ? "bg-[#e4eef8] text-[#3c6c91] font-bold" : ""
              }`}
            >
              ✉ Marquer comme envoyée
            </button>
            <button
              onClick={() => handleStatusChange("En retard")}
              className={`ds-button-secondary w-full justify-start ${
                status === "En retard" ? "bg-[#fbe4e0] text-[#b25247] font-bold" : ""
              }`}
            >
              ⚠ Marquer en retard
            </button>
            <button
              onClick={() => handleStatusChange("Brouillon")}
              className={`ds-button-secondary w-full justify-start ${
                status === "Brouillon" ? "bg-[#eef0ec] text-[#6f7972] font-bold" : ""
              }`}
            >
              ✎ Revenir en brouillon
            </button>
          </div>
        </aside>
      </section>
    </div>
  );
}
