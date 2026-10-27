import AppShell from "@/components/app-shell";
import { Mail, Phone, MessageCircle } from "lucide-react";

export default function SupportPage() {
  return (
    <AppShell 
      title="Support & Aide" 
      eyebrow="Besoin d'aide ? Contactez le créateur de iZiFacture."
    >
      <div className="max-w-2xl">
        <div className="rounded-xl border border-line bg-white p-8 shadow-sm">
          <h2 className="font-display text-2xl font-bold tracking-[-0.04em] text-ink mb-6">
            Contactez le créateur
          </h2>
          
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-[#b7d8bf] text-ink">
                <Mail size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-ink mb-1">Email</h3>
                <p className="text-muted text-sm">contact@izifacture.com</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-[#b7d8bf] text-ink">
                <Phone size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-ink mb-1">Téléphone</h3>
                <p className="text-muted text-sm">+33 6 12 34 56 78</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-[#b7d8bf] text-ink">
                <MessageCircle size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-ink mb-1">Chat en direct</h3>
                <p className="text-muted text-sm">Disponible du lundi au vendredi, 9h-18h</p>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-line">
            <p className="text-sm text-muted">
              Pour toute question technique ou difficulté d'utilisation de iZiFacture, n'hésitez pas à nous contacter. Nous répondrons dans les plus brefs délais.
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

