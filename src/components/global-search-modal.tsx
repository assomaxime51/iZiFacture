"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  FilePlus2,
  FileText,
  Search,
  UserPlus,
  X,
  PieChart,
  Settings2,
  CalendarDays,
} from "@/components/icons";
import { formatXof, statusStyles } from "@/data/app-data";
import { fetchClients, fetchFactures } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GlobalSearchModal({ isOpen, onClose }: GlobalSearchModalProps) {
  const { entreprise } = useAuth();
  const [query, setQuery] = useState("");
  const [invoices, setInvoices] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setQuery("");
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    Promise.all([fetchFactures(undefined, undefined, entreprise?.id), fetchClients(entreprise?.id)])
      .then(([factures, clientList]) => {
        setInvoices(Array.isArray(factures) ? factures.map((invoice: any) => ({
          number: invoice.number,
          client: invoice.clients?.name || "Client",
          status: invoice.status,
          amount: Number(invoice.total_amount || 0),
          date: invoice.date,
        })) : []);
        setClients(Array.isArray(clientList) ? clientList : []);
      })
      .catch(() => {
        setInvoices([]);
        setClients([]);
      });
  }, [entreprise?.id, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isOpen) {
          onClose();
        }
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const normalizedQuery = query.toLowerCase().trim();

  // Filter invoices
  const filteredInvoices = normalizedQuery
    ? invoices.filter(
        (inv) =>
          inv.number.toLowerCase().includes(normalizedQuery) ||
          inv.client.toLowerCase().includes(normalizedQuery) ||
          inv.status.toLowerCase().includes(normalizedQuery) ||
          inv.amount.toString().includes(normalizedQuery)
      )
    : invoices.slice(0, 3);

  // Filter clients
  const filteredClients = normalizedQuery
    ? clients.filter(
        (c) =>
          c.name.toLowerCase().includes(normalizedQuery) ||
          c.email.toLowerCase().includes(normalizedQuery) ||
          c.phone.toLowerCase().includes(normalizedQuery) ||
          c.address.toLowerCase().includes(normalizedQuery)
      )
    : clients.slice(0, 3);

  // Quick actions
  const quickActions = [
    {
      title: "Créer une nouvelle facture",
      category: "Action",
      href: "/invoices/new",
      icon: FilePlus2,
      color: "bg-[#e1f3e6] text-[#2d7b4c]",
    },
    {
      title: "Ajouter un nouveau client",
      category: "Action",
      href: "/clients/new",
      icon: UserPlus,
      color: "bg-[#fbf4e9] text-[#b17b3f]",
    },
    {
      title: "Consulter les rapports financiers",
      category: "Navigation",
      href: "/reports",
      icon: PieChart,
      color: "bg-[#e4eef8] text-[#3c6c91]",
    },
    {
      title: "Paramètres de facturation",
      category: "Paramètres",
      href: "/settings",
      icon: Settings2,
      color: "bg-[#f2f4f2] text-[#55635a]",
    },
  ].filter((action) =>
    normalizedQuery ? action.title.toLowerCase().includes(normalizedQuery) : true
  );

  const hasResults =
    filteredInvoices.length > 0 || filteredClients.length > 0 || quickActions.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 md:p-20">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-[#e2e7e2] bg-white shadow-2xl transition-all">
        {/* Search input header */}
        <div className="flex items-center border-b border-[#e7ece7] px-4 py-3.5 sm:px-6">
          <Search size={20} className="text-[#829087]" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher une facture, un client, un montant (ex: Kora, 850 000, FAC-0087)..."
            className="flex-1 bg-transparent px-3.5 text-sm font-medium text-[#17221d] outline-none placeholder:text-[#9aa69e] sm:text-base"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="mr-2 rounded-lg p-1 text-[#9aa69e] hover:bg-[#f3f5f1] hover:text-[#17221d]"
              title="Effacer la recherche"
            >
              <X size={16} />
            </button>
          )}
          <button
            onClick={onClose}
            className="rounded-lg border border-[#e7ece7] bg-[#f7f8f4] px-2 py-1 text-[11px] font-bold text-[#829087] hover:bg-[#eceee9]"
          >
            ESC
          </button>
        </div>

        {/* Results Container */}
        <div className="max-h-[65vh] overflow-y-auto p-4 sm:p-6 space-y-6">
          {!hasResults && (
            <div className="py-12 text-center">
              <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-[#f3f5f1] text-[#829087]">
                <Search size={22} />
              </div>
              <p className="text-sm font-semibold text-[#17221d]">Aucun résultat trouvé pour « {query} »</p>
              <p className="mt-1 text-xs text-[#829087]">
                Essayez avec le nom d&apos;un client, un numéro de facture ou un montant.
              </p>
            </div>
          )}

          {/* Quick Actions */}
          {quickActions.length > 0 && (
            <div>
              <p className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.14em] text-[#829087]">
                {normalizedQuery ? "Actions correspondantes" : "Raccourcis rapides"}
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <Link
                      key={action.title}
                      href={action.href}
                      onClick={onClose}
                      className="flex items-center gap-3 rounded-xl border border-[#e7ece7] p-3 text-left transition hover:border-[#4f8665] hover:bg-[#f7f9f6]"
                    >
                      <span className={`grid h-8 w-8 place-items-center rounded-lg ${action.color}`}>
                        <Icon size={16} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-bold text-[#17221d]">{action.title}</p>
                        <p className="text-[10px] text-[#829087]">{action.category}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Invoices */}
          {filteredInvoices.length > 0 && (
            <div>
              <div className="mb-2.5 flex items-center justify-between">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#829087]">
                  Factures ({filteredInvoices.length})
                </p>
                <Link
                  href="/invoices"
                  onClick={onClose}
                  className="text-xs font-bold text-[#4f8665] hover:underline"
                >
                  Toutes les factures
                </Link>
              </div>
              <div className="space-y-1.5">
                {filteredInvoices.map((inv) => (
                  <Link
                    key={inv.number}
                    href={`/invoices/${inv.number}`}
                    onClick={onClose}
                    className="flex items-center justify-between rounded-xl border border-[#eef1ed] bg-[#fbfcfb] px-3.5 py-2.5 transition hover:border-[#4f8665] hover:bg-[#f2f7f3]"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="grid h-8 w-8 place-items-center rounded-lg bg-[#e1f3e6] text-[#2d7b4c]">
                        <FileText size={16} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-[#3e7555]">{inv.number}</span>
                          <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${statusStyles[inv.status]}`}>
                            {inv.status}
                          </span>
                        </div>
                        <p className="truncate text-xs font-semibold text-[#17221d]">{inv.client}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 pl-3">
                      <p className="text-xs font-bold text-[#17221d]">{formatXof(inv.amount)}</p>
                      <p className="text-[10px] text-[#829087] flex items-center justify-end gap-1">
                        <CalendarDays size={10} /> {inv.date}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Clients */}
          {filteredClients.length > 0 && (
            <div>
              <div className="mb-2.5 flex items-center justify-between">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#829087]">
                  Clients ({filteredClients.length})
                </p>
                <Link
                  href="/clients"
                  onClick={onClose}
                  className="text-xs font-bold text-[#4f8665] hover:underline"
                >
                  Tous les clients
                </Link>
              </div>
              <div className="space-y-1.5">
                {filteredClients.map((client) => (
                  <Link
                    key={client.id}
                    href="/clients"
                    onClick={onClose}
                    className="flex items-center justify-between rounded-xl border border-[#eef1ed] bg-[#fbfcfb] px-3.5 py-2.5 transition hover:border-[#4f8665] hover:bg-[#f2f7f3]"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="grid h-8 w-8 place-items-center rounded-full bg-[#eee4d4] text-[10px] font-bold text-[#8b6840]">
                        {client.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-xs font-bold text-[#17221d]">{client.name}</p>
                        <p className="truncate text-[10px] text-[#829087]">{client.email} • {client.phone}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 pl-3">
                      <span className="text-xs font-bold text-[#4f8665]">{client.invoices} factures</span>
                      <p className="text-[10px] text-[#829087]">{formatXof(client.total)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between border-t border-[#e7ece7] bg-[#f9faf7] px-4 py-2.5 text-[11px] text-[#829087] sm:px-6">
          <div className="flex items-center gap-3">
            <span>Navigation instantanée</span>
            <span>•</span>
            <span>Sélectionnez pour ouvrir</span>
          </div>
          <span className="hidden sm:inline">Raccourci <strong>Ctrl+K</strong></span>
        </div>
      </div>
    </div>
  );
}
