"use client";

import { useRef, useState } from "react";
import {
  Camera,
  Check,
  CheckCircle2,
  Globe,
  Mail,
  Phone,
  RefreshCw,
  Save,
  Trash2,
  Upload,
  UserCircle,
} from "@/components/icons";
import CustomSelect, { type SelectOption } from "@/components/custom-select";
import { useAuth } from "@/contexts/auth-context";

const timezoneOptions: SelectOption[] = [
  { value: "gmt-0", label: "(GMT+00:00) Dakar, Abidjan, Bamako" },
  { value: "gmt-1", label: "(GMT+01:00) Paris, Bruxelles, Madrid" },
  { value: "gmt-2", label: "(GMT+02:00) Le Caire, Athènes" },
  { value: "gmt-minus-4", label: "(GMT-04:00) Montréal, New York" },
];

const languageOptions: SelectOption[] = [
  { value: "fr", label: "Français (Défaut)" },
  { value: "en", label: "English" },
  { value: "wo", label: "Wolof" },
];

export default function ProfileView() {
  const { user, entreprise } = useAuth();
  const rawName = (user?.user_metadata?.full_name as string) || (user?.email ? user.email.split("@")[0] : "Admin");
  const [firstName, setFirstName] = useState(rawName);
  const [lastName, setLastName] = useState("");
  const [roleTitle, setRoleTitle] = useState("Propriétaire");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(entreprise?.phone || "");
  const [timezone, setTimezone] = useState("gmt-0");
  const [language, setLanguage] = useState("fr");
  const [bio, setBio] = useState(
    entreprise?.name ? `Espace de gestion pour ${entreprise.name}.` : "Gestionnaire iZiFacture."
  );

  // Avatar state
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast("La photo dépasse la taille maximale autorisée (5 Mo).");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setAvatarUrl(reader.result as string);
        showToast("Photo de profil mise à jour avec succès !");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    showToast("Photo de profil réinitialisée.");
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    showToast("Profil enregistré avec succès !");
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 rounded-xl bg-[#17221d] px-4 py-3 text-xs font-bold text-white shadow-xl animate-rise">
          <Check size={16} className="text-[#b7d8bf]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/webp, image/gif"
        onChange={handleAvatarChange}
        className="hidden"
      />

      <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        {/* Left Side: Avatar Card */}
        <div className="ds-card flex flex-col items-center p-6 text-center h-fit animate-rise">
          {/* Circular Avatar with Camera Trigger */}
          <div className="relative group">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={`${firstName} ${lastName}`}
                className="h-28 w-28 rounded-full object-cover border-4 border-white shadow-lg ring-2 ring-[#4f8665]/30"
              />
            ) : (
              <div className="grid h-28 w-28 place-items-center rounded-full bg-[#edb989] font-display text-3xl font-extrabold text-[#17221d] shadow-md ring-4 ring-white">
                {firstName.charAt(0)}
                {lastName.charAt(0)}
              </div>
            )}

            {/* Quick Camera Overlay Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              aria-label="Changer la photo"
              className="absolute bottom-0 right-0 grid h-9 w-9 place-items-center rounded-full bg-[#4f8665] text-white shadow-md transition hover:bg-[#3f7053] hover:scale-105 active:scale-95"
              title="Changer la photo de profil"
            >
              <Camera size={16} />
            </button>
          </div>

          <h2 className="mt-4 font-display text-lg font-bold text-[#17221d]">
            {firstName} {lastName}
          </h2>
          <p className="mt-0.5 text-xs text-[#829087] font-semibold">{roleTitle}</p>
          <span className="mt-2 rounded-full bg-[#e1f3e6] px-2.5 py-0.5 text-[10px] font-bold text-[#2d7b4c]">
            Compte vérifié
          </span>

          {/* Action Buttons for Avatar */}
          <div className="mt-5 w-full space-y-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#c8d8ca] bg-white px-3 py-2.5 text-xs font-bold text-[#17221d] hover:bg-[#f3f7f2] transition"
            >
              <Upload size={14} className="text-[#4f8665]" />
              <span>{avatarUrl ? "Remplacer la photo" : "Changer la photo"}</span>
            </button>

            {avatarUrl && (
              <button
                type="button"
                onClick={handleRemoveAvatar}
                className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-[#fbe4e0] bg-white px-3 py-2 text-xs font-bold text-[#b25247] hover:bg-[#fbe4e0]/60 transition"
              >
                <Trash2 size={13} />
                <span>Supprimer la photo</span>
              </button>
            )}
          </div>

          {/* User Stats Card */}
          <div className="mt-6 w-full border-t border-line pt-4 text-left text-xs space-y-2.5">
            <div className="flex items-center justify-between text-[#728078]">
              <span>Espace actif</span>
              <strong className="text-[#17221d]">{entreprise?.name || "Aucun"}</strong>
            </div>
            <div className="flex items-center justify-between text-[#728078]">
              <span>Rôle</span>
              <strong className="text-[#4f8665]">Propriétaire</strong>
            </div>
            <div className="flex items-center justify-between text-[#728078]">
              <span>Membre depuis</span>
              <span className="text-[#17221d] font-semibold">Janvier 2024</span>
            </div>
          </div>
        </div>

        {/* Right Side: Profile Details Form */}
        <section className="ds-card p-5 sm:p-7 animate-rise">
          <div className="flex items-center gap-3 border-b border-line pb-5">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#e1f3e6] text-[#2d7b4c]">
              <UserCircle size={22} />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-[#17221d]">
                Informations personnelles
              </h2>
              <p className="mt-0.5 text-xs text-muted">
                Mettez à jour vos coordonnées et préférences de compte.
              </p>
            </div>
          </div>

          <form onSubmit={handleSave} className="mt-6 space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-ink mb-1.5">
                  Prénom *
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="ds-input w-full"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-ink mb-1.5">
                  Nom *
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="ds-input w-full"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-ink mb-1.5">
                  Titre / Poste dans l&apos;entreprise
                </label>
                <input
                  type="text"
                  value={roleTitle}
                  onChange={(e) => setRoleTitle(e.target.value)}
                  className="ds-input w-full"
                  placeholder="Ex: Fondatrice, Directrice Générale, Comptable..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-ink mb-1.5">
                  Email de connexion *
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
                  Numéro de téléphone
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="ds-input w-full"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-ink mb-1.5">
                  Langue d&apos;affichage
                </label>
                <CustomSelect
                  options={languageOptions}
                  value={language}
                  onChange={setLanguage}
                  label="Langue"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-ink mb-1.5">
                  Fuseau horaire
                </label>
                <CustomSelect
                  options={timezoneOptions}
                  value={timezone}
                  onChange={setTimezone}
                  label="Fuseau horaire"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-ink mb-1.5">
                  Bio / Courte présentation
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="ds-input w-full text-xs"
                  placeholder="Présentez votre rôle..."
                />
              </div>
            </div>

            <div className="flex justify-end border-t border-line pt-5">
              <button type="submit" className="ds-button-primary w-full sm:w-auto">
                <Save size={16} /> Enregistrer le profil
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
