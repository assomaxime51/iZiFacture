"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { formatXof, type InvoiceLine } from "@/data/app-data";
import { Plus, Save, Send, Trash2, Check } from "@/components/icons";
import DatePicker from "@/components/date-picker";
import CustomSelect from "@/components/custom-select";
import { useAuth } from "@/contexts/auth-context";
import { fetchClients, createFacture } from "@/lib/api";

const today = new Date();

export default function InvoiceForm() {
  const router = useRouter();
  const { entreprise } = useAuth();

  const [clientsList, setClientsList] = useState<{ id: string; name: string }[]>([]);
  const [selectedClient, setSelectedClient] = useState("");
  const [lines, setLines] = useState<InvoiceLine[]>([{ description: "", quantity: 1, unitPrice: 0 }]);
  const [issueDate, setIssueDate] = useState<Date>(today);
  const [dueDate, setDueDate] = useState<Date>(new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000));
  const [notes, setNotes] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("FAC-" + new Date().getFullYear() + "-0001");
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Charger les clients réels depuis Supabase
  useEffect(() => {
    async function load() {
      try {
        const data = await fetchClients(entreprise?.id);
        if (data && Array.isArray(data)) {
          setClientsList(data.map((c: any) => ({ id: c.id, name: c.name })));
          if (data.length > 0 && !selectedClient) {
            setSelectedClient(data[0].id);
          }
        }
      } catch (err) {
        console.error("Erreur chargement clients:", err);
      }
    }
    load();
  }, [entreprise?.id]);

  const clientOptions = clientsList.map((client) => ({
    value: client.id,
    label: client.name,
  }));

  const subtotal = lines.reduce((total, line) => total + line.quantity * line.unitPrice, 0);
  const tax = Math.round(subtotal * 0.18);
  const total = subtotal + tax;

  const updateLine = (index: number, field: keyof InvoiceLine, value: string) =>
    setLines((current) =>
      current.map((line, lineIndex) =>
        lineIndex === index
          ? {
              ...line,
              [field]: field === "description" ? value : Math.max(0, Number(value)),
            }
          : line
      )
    );

  const handleSaveInvoice = async (status: "Brouillon" | "Envoyee") => {
    if (!entreprise?.id) {
      alert("Aucune entreprise active n'est sélectionnée. Créez ou sélectionnez un espace de travail avant d'enregistrer une facture.");
      return;
    }

    if (!selectedClient) {
      alert("Veuillez sélectionner un client.");
      return;
    }

    if (lines.length === 0 || !lines[0].description.trim()) {
      alert("Veuillez renseigner au moins une ligne de facturation avec une description.");
      return;
    }

    setLoading(true);
    try {
      const formattedLines = lines.map((l) => ({
        description: l.description.trim() || "Article",
        quantity: Number(l.quantity) || 1,
        unit_price: Number(l.unitPrice) || 0,
      }));

      const created = await createFacture({
        entreprise_id: entreprise?.id,
        client_id: selectedClient,
        date: issueDate.toISOString().split("T")[0],
        due_date: dueDate.toISOString().split("T")[0],
        status,
        notes: notes.trim() || null,
        lines: formattedLines,
      });

      setToastMessage(status === "Envoyee" ? "Facture envoyée et enregistrée !" : "Brouillon enregistré avec succès !");
      setTimeout(() => {
        router.push("/invoices");
      }, 900);
    } catch (err: any) {
      console.error("Erreur création facture:", err);
      alert("Erreur lors de l'enregistrement de la facture : " + (err.message || "Erreur serveur"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-6">
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 rounded-xl bg-[#17221d] px-4 py-3 text-xs font-bold text-white shadow-xl animate-rise">
          <Check size={16} className="text-[#b7d8bf]" />
          <span>{toastMessage}</span>
        </div>
      )}

      <section className="ds-card min-w-0 p-5 sm:p-7">
        <div className="mb-7 flex items-center justify-between border-b border-line pb-5">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[.14em] text-muted">Création de facture</p>
            <h2 className="mt-1 font-display text-xl font-bold">{invoiceNumber}</h2>
          </div>
          <span className="ds-status bg-[#eef0ec] text-status-draft">Nouveau</span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-ink">Client destinataire *</label>
              {clientsList.length === 0 && (
                <span className="text-xs text-[#b25247]">
                  Aucun client en base. Créez-en un dans l'onglet Clients d'abord !
                </span>
              )}
            </div>
            <CustomSelect
              options={clientOptions}
              value={selectedClient}
              onChange={setSelectedClient}
              label="Sélectionner un client"
              searchable
            />
          </div>
          <div>
            <DatePicker label="Date d'émission" value={issueDate} onChange={setIssueDate} />
          </div>
          <div>
            <DatePicker label="Date d'échéance" value={dueDate} onChange={setDueDate} />
          </div>
        </div>

        <div className="mt-8">
          <div className="mb-3 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h3 className="font-display text-base font-bold">Lignes de facture</h3>
              <p className="mt-1 text-xs text-muted">Décrivez les produits ou services facturés.</p>
            </div>
            <button
              type="button"
              className="ds-button-secondary"
              onClick={() => setLines([...lines, { description: "", quantity: 1, unitPrice: 0 }])}
            >
              <Plus size={15} />
              Ajouter une ligne
            </button>
          </div>

          <div className="overflow-x-auto rounded-control border border-line">
            <div className="min-w-[600px]">
              <div className="grid grid-cols-[minmax(180px,1fr)_80px_120px_120px_44px] gap-3 bg-[#f7f9f6] px-4 py-3 text-[10px] font-bold uppercase tracking-[.1em] text-muted">
                <span>Description</span>
                <span>Quantité</span>
                <span>Prix unitaire</span>
                <span>Total ligne</span>
                <span />
              </div>
              {lines.map((line, index) => (
                <div
                  key={index}
                  className="grid grid-cols-[minmax(180px,1fr)_80px_120px_120px_44px] items-center gap-3 border-t border-line px-4 py-3"
                >
                  <input
                    className="ds-input"
                    placeholder="Ex. Prestation de conseil, Conception web..."
                    value={line.description}
                    onChange={(event) => updateLine(index, "description", event.target.value)}
                  />
                  <input
                    className="ds-input"
                    type="number"
                    min="1"
                    value={line.quantity}
                    onChange={(event) => updateLine(index, "quantity", event.target.value)}
                  />
                  <input
                    className="ds-input"
                    type="number"
                    min="0"
                    step="500"
                    value={line.unitPrice}
                    onChange={(event) => updateLine(index, "unitPrice", event.target.value)}
                  />
                  <strong className="text-sm font-semibold">{formatXof(line.quantity * line.unitPrice)}</strong>
                  <button
                    type="button"
                    aria-label="Supprimer la ligne"
                    disabled={lines.length === 1}
                    onClick={() => setLines(lines.filter((_, lineIndex) => lineIndex !== index))}
                    className="grid h-9 w-9 place-items-center rounded-control text-[#b25247] hover:bg-[#fbe4e0] disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <label className="mt-6 block text-xs font-bold">
          Notes et conditions de règlement
          <textarea
            className="ds-input mt-2 min-h-24 w-full resize-y"
            placeholder="Coordonnées bancaires, modalité de paiement par chèque ou Wave, pénalités de retard..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </label>
      </section>

      <aside className="ds-card p-5 sm:p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="font-display text-lg font-bold">Résumé de la facture</h2>
            <p className="mt-1 text-xs text-muted">Calcul automatique avec TVA à 18% en FCFA.</p>
          </div>
          <div className="grid gap-3 text-sm sm:grid-cols-3 lg:min-w-[560px]">
            <div className="flex items-center justify-between gap-5 rounded-control bg-[#f7f9f6] px-4 py-3 sm:block">
              <span className="text-muted">Sous-total</span>
              <strong className="sm:mt-1 sm:block">{formatXof(subtotal)}</strong>
            </div>
            <div className="flex items-center justify-between gap-5 rounded-control bg-[#f7f9f6] px-4 py-3 sm:block">
              <span className="text-muted">
                TVA <span className="text-[11px]">(18%)</span>
              </span>
              <strong className="sm:mt-1 sm:block">{formatXof(tax)}</strong>
            </div>
            <div className="flex items-center justify-between gap-5 rounded-control bg-[#e1f3e6] px-4 py-3 sm:block">
              <span className="font-bold">Total TTC</span>
              <strong className="font-display text-lg text-sage sm:mt-1 sm:block">{formatXof(total)}</strong>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 border-t border-line pt-5 sm:flex-row sm:justify-end">
          <button
            type="button"
            disabled={loading}
            onClick={() => handleSaveInvoice("Brouillon")}
            className="ds-button-secondary w-full sm:w-auto"
          >
            <Save size={16} />
            {loading ? "Enregistrement..." : "Sauvegarder comme brouillon"}
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => handleSaveInvoice("Envoyee")}
            className="ds-button-primary w-full sm:w-auto"
          >
            <Send size={16} />
            {loading ? "Enregistrement..." : "Enregistrer et émettre"}
          </button>
        </div>
      </aside>
    </div>
  );
}
