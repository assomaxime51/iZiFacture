-- Row Level Security (RLS) pour iZiFacture
-- Sécurité des données au niveau des lignes

-- Accorder les permissions de base aux rôles Supabase
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated;

-- Activer RLS sur toutes les tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entreprises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.factures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lignes_facture ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- Politiques RLS pour profiles
-- ==============================================================================
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ==============================================================================
-- Politiques RLS pour entreprises
-- ==============================================================================
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

-- ==============================================================================
-- Politiques RLS pour clients
-- ==============================================================================
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

-- ==============================================================================
-- Politiques RLS pour factures
-- ==============================================================================
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

-- ==============================================================================
-- Politiques RLS pour lignes_facture
-- ==============================================================================
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

-- ==============================================================================
-- Trigger automatique pour profil utilisateur après inscription Supabase Auth
-- ==============================================================================
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