-- ==============================================================================
-- iZiFacture - CONFIGURATION COMPLÈTE SUPABASE (Schéma + RLS + Triggers)
-- À exécuter dans : https://supabase.com/dashboard/project/_/sql/new
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. CRÉATION DES TABLES
-- ==============================================================================

-- Table des profils utilisateurs (liée à auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table des entreprises / espaces de travail
CREATE TABLE IF NOT EXISTS public.entreprises (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
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

-- Table des clients
CREATE TABLE IF NOT EXISTS public.clients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    entreprise_id UUID REFERENCES public.entreprises(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address TEXT,
    type TEXT DEFAULT 'entreprise', -- 'entreprise' ou 'particulier'
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table des factures
CREATE TABLE IF NOT EXISTS public.factures (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    entreprise_id UUID REFERENCES public.entreprises(id) ON DELETE CASCADE NOT NULL,
    client_id UUID REFERENCES public.clients(id) ON DELETE RESTRICT NOT NULL,
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

-- Table des lignes de facture
CREATE TABLE IF NOT EXISTS public.lignes_facture (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    facture_id UUID REFERENCES public.factures(id) ON DELETE CASCADE NOT NULL,
    description TEXT NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL DEFAULT 1,
    unit_price DECIMAL(12, 2) NOT NULL DEFAULT 0,
    line_total DECIMAL(12, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 3. INDEX DE PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_entreprises_user ON public.entreprises(user_id);
CREATE INDEX IF NOT EXISTS idx_clients_entreprise ON public.clients(entreprise_id);
CREATE INDEX IF NOT EXISTS idx_factures_entreprise ON public.factures(entreprise_id);
CREATE INDEX IF NOT EXISTS idx_factures_client ON public.factures(client_id);
CREATE INDEX IF NOT EXISTS idx_factures_status ON public.factures(status);
CREATE INDEX IF NOT EXISTS idx_factures_date ON public.factures(date);
CREATE INDEX IF NOT EXISTS idx_lignes_facture_facture ON public.lignes_facture(facture_id);

-- ==============================================================================
-- 4. FONCTIONS ET TRIGGERS AUTOMATIQUES
-- ==============================================================================

-- Mise à jour automatique de updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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

-- Calcul automatique du total par ligne
CREATE OR REPLACE FUNCTION calculate_line_total()
RETURNS TRIGGER AS $$
BEGIN
    NEW.line_total = NEW.quantity * NEW.unit_price;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS calculate_lignes_facture_total ON public.lignes_facture;
CREATE TRIGGER calculate_lignes_facture_total BEFORE INSERT OR UPDATE ON public.lignes_facture
    FOR EACH ROW EXECUTE FUNCTION calculate_line_total();

-- Calcul automatique des montants d'une facture
CREATE OR REPLACE FUNCTION calculate_facture_totals()
RETURNS TRIGGER AS $$
DECLARE
    subtotal DECIMAL(12, 2);
    tax DECIMAL(12, 2);
    total DECIMAL(12, 2);
    line_count INTEGER;
BEGIN
    SELECT COUNT(*), COALESCE(SUM(line_total), 0) INTO line_count, subtotal
    FROM public.lignes_facture
    WHERE facture_id = NEW.id;
    
    IF line_count > 0 THEN
        tax = ROUND(subtotal * 0.18);
        total = subtotal + tax;
        
        NEW.amount = subtotal;
        NEW.tax_amount = tax;
        NEW.total_amount = total;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS recalculate_facture_totals ON public.factures;
CREATE TRIGGER recalculate_facture_totals BEFORE INSERT OR UPDATE ON public.factures
    FOR EACH ROW EXECUTE FUNCTION calculate_facture_totals();

-- Rafraîchissement de la facture lors de modifications d'une ligne
CREATE OR REPLACE FUNCTION refresh_facture_totals_from_line()
RETURNS TRIGGER AS $$
DECLARE
    target_facture_id UUID;
BEGIN
    target_facture_id = COALESCE(NEW.facture_id, OLD.facture_id);

    UPDATE public.factures
    SET amount = amount
    WHERE id = target_facture_id;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS refresh_facture_totals_from_line_trigger ON public.lignes_facture;
CREATE TRIGGER refresh_facture_totals_from_line_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.lignes_facture
    FOR EACH ROW EXECUTE FUNCTION refresh_facture_totals_from_line();

-- Trigger automatique de création de profil après inscription Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
      updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- 5. PERMISSIONS ET SÉCURITÉ ROW LEVEL SECURITY (RLS)
-- ==============================================================================

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entreprises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.factures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lignes_facture ENABLE ROW LEVEL SECURITY;

-- Politiques profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Politiques entreprises
DROP POLICY IF EXISTS "Users can view own entreprises" ON public.entreprises;
CREATE POLICY "Users can view own entreprises" ON public.entreprises
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own entreprises" ON public.entreprises;
CREATE POLICY "Users can insert own entreprises" ON public.entreprises
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own entreprises" ON public.entreprises;
CREATE POLICY "Users can update own entreprises" ON public.entreprises
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own entreprises" ON public.entreprises;
CREATE POLICY "Users can delete own entreprises" ON public.entreprises
  FOR DELETE USING (auth.uid() = user_id);

-- Politiques clients
DROP POLICY IF EXISTS "Users can view own clients" ON public.clients;
CREATE POLICY "Users can view own clients" ON public.clients
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.entreprises 
      WHERE entreprises.id = clients.entreprise_id 
      AND entreprises.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert own clients" ON public.clients;
CREATE POLICY "Users can insert own clients" ON public.clients
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.entreprises 
      WHERE entreprises.id = clients.entreprise_id 
      AND entreprises.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update own clients" ON public.clients;
CREATE POLICY "Users can update own clients" ON public.clients
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.entreprises 
      WHERE entreprises.id = clients.entreprise_id 
      AND entreprises.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete own clients" ON public.clients;
CREATE POLICY "Users can delete own clients" ON public.clients
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.entreprises 
      WHERE entreprises.id = clients.entreprise_id 
      AND entreprises.user_id = auth.uid()
    )
  );

-- Politiques factures
DROP POLICY IF EXISTS "Users can view own factures" ON public.factures;
CREATE POLICY "Users can view own factures" ON public.factures
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.entreprises 
      WHERE entreprises.id = factures.entreprise_id 
      AND entreprises.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert own factures" ON public.factures;
CREATE POLICY "Users can insert own factures" ON public.factures
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.entreprises 
      WHERE entreprises.id = factures.entreprise_id 
      AND entreprises.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update own factures" ON public.factures;
CREATE POLICY "Users can update own factures" ON public.factures
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.entreprises 
      WHERE entreprises.id = factures.entreprise_id 
      AND entreprises.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete own factures" ON public.factures;
CREATE POLICY "Users can delete own factures" ON public.factures
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.entreprises 
      WHERE entreprises.id = factures.entreprise_id 
      AND entreprises.user_id = auth.uid()
    )
  );

-- Politiques lignes_facture
DROP POLICY IF EXISTS "Users can view own lignes_facture" ON public.lignes_facture;
CREATE POLICY "Users can view own lignes_facture" ON public.lignes_facture
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.factures 
      JOIN public.entreprises ON entreprises.id = factures.entreprise_id
      WHERE factures.id = lignes_facture.facture_id 
      AND entreprises.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert own lignes_facture" ON public.lignes_facture;
CREATE POLICY "Users can insert own lignes_facture" ON public.lignes_facture
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.factures 
      JOIN public.entreprises ON entreprises.id = factures.entreprise_id
      WHERE factures.id = lignes_facture.facture_id 
      AND entreprises.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update own lignes_facture" ON public.lignes_facture;
CREATE POLICY "Users can update own lignes_facture" ON public.lignes_facture
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.factures 
      JOIN public.entreprises ON entreprises.id = factures.entreprise_id
      WHERE factures.id = lignes_facture.facture_id 
      AND entreprises.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete own lignes_facture" ON public.lignes_facture;
CREATE POLICY "Users can delete own lignes_facture" ON public.lignes_facture
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.factures 
      JOIN public.entreprises ON entreprises.id = factures.entreprise_id
      WHERE factures.id = lignes_facture.facture_id 
      AND entreprises.user_id = auth.uid()
    )
  );
