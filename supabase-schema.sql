-- Schema iZiFacture pour Supabase
-- Création des tables pour l'application de facturation

-- Activer l'extension UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table pour les profils utilisateurs (liée à Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table pour les entreprises/espaces de travail
CREATE TABLE IF NOT EXISTS public.entreprises (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) NOT NULL,
    name TEXT NOT NULL,
    logo_url TEXT,
    address TEXT,
    phone TEXT,
    email TEXT,
    siret TEXT,
    tva_number TEXT,
    default_payment_terms INTEGER DEFAULT 30,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table pour les clients
CREATE TABLE IF NOT EXISTS public.clients (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    entreprise_id UUID REFERENCES public.entreprises(id) NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address TEXT,
    type TEXT DEFAULT 'entreprise', -- 'entreprise' ou 'particulier'
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table pour les factures
CREATE TABLE IF NOT EXISTS public.factures (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    entreprise_id UUID REFERENCES public.entreprises(id) NOT NULL,
    client_id UUID REFERENCES public.clients(id) NOT NULL,
    number TEXT NOT NULL UNIQUE,
    date DATE NOT NULL,
    due_date DATE NOT NULL,
    amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    tax_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'Brouillon', -- 'Brouillon', 'Envoyee', 'Payee', 'En retard'
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.factures
    ADD COLUMN IF NOT EXISTS amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS tax_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0;

-- Table pour les lignes de facture
CREATE TABLE IF NOT EXISTS public.lignes_facture (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    facture_id UUID REFERENCES public.factures(id) ON DELETE CASCADE NOT NULL,
    description TEXT NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL DEFAULT 1,
    unit_price DECIMAL(12, 2) NOT NULL DEFAULT 0,
    line_total DECIMAL(12, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.lignes_facture
    ADD COLUMN IF NOT EXISTS line_total DECIMAL(12, 2) NOT NULL DEFAULT 0;

-- Index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_clients_entreprise ON public.clients(entreprise_id);
CREATE INDEX IF NOT EXISTS idx_factures_entreprise ON public.factures(entreprise_id);
CREATE INDEX IF NOT EXISTS idx_factures_client ON public.factures(client_id);
CREATE INDEX IF NOT EXISTS idx_factures_status ON public.factures(status);
CREATE INDEX IF NOT EXISTS idx_factures_date ON public.factures(date);
CREATE INDEX IF NOT EXISTS idx_lignes_facture_facture ON public.lignes_facture(facture_id);
CREATE INDEX IF NOT EXISTS idx_entreprises_user ON public.entreprises(user_id);

-- Fonction pour mettre à jour le champ updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers pour mettre à jour updated_at automatiquement
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_entreprises_updated_at ON public.entreprises;
CREATE TRIGGER update_entreprises_updated_at BEFORE UPDATE ON public.entreprises
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_clients_updated_at ON public.clients;
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_factures_updated_at ON public.factures;
CREATE TRIGGER update_factures_updated_at BEFORE UPDATE ON public.factures
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_lignes_facture_updated_at ON public.lignes_facture;
CREATE TRIGGER update_lignes_facture_updated_at BEFORE UPDATE ON public.lignes_facture
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger pour calculer automatiquement le total d'une ligne de facture
CREATE OR REPLACE FUNCTION calculate_line_total()
RETURNS TRIGGER AS $$
BEGIN
    NEW.line_total = COALESCE(NEW.quantity, 0) * COALESCE(NEW.unit_price, 0);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS calculate_lignes_facture_total ON public.lignes_facture;
CREATE TRIGGER calculate_lignes_facture_total
    BEFORE INSERT OR UPDATE OF quantity, unit_price ON public.lignes_facture
    FOR EACH ROW EXECUTE FUNCTION calculate_line_total();

-- Recalcul des montants de la facture à partir des lignes actuelles.
-- Cette version évite les erreurs de trigger sur les colonnes amount / tax_amount / total_amount
-- et met bien à jour les valeurs de la facture après chaque modification de ligne.
CREATE OR REPLACE FUNCTION refresh_facture_totals_from_line()
RETURNS TRIGGER AS $$
DECLARE
    target_facture_id UUID;
    subtotal DECIMAL(12,2);
    tax DECIMAL(12,2);
BEGIN
    target_facture_id = COALESCE(NEW.facture_id, OLD.facture_id);

    IF target_facture_id IS NULL THEN
        RETURN COALESCE(NEW, OLD);
    END IF;

    SELECT COALESCE(SUM(line_total), 0)
    INTO subtotal
    FROM public.lignes_facture
    WHERE facture_id = target_facture_id;

    tax = ROUND(subtotal * 0.18, 2);

    UPDATE public.factures
    SET amount = subtotal,
        tax_amount = tax,
        total_amount = subtotal + tax,
        updated_at = timezone('utc'::text, now())
    WHERE id = target_facture_id;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS refresh_facture_totals_from_line_trigger ON public.lignes_facture;
CREATE TRIGGER refresh_facture_totals_from_line_trigger
    AFTER INSERT OR UPDATE OF facture_id, quantity, unit_price OR DELETE ON public.lignes_facture
    FOR EACH ROW EXECUTE FUNCTION refresh_facture_totals_from_line();

-- Aucune recalculation automatique sur public.factures lors de l'INSERT.
-- Les montants sont calculés côté application puis écrits explicitement.
DROP TRIGGER IF EXISTS recalculate_facture_totals ON public.factures;

-- Commentaires sur les tables
COMMENT ON TABLE public.profiles IS 'Profils utilisateurs liés à Supabase Auth';
COMMENT ON TABLE public.entreprises IS 'Entreprises/espaces de travail des utilisateurs';
COMMENT ON TABLE public.clients IS 'Clients des entreprises';
COMMENT ON TABLE public.factures IS 'Factures créées par les entreprises';
COMMENT ON TABLE public.lignes_facture IS 'Lignes de produits/services dans les factures';

-- Données de test (optionnel - à supprimer en production)
-- INSERT INTO public.profiles (id, email, full_name) VALUES 
-- ('00000000-0000-0000-0000-000000000000', 'test@example.com', 'Utilisateur Test');
