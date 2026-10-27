"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { User, Session } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export interface Entreprise {
  id: string;
  user_id: string;
  name: string;
  logo_url: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  siret: string | null;
  tva_number: string | null;
  default_payment_terms: number;
  created_at?: string;
  updated_at?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  entreprise: Entreprise | null;
  entreprises: Entreprise[];
  loading: boolean;
  signOut: () => Promise<void>;
  refreshEntreprise: () => Promise<void>;
  refreshEntreprises: () => Promise<void>;
  switchEntreprise: (id: string) => void;
  createEntreprise: (data: {
    name: string;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
  }) => Promise<Entreprise>;
  updateEntreprise: (data: Partial<Entreprise>) => Promise<Entreprise | null>;
  deleteEntreprise: (id: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_ACTIVE_KEY = "izifacture_active_workspace_id";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [entreprises, setEntreprises] = useState<Entreprise[]>([]);
  const [entreprise, setEntreprise] = useState<Entreprise | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchEntreprises = useCallback(async (currentUserId: string) => {
    try {
      const { data, error } = await supabase
        .from("entreprises")
        .select("*")
        .eq("user_id", currentUserId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Erreur lors de la récupération des entreprises:", error);
        return [];
      }

      const list: Entreprise[] = data || [];
      setEntreprises(list);

      // Déterminer l'espace actif
      const savedId = typeof window !== "undefined" ? localStorage.getItem(STORAGE_ACTIVE_KEY) : null;
      const matched = list.find((e) => e.id === savedId);
      const active = matched || list[0] || null;

      setEntreprise(active);
      if (active && typeof window !== "undefined") {
        localStorage.setItem(STORAGE_ACTIVE_KEY, active.id);
      }
      return list;
    } catch (err) {
      console.error("Exception dans fetchEntreprises:", err);
      return [];
    }
  }, []);

  const switchEntreprise = (id: string) => {
    const target = entreprises.find((e) => e.id === id);
    if (target) {
      setEntreprise(target);
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_ACTIVE_KEY, target.id);
      }
    }
  };

  const createEntreprise = async (params: {
    name: string;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
  }): Promise<Entreprise> => {
    if (!user) throw new Error("Vous devez être connecté pour créer un espace.");

    const { data, error } = await supabase
      .from("entreprises")
      .insert({
        user_id: user.id,
        name: params.name.trim(),
        email: params.email?.trim() || null,
        phone: params.phone?.trim() || null,
        address: params.address?.trim() || null,
        default_payment_terms: 30,
      })
      .select()
      .single();

    if (error) {
      console.error("Erreur création entreprise:", error);
      throw error;
    }

    const updated = [...entreprises, data];
    setEntreprises(updated);
    setEntreprise(data);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_ACTIVE_KEY, data.id);
    }
    return data;
  };

  const updateEntreprise = async (fields: Partial<Entreprise>): Promise<Entreprise | null> => {
    if (!entreprise?.id) return null;
    try {
      const { data, error } = await supabase
        .from("entreprises")
        .update(fields)
        .eq("id", entreprise.id)
        .select()
        .single();

      if (error) {
        console.error("Erreur lors de la mise à jour de l'entreprise:", error);
        throw error;
      }

      setEntreprise(data);
      setEntreprises((prev) => prev.map((e) => (e.id === data.id ? data : e)));
      return data;
    } catch (err) {
      console.error("Erreur updateEntreprise:", err);
      throw err;
    }
  };

  const deleteEntreprise = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase.from("entreprises").delete().eq("id", id);
      if (error) throw error;

      const remaining = entreprises.filter((e) => e.id !== id);
      setEntreprises(remaining);
      if (entreprise?.id === id) {
        const next = remaining[0] || null;
        setEntreprise(next);
        if (next && typeof window !== "undefined") {
          localStorage.setItem(STORAGE_ACTIVE_KEY, next.id);
        } else if (typeof window !== "undefined") {
          localStorage.removeItem(STORAGE_ACTIVE_KEY);
        }
      }
      return true;
    } catch (err) {
      console.error("Erreur suppression entreprise:", err);
      throw err;
    }
  };

  const refreshEntreprises = useCallback(async () => {
    if (!user) return;
    await fetchEntreprises(user.id);
  }, [user, fetchEntreprises]);

  const refreshEntreprise = refreshEntreprises;

  useEffect(() => {
    let isMounted = true;

    // Timeout de sécurité au cas où Supabase est injoignable
    const safetyTimeout = setTimeout(() => {
      if (isMounted) setLoading(false);
    }, 3000);

    // Session initiale
    supabase.auth
      .getSession()
      .then(async ({ data: { session } }) => {
        if (!isMounted) return;
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          try {
            await fetchEntreprises(session.user.id);
          } catch (e) {
            console.error("fetchEntreprises error:", e);
          }
        } else {
          setEntreprises([]);
          setEntreprise(null);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erreur lors de la récupération de session:", err);
        if (isMounted) setLoading(false);
      });

    // Écouteur de changement d'état d'authentification
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!isMounted) return;
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        try {
          await fetchEntreprises(session.user.id);
        } catch (e) {
          console.error("fetchEntreprises error on auth change:", e);
        }
      } else {
        setEntreprises([]);
        setEntreprise(null);
      }
      setLoading(false);
    });

    return () => {
      isMounted = false;
      clearTimeout(safetyTimeout);
      subscription.unsubscribe();
    };
  }, [fetchEntreprises]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setEntreprises([]);
    setEntreprise(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_ACTIVE_KEY);
    }
    router.replace("/auth/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        entreprise,
        entreprises,
        loading,
        signOut,
        refreshEntreprise,
        refreshEntreprises,
        switchEntreprise,
        createEntreprise,
        updateEntreprise,
        deleteEntreprise,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth doit être utilisé au sein d'un AuthProvider");
  }
  return context;
}
