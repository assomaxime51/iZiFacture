# Configuration Supabase pour iZiFacture

## 📋 Étapes de configuration

### 1. Obtenir les clés API Supabase

1. Allez sur [https://supabase.com/dashboard/project/gmndxotsfnbxwohkalkz/settings/api](https://supabase.com/dashboard/project/gmndxotsfnbxwohkalkz/settings/api)
2. Copiez les clés suivantes :
   - **Project URL** : `https://gmndxotsfnbxwohkalkz.supabase.co`
   - **anon public** key (clé publique)
   - **service_role** key (clé secrète - NE JAMAIS PARTAGER)

### 2. Configurer les variables d'environnement

Créez un fichier `.env.local` à la racine du projet avec le contenu suivant :

```env
NEXT_PUBLIC_SUPABASE_URL=https://gmndxotsfnbxwohkalkz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_anon_key_ici
SUPABASE_SERVICE_ROLE_KEY=votre_service_role_key_ici
```

Remplacez `votre_anon_key_ici` et `votre_service_role_key_ici` par les clés que vous avez copiées.

### 3. Appliquer le schéma de base de données et RLS (En 1 seule étape)

1. Allez sur [https://supabase.com/dashboard/project/gmndxotsfnbxwohkalkz/sql/new](https://supabase.com/dashboard/project/gmndxotsfnbxwohkalkz/sql/new)
2. Copiez l'intégralité du fichier `supabase-all-in-one.sql` (qui regroupe tables, triggers automatiques et sécurité RLS)
3. Collez-le dans l'éditeur SQL
4. Cliquez sur "Run" pour tout installer

### 4. Vérifier la configuration

Lancez la commande de test intégrée :

```bash
npm run verify-supabase
```

### 5. Démarrer le serveur de développement

```bash
npm run dev
```

## 🔐 Sécurité

- **NE JAMAIS** commiter le fichier `.env.local` dans Git
- **NE JAMAIS** partager la clé `service_role` 
- La clé `anon` peut être utilisée dans le code frontend
- La clé `service_role` ne doit être utilisée que dans le code backend (API routes)

## 📚 Structure de la base de données

Le schéma crée les tables suivantes :
- `profiles` : Profils utilisateurs
- `entreprises` : Entreprises/espaces de travail
- `clients` : Clients des entreprises
- `factures` : Factures
- `lignes_facture` : Lignes de produits/services

## 🚀 Prochaines étapes

Une fois la configuration terminée :
1. Créer les API routes Next.js pour les opérations CRUD
2. Migrer les composants React pour utiliser Supabase
3. Implémenter l'authentification
4. Configurer les RLS (Row Level Security)