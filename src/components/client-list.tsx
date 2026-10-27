"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Mail, MapPin, Pencil, Phone, Plus, Trash2, Users, X } from "lucide-react";
import { formatXof, type Client } from "@/data/app-data";
import { fetchClients, createClient, updateClient, deleteClient } from "@/lib/api";

import { useAuth } from "@/contexts/auth-context";

export default function ClientList() {
  const { entreprise } = useAuth();
  const [items, setItems] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  
  // Charger les clients depuis l'API
  useEffect(() => {
    loadClients();
  }, [entreprise?.id]);

  const loadClients = async () => {
    try {
      setLoading(true);
      const data = await fetchClients(entreprise?.id);
      if (data && Array.isArray(data)) {
        const transformedData = data.map((client: any) => ({
          id: client.id,
          name: client.name,
          email: client.email || '',
          phone: client.phone || '',
          address: client.address || '',
          invoices: client.invoices || 0,
          total: client.total || 0,
        }));
        setItems(transformedData);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des clients:', error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };
  
  const openForm = (client?: Client) => { 
    setEditing(client ?? null); 
    setName(client?.name ?? ""); 
    setEmail(client?.email ?? ""); 
    setPhone(client?.phone ?? ""); 
    setAddress(client?.address ?? ""); 
    setFormOpen(true); 
  };
  
  const save = async (event: React.FormEvent) => { 
    event.preventDefault(); 
    if (!name.trim()) return;

    if (!entreprise?.id) {
      alert('Sélectionnez ou créez un espace de travail avant d\'enregistrer un client.');
      return;
    }
    
    try {
      if (editing) {
        await updateClient(editing.id, { name, email, phone, address });
      } else {
        await createClient({ 
          name, 
          email, 
          phone, 
          address,
          entreprise_id: entreprise.id
        });
      }
      await loadClients();
      setFormOpen(false);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde du client');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Supprimer ${name} ?`)) {
      try {
        await deleteClient(id);
        await loadClients();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression du client');
      }
    }
  };

  if (formOpen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-xs"
          onClick={() => setFormOpen(false)}
        />
        <div className="relative w-full max-w-md rounded-2xl border border-[#e2e7e2] bg-white p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-display text-base font-bold text-[#17221d]">
              {editing ? "Modifier le client" : "Ajouter un client"}
            </h4>
            <button
              onClick={() => setFormOpen(false)}
              className="rounded-lg p-1 text-[#829087] hover:bg-[#eceee9]"
            >
              <X size={16} />
            </button>
          </div>
          <form onSubmit={save} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#17221d] mb-1.5">
                Nom du client
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex. Studio Kora"
                className="w-full rounded-xl border border-[#e7ece7] px-3.5 py-2.5 text-sm font-semibold text-[#17221d] outline-none focus:border-[#4f8665] focus:ring-2 focus:ring-[#dcecdf]"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#17221d] mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contact@entreprise.com"
                className="w-full rounded-xl border border-[#e7ece7] px-3.5 py-2.5 text-sm font-semibold text-[#17221d] outline-none focus:border-[#4f8665] focus:ring-2 focus:ring-[#dcecdf]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#17221d] mb-1.5">
                Téléphone
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+221 77 000 00 00"
                className="w-full rounded-xl border border-[#e7ece7] px-3.5 py-2.5 text-sm font-semibold text-[#17221d] outline-none focus:border-[#4f8665] focus:ring-2 focus:ring-[#dcecdf]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#17221d] mb-1.5">
                Adresse
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Ex. 12 rue Félix Faure, Dakar"
                className="w-full rounded-xl border border-[#e7ece7] px-3.5 py-2.5 text-sm font-semibold text-[#17221d] outline-none focus:border-[#4f8665] focus:ring-2 focus:ring-[#dcecdf]"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                className="rounded-xl border border-[#e7ece7] px-4 py-2 text-xs font-bold text-[#55635a] hover:bg-[#f3f5f1]"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="rounded-xl bg-[#4f8665] px-4 py-2 text-xs font-bold text-white hover:bg-[#3f7053]"
              >
                Enregistrer
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-muted">Chargement des clients...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((client) => (
          <article key={client.id} className="ds-card min-w-0 p-5">
            <div className="flex min-w-0 items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#e1f3e6] font-display font-bold text-sage">
                  {client.name.split(" ").map((word) => word[0]).join("").slice(0, 2)}
                </span>
                <div className="min-w-0">
                  <h2 className="truncate font-display font-bold">{client.name}</h2>
                  <p className="mt-1 text-xs text-muted">{client.invoices} factures</p>
                </div>
              </div>
              <div className="flex shrink-0 gap-1">
                <button 
                  aria-label={`Modifier ${client.name}`} 
                  onClick={() => openForm(client)} 
                  className="grid h-8 w-8 place-items-center rounded-control text-muted hover:bg-[#f3f7f2] hover:text-ink"
                >
                  <Pencil size={15} />
                </button>
                <button 
                  aria-label={`Supprimer ${client.name}`} 
                  onClick={() => handleDelete(client.id, client.name)} 
                  className="grid h-8 w-8 place-items-center rounded-control text-[#b25247] hover:bg-[#fbe4e0]"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
            <div className="mt-5 space-y-2 border-t border-line pt-4 text-xs text-muted">
              <p className="flex min-w-0 items-center gap-2">
                <Mail size={14} className="shrink-0" />
                <span className="truncate">{client.email}</span>
              </p>
              <p className="flex min-w-0 items-center gap-2">
                <Phone size={14} className="shrink-0" />
                <span className="truncate">{client.phone}</span>
              </p>
              <p className="flex min-w-0 items-center gap-2">
                <MapPin size={14} className="shrink-0" />
                <span className="truncate">{client.address}</span>
              </p>
            </div>
            <div className="mt-5 flex items-center justify-between gap-3 border-t border-line pt-4 text-xs">
              <span className="text-muted">Total facturé</span>
              <strong className="shrink-0">{formatXof(client.total)}</strong>
            </div>
          </article>
        ))}
      </div>
      
      {/* Bouton pour ajouter un client - maintenant redirige vers la page */}
      <Link 
        href="/clients/new" 
        className="ds-button-primary flex items-center justify-center gap-2 w-full sm:w-auto"
      >
        <Plus size={16} />
        Ajouter un client
      </Link>
    </div>
  );
}
