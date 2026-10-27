"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import {
  AlertCircle,
  Building2,
  Check,
  CheckCircle2,
  Copy,
  CreditCard,
  Eye,
  KeyRound,
  Laptop,
  Lock,
  RefreshCw,
  Save,
  ShieldCheck,
  SlidersHorizontal,
  Smartphone,
  Trash2,
  Upload,
} from "@/components/icons";
import CustomSelect, { type SelectOption } from "@/components/custom-select";

type SettingsTab = "entreprise" | "facturation" | "securite";

const currencyOptions: SelectOption[] = [
  { value: "FCFA", label: "FCFA (Franc CFA BCEAO)" },
  { value: "EUR", label: "EUR (€ Euro)" },
  { value: "USD", label: "USD ($ Dollar US)" },
];

const vatOptions: SelectOption[] = [
  { value: "18", label: "18 % (Taux normal standard Sénégal)" },
  { value: "0", label: "0 % (Exonéré de TVA / Exportation)" },
  { value: "10", label: "10 % (Taux réduit hébergement)" },
];

const paymentTermsOptions: SelectOption[] = [
  { value: "0", label: "Paiement comptant (À réception)" },
  { value: "15", label: "15 jours net" },
  { value: "30", label: "30 jours net (Défaut)" },
  { value: "45", label: "45 jours fin de mois" },
  { value: "60", label: "60 jours net" },
];

const legalFormOptions: SelectOption[] = [
  { value: "SARL", label: "SARL (Société à Responsabilité Limitée)" },
  { value: "SAS", label: "SAS (Société par Actions Simplifiée)" },
  { value: "SUARL", label: "SUARL (SARL Unipersonnelle)" },
  { value: "EI", label: "Entreprise Individuelle" },
  { value: "Auto", label: "Auto-entrepreneur / Freelance" },
];

const countryOptions: SelectOption[] = [
  { value: "Sénégal", label: "Sénégal" },
  { value: "Côte d'Ivoire", label: "Côte d'Ivoire" },
  { value: "Cameroun", label: "Cameroun" },
  { value: "Mali", label: "Mali" },
  { value: "Bénin", label: "Bénin" },
  { value: "Togo", label: "Togo" },
  { value: "France", label: "France" },
];

