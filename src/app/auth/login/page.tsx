"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const passwordRequirements = useMemo(() => {
    const checks = [
      { label: "Au moins 8 caractères", valid: password.length >= 8 },
      { label: "Une lettre majuscule", valid: /[A-Z]/.test(password) },
      { label: "Une lettre minuscule", valid: /[a-z]/.test(password) },
      { label: "Un chiffre", valid: /\d/.test(password) },
      { label: "Un caractère spécial", valid: /[^A-Za-z0-9]/.test(password) },
    ];

    return checks;
  }, [password]);

  const passwordIsValid = passwordRequirements.every((item) => item.valid);

  function formatAuthError(msg: string): string {
    if (msg.includes("30 seconds") || msg.includes("security purposes")) {
      return "Par mesure de sécurité, veuillez patienter 30 secondes avant de réessayer.";
    }
    if (msg.includes("Invalid login credentials") || msg.includes("invalid_credentials")) {
      return "Identifiants invalides. Vérifiez votre adresse email et votre mot de passe.";
    }
    if (msg.includes("Email not confirmed")) {
      return "Votre adresse email n'a pas encore été confirmée. Veuillez vérifier votre boîte de réception.";
    }
    if (msg.includes("User already registered") || msg.includes("already registered")) {
      return "Un compte existe déjà avec cette adresse email. Veuillez cliquer sur 'Se connecter'.";
    }
    if (msg.includes("Password should be at least")) {
      return "Le mot de passe doit comporter au moins 6 caractères.";
    }
    if (msg.includes("fetch") || msg.includes("Failed to fetch") || msg.includes("network")) {
      return "Impossible de contacter Supabase. Votre projet Supabase est peut-être en pause ou l'URL est inaccessible.";
    }
    return msg;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!passwordIsValid) {
      setError("Le mot de passe ne respecte pas les conditions requises pour créer un compte.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      setSuccess("Connexion réussie ! Vous êtes maintenant connecté.");
      window.setTimeout(() => {
        router.push("/");
        router.refresh();
      }, 500);
    } catch (error: any) {
      setError(formatAuthError(error.message || "Erreur lors de la connexion"));
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!passwordIsValid) {
      setError("Le mot de passe ne respecte pas les conditions requises pour créer un compte.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      if (data.user && !data.session) {
        setSuccess("Compte créé avec succès ! Vérifiez votre boîte mail pour confirmer votre adresse avant de vous connecter.");
        return;
      }

      setSuccess("Création de compte réussie ! Vous êtes maintenant connecté.");
      window.setTimeout(() => {
        router.push("/");
        router.refresh();
      }, 500);
    } catch (error: any) {
      setError(formatAuthError(error.message || "Erreur lors de l'inscription"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7f8f4] px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-6">
            <div className="grid h-8 w-8 place-items-center rounded-[10px] bg-[#b7d8bf] text-[#17221d] font-display text-lg font-extrabold">
              i
            </div>
            <span className="font-display text-[19px] font-bold tracking-[-0.04em] text-[#17221d]">
              iZiFacture
            </span>
          </Link>
          <h1 className="font-display text-[28px] font-bold tracking-[-0.055em] text-[#17221d]">
            Connexion
          </h1>
          <p className="mt-2 text-sm text-[#829087]">
            Connectez-vous pour gérer votre facturation
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-[#e7ece7] p-6 shadow-[0_2px_10px_rgba(34,63,44,.025)]">
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="bg-[#fbe4e0] text-[#b25247] px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-[#e1f3e6] text-[#2d7b4c] px-4 py-3 rounded-xl text-sm font-medium">
                {success}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-[#17221d] mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vous@exemple.com"
                className="w-full rounded-xl border border-[#e7ece7] px-3.5 py-2.5 text-sm font-semibold text-[#17221d] outline-none focus:border-[#4f8665] focus:ring-2 focus:ring-[#dcecdf]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#17221d] mb-1.5">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-[#e7ece7] px-3.5 py-2.5 pr-11 text-sm font-semibold text-[#17221d] outline-none focus:border-[#4f8665] focus:ring-2 focus:ring-[#dcecdf]"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#829087] hover:text-[#17221d]"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <div className="mt-3 grid gap-1.5 text-[11px] text-[#6f7f78]">
                {passwordRequirements.map((rule) => (
                  <div key={rule.label} className="flex items-center gap-2">
                    <span
                      className={`inline-block h-2.5 w-2.5 rounded-full ${
                        rule.valid ? "bg-[#4f8665]" : "bg-[#d8ddd9]"
                      }`}
                    />
                    <span className={rule.valid ? "text-[#2d7b4c]" : "text-[#6f7f78]"}>
                      {rule.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#4f8665] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#3f7053] disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? "Connexion..." : "Se connecter"}
            </button>

            <button
              type="button"
              onClick={handleSignup}
              disabled={loading}
              className="w-full rounded-xl border border-[#e7ece7] px-4 py-2.5 text-xs font-bold text-[#55635a] hover:bg-[#f3f5f1] disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? "Création..." : "Créer un compte"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-[#829087]">
          En vous connectant, vous acceptez nos{" "}
          <Link href="/terms" className="text-[#4f8665] hover:underline">
            conditions d'utilisation
          </Link>
        </p>
      </div>
    </div>
  );
}