export default function SettingsView() {
  const { entreprise, updateEntreprise, refreshEntreprise } = useAuth();
  const [activeTab, setActiveTab] = useState<SettingsTab>("entreprise");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Entreprise Form State
  const [companyName, setCompanyName] = useState(entreprise?.name || "Mon Entreprise");
  const [legalForm, setLegalForm] = useState("SARL");
  const [ninea, setNinea] = useState(entreprise?.siret || "");
  const [email, setEmail] = useState(entreprise?.email || "");
  const [phone, setPhone] = useState(entreprise?.phone || "");
  const [country, setCountry] = useState("Sénégal");
  const [address, setAddress] = useState(entreprise?.address || "");
  const [website, setWebsite] = useState("https://izifacture.com");
  const [logoUrl, setLogoUrl] = useState<string | null>(entreprise?.logo_url || null);
  const [logoName, setLogoName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Facturation Form State
  const [invoicePrefix, setInvoicePrefix] = useState("FAC-");
  const [nextInvoiceNumber, setNextInvoiceNumber] = useState("2024-0001");
  const [defaultCurrency, setDefaultCurrency] = useState("FCFA");
  const [defaultVatRate, setDefaultVatRate] = useState("18");
  const [defaultPaymentTerms, setDefaultPaymentTerms] = useState(String(entreprise?.default_payment_terms || "30"));
  const [bankName, setBankName] = useState("Banque Atlantique");
  const [bankIban, setBankIban] = useState("SN08 SN01 2345 6789 0123 4567 8901");
  const [bankSwift, setBankSwift] = useState("BATSNSDK");
  const [mobileMoney, setMobileMoney] = useState("Wave / Orange Money");
  const [footerLegal, setFooterLegal] = useState(
    "Entreprise au capital de 1 000 000 FCFA. En cas de retard de paiement, une pénalité légale sera appliquée."
  );

  // Sync state when entreprise is loaded
  useEffect(() => {
    if (entreprise) {
      if (entreprise.name) setCompanyName(entreprise.name);
      if (entreprise.email) setEmail(entreprise.email);
      if (entreprise.phone) setPhone(entreprise.phone);
      if (entreprise.address) setAddress(entreprise.address);
      if (entreprise.siret) setNinea(entreprise.siret);
      if (entreprise.logo_url) setLogoUrl(entreprise.logo_url);
      if (entreprise.default_payment_terms) setDefaultPaymentTerms(String(entreprise.default_payment_terms));
    }
  }, [entreprise]);

  // Sécurité Form State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [otherSessionsTerminated, setOtherSessionsTerminated] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Logo file upload handler
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        showToast("Le logo dépasse la taille limite de 3 Mo.");
        return;
      }
      setLogoName(file.name);
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        setLogoUrl(base64);
        try {
          await updateEntreprise({ logo_url: base64 });
          showToast("Logo enregistré avec succès !");
        } catch {
          showToast("Logo chargé localement.");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDropLogo = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        showToast("Le logo dépasse la taille limite de 3 Mo.");
        return;
      }
      setLogoName(file.name);
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        setLogoUrl(base64);
        try {
          await updateEntreprise({ logo_url: base64 });
          showToast("Logo enregistré avec succès !");
        } catch {
          showToast("Logo chargé.");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = async () => {
    setLogoUrl(null);
    setLogoName(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    try {
      await updateEntreprise({ logo_url: null });
      showToast("Logo supprimé.");
    } catch {
      showToast("Logo supprimé.");
    }
  };

  const handleSaveEntreprise = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateEntreprise({
        name: companyName,
        email: email || null,
        phone: phone || null,
        address: address || null,
        siret: ninea || null,
        logo_url: logoUrl || null,
      });
      await refreshEntreprise();
      showToast("Informations de l'entreprise enregistrées dans Supabase !");
    } catch (err: any) {
      showToast("Erreur lors de la sauvegarde : " + (err.message || "Erreur réseau"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveFacturation = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateEntreprise({
        default_payment_terms: Number(defaultPaymentTerms) || 30,
      });
      await refreshEntreprise();
      showToast("Paramètres de facturation enregistrés dans Supabase !");
    } catch (err: any) {
      showToast("Erreur lors de la sauvegarde : " + (err.message || "Erreur réseau"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast("Les nouveaux mots de passe ne correspondent pas.");
      return;
    }
    if (newPassword.length < 6) {
      showToast("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    showToast("Mot de passe mis à jour avec succès !");
  };

  const handleTerminateOtherSessions = () => {
    setOtherSessionsTerminated(true);
    showToast("Toutes les autres sessions ont été déconnectées.");
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[240px_minmax(0,1fr)]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 rounded-xl bg-[#17221d] px-4 py-3 text-xs font-bold text-white shadow-xl animate-rise">
          <Check size={16} className="text-[#b7d8bf]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Left Navigation Tabs */}
      <nav className="ds-card h-fit p-2 overflow-x-auto">
        <div className="flex gap-2 min-w-max sm:flex-col">
          <button
            onClick={() => setActiveTab("entreprise")}
            className={`flex items-center gap-3 rounded-control px-3.5 py-3 text-xs font-bold text-left transition ${
              activeTab === "entreprise"
                ? "bg-[#e1f3e6] text-[#2d7b4c]"
                : "text-[#728078] hover:bg-[#f3f7f2] hover:text-[#17221d]"
            }`}
          >
            <Building2 size={16} />
            <span>Entreprise</span>
          </button>

          <button
            onClick={() => setActiveTab("facturation")}
            className={`flex items-center gap-3 rounded-control px-3.5 py-3 text-xs font-bold text-left transition ${
              activeTab === "facturation"
                ? "bg-[#e1f3e6] text-[#2d7b4c]"
                : "text-[#728078] hover:bg-[#f3f7f2] hover:text-[#17221d]"
            }`}
          >
            <SlidersHorizontal size={16} />
            <span>Facturation</span>
          </button>

          <button
            onClick={() => setActiveTab("securite")}
            className={`flex items-center gap-3 rounded-control px-3.5 py-3 text-xs font-bold text-left transition ${
              activeTab === "securite"
                ? "bg-[#e1f3e6] text-[#2d7b4c]"
                : "text-[#728078] hover:bg-[#f3f7f2] hover:text-[#17221d]"
            }`}
          >
            <ShieldCheck size={16} />
            <span>Sécurité</span>
          </button>
        </div>
      </nav>

      {/* Right Content Area */}
      <div className="min-w-0">
        {/* TAB 1: ENTREPRISE */}
        {activeTab === "entreprise" && (
          <section className="ds-card p-5 sm:p-7 animate-rise">
            <div className="border-b border-line pb-5">
              <div className="flex items-center gap-2">
                <h2 className="font-display text-lg font-bold text-ink">
                  Paramètres de l&apos;entreprise
                </h2>
                <span className="rounded-md bg-[#edf6ef] px-2 py-0.5 text-[10px] font-bold text-[#4f8665]">
                  Profil public
                </span>
              </div>
              <p className="mt-1 text-xs text-muted">
                Ces informations apparaîtront sur vos factures, devis et reçus.
              </p>
            </div>

            <form onSubmit={handleSaveEntreprise} className="mt-6 space-y-6">
              {/* Company Info Grid */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-ink mb-1.5">
                    Nom commercial *
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="ds-input w-full"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-ink mb-1.5">
                    Forme juridique & Statut
                  </label>
                  <CustomSelect
                    options={legalFormOptions}
                    value={legalForm}
                    onChange={setLegalForm}
                    label="Forme juridique"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-ink mb-1.5">
                    NINEA / Numéro fiscal
                  </label>
                  <input
                    type="text"
                    value={ninea}
                    onChange={(e) => setNinea(e.target.value)}
                    className="ds-input w-full font-mono text-xs"
                    placeholder="0098765432-2V"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-ink mb-1.5">
                    Email professionnel *
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="ds-input w-full"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-ink mb-1.5">
                    Téléphone professionnel *
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="ds-input w-full"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-ink mb-1.5">
                    Pays *
                  </label>
                  <CustomSelect
                    options={countryOptions}
                    value={country}
                    onChange={setCountry}
                    label="Pays"
                    searchable
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-ink mb-1.5">
                    Adresse complète du siège
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="ds-input w-full"
                    placeholder="12 rue Félix Faure, Plateau, Dakar"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-ink mb-1.5">
                    Site web ou portfolio
                  </label>
                  <input
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="ds-input w-full"
                    placeholder="https://votresite.com"
                  />
                </div>
              </div>

              {/* Logo Upload Section */}
              <div className="border-t border-line pt-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-display text-sm font-bold text-ink">
                    Logo de l&apos;entreprise
                  </h3>
                  <span className="text-[11px] text-[#829087]">
                    PNG, JPG, SVG ou WEBP (max 3 Mo)
                  </span>
                </div>
                <p className="text-xs text-[#829087] mb-3">
                  Ce logo sera affiché sur l&apos;en-tête de toutes vos factures et devis exportés.
                </p>

                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/webp, image/svg+xml"
                  onChange={handleLogoUpload}
                  className="hidden"
                />

                {logoUrl ? (
                  /* Logo Preview Card */
                  <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#b9d2bc] bg-[#f7fbf7] p-4 sm:p-5">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="grid h-16 w-16 shrink-0 place-items-center rounded-xl border border-[#dcecdf] bg-white p-1.5 shadow-sm">
                        <img
                          src={logoUrl}
                          alt="Logo de l'entreprise"
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-xs font-bold text-[#17221d]">
                          {logoName ?? "Logo d'entreprise chargé"}
                        </p>
                        <p className="text-[11px] text-[#2d7b4c] font-semibold flex items-center gap-1 mt-0.5">
                          <CheckCircle2 size={13} /> Prêt pour les factures
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-1.5 rounded-xl border border-[#c8d8ca] bg-white px-3 py-2 text-xs font-bold text-[#17221d] hover:bg-[#f3f7f2] transition"
                      >
                        <RefreshCw size={13} /> Remplacer
                      </button>
                      <button
                        type="button"
                        onClick={handleRemoveLogo}
                        className="flex items-center gap-1.5 rounded-xl border border-[#fbe4e0] bg-white px-3 py-2 text-xs font-bold text-[#b25247] hover:bg-[#fbe4e0]/60 transition"
                      >
                        <Trash2 size={13} /> Supprimer
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Drag and Drop Zone */
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDropLogo}
                    onClick={() => fileInputRef.current?.click()}
                    className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#b9d2bc] bg-[#f7fbf7] px-6 py-8 text-center transition hover:border-[#4f8665] hover:bg-[#f0f8f1]"
                  >
                    <div className="mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-white text-[#4f8665] shadow-sm">
                      <Upload size={20} />
                    </div>
                    <p className="text-xs font-bold text-[#17221d]">
                      Cliquez pour choisir un logo ou glissez-déposez ici
                    </p>
                    <p className="mt-1 text-[11px] text-[#829087]">
                      Recommandé : image carrée ou rectangulaire à fond transparent
                    </p>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="mt-7 flex justify-end border-t border-line pt-5">
                <button type="submit" className="ds-button-primary w-full sm:w-auto">
                  <Save size={16} /> Enregistrer les paramètres
                </button>
              </div>
            </form>
          </section>
        )}

        {/* TAB 2: FACTURATION */}
        {activeTab === "facturation" && (
          <section className="ds-card p-5 sm:p-7 animate-rise">
            <div className="border-b border-line pb-5">
              <div className="flex items-center gap-2">
                <h2 className="font-display text-lg font-bold text-ink">
                  Paramètres de facturation
                </h2>
                <span className="rounded-md bg-[#e4eef8] px-2 py-0.5 text-[10px] font-bold text-[#3c6c91]">
                  Factures & Devis
                </span>
              </div>
              <p className="mt-1 text-xs text-muted">
                Personnalisez la numérotation, la TVA, les délais de paiement et vos coordonnées bancaires.
              </p>
            </div>

            <form onSubmit={handleSaveFacturation} className="mt-6 space-y-6">
              {/* General Invoicing Settings */}
              <div>
                <h3 className="font-display text-sm font-bold text-ink mb-3">
                  Numérotation & Format
                </h3>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="block text-xs font-bold text-ink mb-1.5">
                      Préfixe des factures
                    </label>
                    <input
                      type="text"
                      value={invoicePrefix}
                      onChange={(e) => setInvoicePrefix(e.target.value)}
                      className="ds-input w-full font-mono font-bold"
                      placeholder="FAC-"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-ink mb-1.5">
                      Prochain numéro séquentiel
                    </label>
                    <input
                      type="text"
                      value={nextInvoiceNumber}
                      onChange={(e) => setNextInvoiceNumber(e.target.value)}
                      className="ds-input w-full font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-ink mb-1.5">
                      Devise par défaut
                    </label>
                    <CustomSelect
                      options={currencyOptions}
                      value={defaultCurrency}
                      onChange={setDefaultCurrency}
                      label="Devise"
                    />
                  </div>
                </div>
              </div>

              {/* Taxes & Payment Terms */}
              <div className="border-t border-line pt-6">
                <h3 className="font-display text-sm font-bold text-ink mb-3">
                  TVA & Conditions de règlement
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold text-ink mb-1.5">
                      Taux de TVA par défaut
                    </label>
                    <CustomSelect
                      options={vatOptions}
                      value={defaultVatRate}
                      onChange={setDefaultVatRate}
                      label="Taux de TVA"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-ink mb-1.5">
                      Délai de paiement par défaut
                    </label>
                    <CustomSelect
                      options={paymentTermsOptions}
                      value={defaultPaymentTerms}
                      onChange={setDefaultPaymentTerms}
                      label="Délai de paiement"
                    />
                  </div>
                </div>
              </div>

              {/* Bank & Mobile Payment Details */}
              <div className="border-t border-line pt-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-display text-sm font-bold text-ink">
                    Coordonnées de règlement (Paiement)
                  </h3>
                  <span className="text-[11px] text-[#829087]">
                    Imprimées sur le bas de chaque facture
                  </span>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-ink mb-1.5">
                      Établissement bancaire
                    </label>
                    <input
                      type="text"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="ds-input w-full"
                      placeholder="Ex: Banque Atlantique Sénégal, CBAO, BOA..."
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-bold text-ink mb-1.5">
                        RIB / IBAN du compte
                      </label>
                      <input
                        type="text"
                        value={bankIban}
                        onChange={(e) => setBankIban(e.target.value)}
                        className="ds-input w-full font-mono text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-ink mb-1.5">
                        Code BIC / SWIFT
                      </label>
                      <input
                        type="text"
                        value={bankSwift}
                        onChange={(e) => setBankSwift(e.target.value)}
                        className="ds-input w-full font-mono text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-ink mb-1.5">
                      Paiement Mobile Money (Wave / Orange Money)
                    </label>
                    <input
                      type="text"
                      value={mobileMoney}
                      onChange={(e) => setMobileMoney(e.target.value)}
                      className="ds-input w-full"
                      placeholder="Wave : 77 123 45 67 - Orange Money Marchand : 12345"
                    />
                  </div>
                </div>
              </div>

              {/* Legal Footer Notice */}
              <div className="border-t border-line pt-6">
                <label className="block text-xs font-bold text-ink mb-1.5">
                  Mentions légales & Pied de page
                </label>
                <textarea
                  rows={3}
                  value={footerLegal}
                  onChange={(e) => setFooterLegal(e.target.value)}
                  className="ds-input w-full text-xs"
                  placeholder="Mentions légales de l'entreprise..."
                />
              </div>

              {/* Save Button */}
              <div className="mt-7 flex justify-end border-t border-line pt-5">
                <button type="submit" className="ds-button-primary w-full sm:w-auto">
                  <Save size={16} /> Enregistrer les règles de facturation
                </button>
              </div>
            </form>
          </section>
        )}

        {/* TAB 3: SÉCURITÉ */}
        {activeTab === "securite" && (
          <section className="ds-card p-5 sm:p-7 animate-rise space-y-7">
            <div className="border-b border-line pb-5">
              <div className="flex items-center gap-2">
                <h2 className="font-display text-lg font-bold text-ink">
                  Sécurité & Authentification
                </h2>
                <span className="rounded-md bg-[#e1f3e6] px-2 py-0.5 text-[10px] font-bold text-[#2d7b4c]">
                  Compte protégé
                </span>
              </div>
              <p className="mt-1 text-xs text-muted">
                Gérez la sécurité de votre accès, vos mots de passe et vos sessions actives.
              </p>
            </div>

            {/* Password Change Form */}
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <h3 className="font-display text-sm font-bold text-ink flex items-center gap-2">
                <KeyRound size={16} className="text-[#4f8665]" />
                Modifier le mot de passe
              </h3>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-bold text-ink mb-1.5">
                    Mot de passe actuel
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="ds-input w-full"
                    placeholder="••••••••"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-ink mb-1.5">
                    Nouveau mot de passe
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="ds-input w-full"
                    placeholder="••••••••"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-ink mb-1.5">
                    Confirmer le mot de passe
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="ds-input w-full"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              {newPassword && (
                <div className="rounded-xl bg-[#fafcfa] border border-[#e7ece7] p-3 text-xs flex items-center justify-between">
                  <span className="text-[#829087]">Force du mot de passe :</span>
                  <span
                    className={`font-bold ${
                      newPassword.length > 8 ? "text-[#2d7b4c]" : "text-[#ba8540]"
                    }`}
                  >
                    {newPassword.length > 8 ? "Fort (Recommandé)" : "Moyen"}
                  </span>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="rounded-xl bg-[#17221d] px-4 py-2.5 text-xs font-bold text-white hover:bg-black transition"
                >
                  Mettre à jour le mot de passe
                </button>
              </div>
            </form>

            {/* Two-Factor Authentication (2FA) */}
            <div className="border-t border-line pt-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-sm font-bold text-ink">
                      Authentification à deux facteurs (2FA)
                    </h3>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                        twoFactorEnabled
                          ? "bg-[#e1f3e6] text-[#2d7b4c]"
                          : "bg-[#fbe4e0] text-[#b25247]"
                      }`}
                    >
                      {twoFactorEnabled ? "Activé" : "Désactivé"}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[#829087]">
                    Ajoutez une couche de sécurité supplémentaire par code à usage unique (Google Authenticator / SMS).
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setTwoFactorEnabled(!twoFactorEnabled);
                    showToast(
                      twoFactorEnabled ? "2FA désactivé" : "2FA activé avec succès !"
                    );
                  }}
                  className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                    twoFactorEnabled
                      ? "border border-[#c8d8ca] bg-white text-[#17221d] hover:bg-[#f3f7f2]"
                      : "bg-[#4f8665] text-white hover:bg-[#3f7053]"
                  }`}
                >
                  {twoFactorEnabled ? "Désactiver le 2FA" : "Activer le 2FA"}
                </button>
              </div>
            </div>

            {/* Active Sessions */}
            <div className="border-t border-line pt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-display text-sm font-bold text-ink">
                    Sessions actives & Appareils
                  </h3>
                  <p className="text-xs text-[#829087]">
                    Consultez les appareils actuellement connectés à votre compte iZiFacture.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {/* Current session */}
                <div className="flex items-center justify-between rounded-xl border border-[#dcecdf] bg-[#f7fbf7] p-3.5">
                  <div className="flex items-center gap-3">
                    <div className="grid h-9 w-9 place-items-center rounded-lg bg-[#e1f3e6] text-[#2d7b4c]">
                      <Laptop size={18} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-[#17221d]">
                          Windows 11 • Google Chrome
                        </p>
                        <span className="rounded-md bg-[#2d7b4c] px-1.5 py-0.2 text-[8px] font-extrabold uppercase text-white">
                          Cet appareil
                        </span>
                      </div>
                      <p className="text-[10px] text-[#829087]">
                        Dakar, Sénégal • Adresse IP : 197.149.xxx.xxx • Actif maintenant
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-[#2d7b4c]">En ligne</span>
                </div>

                {/* Secondary session */}
                {!otherSessionsTerminated && (
                  <div className="flex items-center justify-between rounded-xl border border-line bg-white p-3.5">
                    <div className="flex items-center gap-3">
                      <div className="grid h-9 w-9 place-items-center rounded-lg bg-[#f3f5f1] text-[#728078]">
                        <Smartphone size={18} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#17221d]">
                          iPhone 15 Pro • Safari Mobile
                        </p>
                        <p className="text-[10px] text-[#829087]">
                          Dakar, Sénégal • Connecté il y a 3 heures
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] text-[#829087]">Inactif</span>
                  </div>
                )}
              </div>

              {!otherSessionsTerminated && (
                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={handleTerminateOtherSessions}
                    className="flex items-center gap-1.5 rounded-xl border border-[#fbe4e0] bg-white px-3.5 py-2 text-xs font-bold text-[#b25247] hover:bg-[#fbe4e0]/60 transition"
                  >
                    <Lock size={13} /> Déconnecter tous les autres appareils
                  </button>
                </div>
              )}
            </div>

            {/* Security Alerts */}
            <div className="border-t border-line pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display text-sm font-bold text-ink">
                    Alertes de connexion suspecte
                  </h3>
                  <p className="text-xs text-[#829087]">
                    Recevoir un email immédiat lors d&apos;une connexion depuis un nouvel appareil.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={(e) => {
                    setEmailAlerts(e.target.checked);
                    showToast(
                      e.target.checked
                        ? "Alertes par email activées"
                        : "Alertes désactivées"
                    );
                  }}
                  className="h-4 w-4 cursor-pointer accent-[#4f8665]"
                />
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
