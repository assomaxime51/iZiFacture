# 📊 Rapport d'Analyse du Projet : iZiFacture

---

## 1. Nom du projet et objectif

* **Nom du projet :** **iZiFacture** (`izifacture` dans `package.json`).
* **Objectif :**
  iZiFacture est une application web SaaS de facturation et de gestion commerciale conçue pour les indépendants, freelances et TPE/PME (avec un ancrage spécifique pour la zone Afrique de l'Ouest / UEMOA : montants exprimés en **FCFA**, TVA standard à **18 %**, champ d'identification fiscale **NINEA**, et prise en compte des modes de paiement locaux comme Wave / Orange Money).
* **Mission principale :**
  Offrir une plateforme épurée permettant de :
  1. Gérer des espaces de travail multi-entreprises avec isolation des données.
  2. Créer, éditer, catégoriser et suivre le cycle de vie des factures (Brouillon, Envoyée, Payée, En retard).
  3. Gérer un répertoire client complet (entreprises ou particuliers).
  4. Suivre en temps réel les indicateurs de trésorerie (total facturé, total encaissé, créances en attente).
  5. Imprimer ou exporter les factures et synthèses financières.

---

## 2. Technologies utilisées

### Frontend
* **Framework :** Next.js (version `^16.3.5` avec l'App Router `src/app`).
* **Bibliothèque UI :** React (`18.3.1`) et React-DOM (`18.3.1`).
* **Langage :** TypeScript (`^5.7.2`).
* **Styling & CSS :**
  * Tailwind CSS (`^3.4.16`), PostCSS et Autoprefixer.
  * Design system personnalisé dans `src/app/globals.css` avec palette thématique sur mesure (`ink`, `sage`, `cream`, `navy`) et classes utilitaires dédiées (`.ds-card`, `.ds-button-primary`, `.ds-status`, etc.).
* **Icônes :** Lucide React (`^0.468.0`).
* **Composants interactifs sur mesure :**
  * `custom-select.tsx` : Select stylisé avec recherche intégrée.
  * `date-picker.tsx` : Calendrier personnalisé développé en React natif.
  * `global-search-modal.tsx` : Recherche rapide globale avec raccourci clavier `Ctrl+K`.
  * *(Remarque sur les dépendances)* : `date-fns` et `react-day-picker` figurent dans le `package.json` mais ne sont pas utilisés dans le code source actuel.

### Backend & API
* **Next.js Route Handlers** (API REST interne sous `src/app/api/`) :
  * `/api/factures` et `/api/factures/[id]` : gestion CRUD des factures et de leurs lignes.
  * `/api/clients` et `/api/clients/[id]` : gestion CRUD des clients et calculs associés.
  * `/api/entreprises` et `/api/entreprises/[id]` : gestion CRUD des espaces de travail / entreprises.
* **Sécurisation des routes API :** Contrôleur centralisé `src/lib/api-auth.ts` qui valide le jeton JWT Bearer via Supabase Auth et vérifie l'appartenance des ressources (`getOwnedEntrepriseIds`).

### Base de données, Authentification & BaaS
* **Plateforme :** **Supabase** (PostgreSQL managé) via le SDK officiel `@supabase/supabase-js` (`^2.116.0`).
* **Architecture BDD :**
  * Schéma relationnel détaillé : tables `profiles`, `entreprises`, `clients`, `factures`, `lignes_facture`.
  * Scripts SQL disponibles : `supabase-schema.sql`, `supabase-rls.sql` et `supabase-all-in-one.sql`.
  * Triggers PostgreSQL automatiques pour le calcul des totaux TTC/TVA à 18 % et la synchronisation de `updated_at`.
* **Authentification & Sécurité :**
  * Supabase Auth (Email / Mot de passe).
  * Double client : client public anonyme (`supabase`) pour le front et client administrateur avec clé de service (`supabaseAdmin`) sécurisé côté serveur.
  * **Row Level Security (RLS)** activé sur toutes les tables pour garantir l'isolation des données entre utilisateurs.
  * Composant `AuthGuard` et contexte React `AuthContext`.

### Scripts & Outils d'exploitation
* `scripts/verify-supabase.mjs` : script autonome Node.js pour tester la connectivité et la présence des tables Supabase.
* `ouvrir-izifacture.bat` : script de lancement Windows ciblant le port 3007.

---

## 3. Arborescence des dossiers et fichiers principaux

*(Exclusion faite de `node_modules`, `.git`, `.next`, `dist`, `build`, `out` et `.vscode`)*

```
iZiFacture/
├── .env.local                     # Variables d'environnement locales (non versionnées)
├── .env.local.example             # Modèle de variables d'environnement
├── .eslintrc.json                 # Configuration ESLint
├── .gitignore                     # Règles d'exclusion Git
├── AGENTS.md                      # Règles et consignes Next.js / IA
├── CLAUDE.md                      # Référence de configuration
├── FINALIZATION_GUIDE.md          # Guide de migration vers Supabase
├── Gemini.md                      # Documentation technique du projet
├── SUPABASE_SETUP.md              # Procédure de déploiement Supabase
├── next.config.mjs                # Configuration Next.js (strictMode, trailingSlash)
├── ouvrir-izifacture.bat          # Script de démarrage Windows (port 3007)
├── package.json                   # Dépendances et scripts npm
├── postcss.config.mjs             # Configuration PostCSS
├── tailwind.config.ts             # Configuration et thème Tailwind CSS
├── tsconfig.json                  # Configuration TypeScript
├── supabase-schema.sql            # Schéma SQL des tables et déclencheurs
├── supabase-rls.sql               # Politiques de sécurité RLS
├── supabase-all-in-one.sql        # Script d'installation global tout-en-un
├── scripts/
│   └── verify-supabase.mjs        # Script de test de connexion Supabase
└── src/
    ├── app/
    │   ├── layout.tsx             # Layout racine (AuthProvider + AuthGuard)
    │   ├── page.tsx               # Route racine ("/") -> DashboardShell
    │   ├── globals.css            # Styles globaux et variables de thème
    │   ├── api/
    │   │   ├── clients/
    │   │   │   ├── route.ts       # GET (liste) et POST (création)
    │   │   │   └── [id]/
    │   │   │       └── route.ts   # GET, PUT, DELETE par identifiant
    │   │   ├── entreprises/
    │   │   │   ├── route.ts       # GET et POST des espaces de travail
    │   │   │   └── [id]/
    │   │   │       └── route.ts   # GET, PUT, DELETE par identifiant
    │   │   └── factures/
    │   │       ├── route.ts       # GET (filtres statut/client) et POST
    │   │       └── [id]/
    │   │           └── route.ts   # GET, PUT, DELETE par UUID ou numéro
    │   ├── auth/
    │   │   └── login/
    │   │       └── page.tsx       # Page de connexion et inscription Supabase
    │   ├── clients/
    │   │   ├── page.tsx           # Page liste des clients
    │   │   └── new/
    │   │       └── page.tsx       # Page d'ajout d'un client
    │   ├── invoices/
    │   │   ├── page.tsx           # Page liste des factures
    │   │   ├── new/
    │   │   │   └── page.tsx       # Page création d'une facture
    │   │   └── [number]/
    │   │       ├── page.tsx       # Page détail d'une facture
    │   │       └── edit/
    │   │           └── page.tsx   # Page de modification de facture
    │   ├── profile/
    │   │   └── page.tsx           # Page profil utilisateur
    │   ├── reports/
    │   │   └── page.tsx           # Page des rapports financiers
    │   ├── settings/
    │   │   └── page.tsx           # Page des paramètres généraux
    │   ├── support/
    │   │   └── page.tsx           # Page support et aide
    │   └── workspace/
    │       └── page.tsx           # Page de sélection / gestion des espaces
    ├── components/
    │   ├── app-shell.tsx          # Coquille globale (Sidebar + Header + Actions)
    │   ├── auth-guard.tsx         # Protection de routes privées
    │   ├── client-form.tsx        # Formulaire de création de client
    │   ├── client-list.tsx        # Tableau et modale de gestion des clients
    │   ├── create-workspace-modal.tsx # Modale d'ajout d'espace de travail
    │   ├── custom-select.tsx      # Composant déroulant avec filtre
    │   ├── dashboard-shell.tsx    # Vue d'ensemble avec KPIs et dernières factures
    │   ├── date-picker.tsx        # Sélecteur de date interactif
    │   ├── global-search-modal.tsx# Recherche globale (Ctrl+K)
    │   ├── icons.tsx              # Centralisation des icônes Lucide
    │   ├── invoice-detail.tsx     # Fiche complète d'une facture (actions & impression)
    │   ├── invoice-form.tsx       # Formulaire de saisie d'une facture
    │   ├── invoice-list.tsx       # Liste filtrable des factures
    │   ├── notifications-popover.tsx # Popover des notifications récentes
    │   ├── profile-view.tsx       # Vue d'édition du profil
    │   ├── reports-view.tsx       # Graphiques et métriques d'analyse financière
    │   ├── revenue-chart-card.tsx # Composant de graphique SVG (non raccordé)
    │   ├── settings-pages.tsx     # Enrobage des pages de configuration
    │   ├── settings-view.tsx      # Panneau de réglages (Entreprise, Facturation, Sécurité)
    │   ├── sidebar-user-card.tsx  # Carte d'identité utilisateur dans la sidebar
    │   └── user-profile-menu.tsx  # Menu déroulant de l'utilisateur
    ├── contexts/
    │   └── auth-context.tsx       # Contexte React global pour auth et workspace actif
    ├── data/
    │   ├── app-data.ts            # Types, fonction formatXof et données de test historiques
    │   └── dashboard.ts           # Types et données statiques d'origine
    └── lib/
        ├── api.ts                 # Client HTTP avec injection du token Bearer
        ├── api-auth.ts            # Middleware utilitaire d'authentification des routes API
        └── supabase.ts            # Initialisation des clients Supabase et types de BDD
```

---

## 4. Fonctionnalités développées vs Fonctionnalités incomplètes

### ✅ Fonctionnalités développées et connectées au backend
1. **Authentification complète (Supabase Auth) :**
   * Connexion et inscription avec email/mot de passe (`src/app/auth/login/page.tsx`).
   * Gestion de la session et écoute en temps réel (`onAuthStateChange`).
   * Protection automatique de toutes les pages privées avec redirection vers `/auth/login` via `AuthGuard`.
   * Déconnexion sécurisée réinitialisant l'état et le `localStorage`.
2. **Multi-entreprises / Espaces de travail (Workspaces) :**
   * Création d'espaces de travail via `CreateWorkspaceModal`.
   * Changement dynamique de l'espace actif avec mémorisation dans le `localStorage`.
   * Suppression d'un espace avec bascule automatique sur un autre espace disponible.
3. **Gestion des Clients (CRUD complet) :**
   * Liste des clients chargée depuis `/api/clients` filtrée par entreprise active.
   * Ajout de clients via page dédiée (`/clients/new`) ou via modale intégrée dans la liste.
   * Modification et suppression de clients.
   * Calcul côté API du nombre de factures et du chiffre d'affaires cumulé par client.
4. **Création et Consultation de Factures :**
   * Formulaire de création (`/invoices/new`) avec sélection du client réel, dates d'émission et d'échéance, lignes d'articles dynamiques, calcul automatique du sous-total, de la TVA (18 %) et du total TTC.
   * Enregistrement en mode « Brouillon » ou « Envoyée ».
   * Génération automatique du numéro séquentiel de facture (`FAC-AAAA-XXXX`).
   * Tableau filtrable (`/invoices`) par statut et par mot-clé de recherche client.
   * Page de détail (`/invoices/[number]`) affichant l'intégralité des lignes, montants, coordonnées client et notes.
   * Changement de statut direct (`updateFacture`) et suppression de facture.
5. **Tableau de bord (Dashboard) connecté :**
   * Métriques calculées dynamiquement sur les factures réelles de l'espace actif (Total facturé, Encaissé, En attente, En retard).
   * Liste des dernières factures émises avec statut visuel.
   * Compteurs de clients et factures de l'espace.
6. **Recherche Globale (Ctrl+K) :**
   * Interrogation en direct des factures et clients de l'espace actif avec navigation clavier.
7. **Sécurité multi-tenant côté API :**
   * Les routes API vérifient systématiquement que les factures et clients demandés ou créés appartiennent bien à une entreprise détenue par l'utilisateur connecté.

---

### ⚠️ Fonctionnalités incomplètes, factices ou nécessitant une finalisation
1. **Édition de facture non fonctionnelle (`/invoices/[number]/edit`) :**
   * Le fichier `src/app/invoices/[number]/edit/page.tsx` rend le composant `<InvoiceForm />` sans lui passer de paramètres ni charger la facture existante. Le formulaire s'ouvre donc vierge au lieu de pré-remplir la facture ciblée.
2. **Génération PDF et envoi d'emails réels :**
   * L'export PDF dans la fiche facture repose sur `window.print()` (boîte d'impression native du navigateur). Il n'y a pas de moteur de génération PDF téléchargeable (ex: `@react-pdf/renderer` ou `puppeteer`).
   * L'action « Envoyer la facture » met à jour le statut en base de données mais n'envoie aucun email (aucun service transactionnel comme Resend ou SendGrid n'est configuré).
3. **Module Rapports (`/reports`) en données codées en dur :**
   * Le composant `reports-view.tsx` affiche des graphiques et chiffres basés sur un objet statique (`reportsData` avec des données fixes de "Juin 2024"). Il n'est pas encore relié aux factures réelles en base de données.
   * L'export CSV des rapports télécharge uniquement ces données fictives.
4. **Paramètres de facturation et sécurité non persistés :**
   * Dans `settings-view.tsx`, les coordonnées bancaires (IBAN, Swift, Banque) et mentions légales ne sont pas enregistrées en base (les colonnes n'existent pas dans la table `entreprises`).
   * Le changement de mot de passe et la révocation des sessions distantes affichent un toast de confirmation mais n'appellent pas les fonctions Supabase réelles.
5. **Profil utilisateur (`/profile`) non connecté :**
   * Le bouton « Enregistrer » du composant `profile-view.tsx` déclenche un toast sans mettre à jour la table `profiles` ni les métadonnées de l'utilisateur.
6. **Notifications non dynamiques :**
   * `notifications-popover.tsx` contient une liste de fausses notifications prédéfinies et n'interroge pas les factures réellement en retard.
7. **Onboarding lors de la première inscription :**
   * Lorsqu'un utilisateur crée un compte, aucun espace de travail n'est créé automatiquement par défaut. Si l'utilisateur tente immédiatement de créer un client ou une facture, l'API renvoie une erreur 400 (`entreprise_id` manquant).
8. **Composant orphelin :**
   * `revenue-chart-card.tsx` (qui contient un graphique SVG d'évolution des revenus) a été retiré du dashboard principal et n'est plus importé nulle part.

---

## 5. Contenu du fichier package.json

Voici le contenu exact du fichier `package.json` du projet :

```json
{
  "name": "izifacture",
  "version": "1.0.0",
  "description": "",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "verify-supabase": "node scripts/verify-supabase.mjs"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "type": "module",
  "dependencies": {
    "@supabase/supabase-js": "^2.116.0",
    "date-fns": "^4.4.0",
    "lucide-react": "^0.468.0",
    "next": "^16.3.5",
    "react": "^18.3.1",
    "react-day-picker": "^10.0.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@types/node": "^20.17.10",
    "@types/react": "^18.3.12",
    "@types/react-dom": "^18.3.1",
    "autoprefixer": "^10.4.20",
    "eslint": "^8.57.1",
    "eslint-config-next": "14.2.35",
    "postcss": "^8.4.49",
    "tailwindcss": "^3.4.16",
    "typescript": "^5.7.2"
  }
}
```

---

## 6. Fichiers principaux à examiner en priorité

1. `src/contexts/auth-context.tsx` : Gère l'état global de session Supabase, la liste des entreprises de l'utilisateur, l'espace actif dans le `localStorage` et les opérations CRUD sur les espaces.
2. `src/components/auth-guard.tsx` : Intercepteur React protégeant toutes les pages de l'application en redirigeant les utilisateurs non connectés vers `/auth/login`.
3. `src/lib/supabase.ts` : Initialise le client public Supabase et le client administrateur (`supabaseAdmin`), et définit les types TypeScript correspondant aux tables SQL.
4. `src/lib/api-auth.ts` : Utilitaire serveur garantissant la sécurité multi-tenant en validant le token Bearer et en restreignant les requêtes aux seules entreprises appartenant à l'utilisateur.
5. `src/lib/api.ts` : Couche d'abstraction côté client regroupant tous les appels HTTP vers les routes internes en injectant automatiquement le token de session.
6. `src/app/api/factures/route.ts` et `src/app/api/factures/[id]/route.ts` : Cœur de l'API de facturation gérant la création avec numérotation automatique, le calcul des montants, la synchronisation des lignes et la suppression.
7. `src/components/invoice-form.tsx` : Formulaire interactif de saisie des factures avec gestion dynamique des lignes, sélection client et calcul en temps réel de la TVA (18 %).
8. `src/components/invoice-detail.tsx` : Affichage complet de la facture sous format papier/document avec options d'impression, changement d'état et suppression.
9. `src/components/dashboard-shell.tsx` : Composant principal de la page d'accueil calculant les KPIs financiers et affichant les factures récentes de l'espace actif.
10. `supabase-all-in-one.sql` : Script SQL complet définissant la structure des 5 tables, les triggers de calcul automatique et les politiques de sécurité RLS.

---

## 7. Erreurs et difficultés techniques identifiées

1. **Rupture sur la page d'édition de facture :**
   * Dans `src/app/invoices/[number]/edit/page.tsx`, `<InvoiceForm />` est instancié sans props. Or, le composant `InvoiceForm` ne prend aucun argument et ne sait pas pré-charger une facture existante. Il est donc actuellement impossible de modifier une facture depuis l'interface sans réécrire ce composant.
2. **Absence de flux d'onboarding (blocage lors de la création de compte) :**
   * À la création d'un nouveau compte, l'utilisateur n'a aucun espace de travail rattaché (`entreprises = []`). Or, les routes POST `/api/factures` et `/api/clients` exigent impérativement un `entreprise_id` sous peine de renvoyer une erreur `400 Bad Request`. Une redirection ou création automatique d'un premier espace est nécessaire.
3. **Disparité des versions Next.js / ESLint :**
   * Le projet utilise `next: ^16.3.5` (version récente avec `params` asynchrones dans l'App Router) couplé à `eslint-config-next: 14.2.35`. Cette différence de version majeure est susceptible de déclencher des erreurs lors du build ou de l'analyse statique (`npm run lint`).
4. **Dépendances inutilisées :**
   * `react-day-picker` et `date-fns` sont installés dans les dépendances, mais le composant `date-picker.tsx` a été réécrit de zéro sans faire appel à ces paquets.
5. **Localisation incomplète dans le DatePicker :**
   * Dans `date-picker.tsx`, les tableaux `DAYS_OF_WEEK` et `MONTH_NAMES` sont restés en anglais ("January", "February", "Su", "Mo"...) alors que toute l'application et les montants monétaires sont en français.
6. **Formulaires déconnectés de la persistance :**
   * Les pages Profil (`profile-view.tsx`) et certains paramètres de facturation/sécurité (`settings-view.tsx`) ne sauvegardent pas leurs données dans la base de données Supabase.
7. **Conflit potentiel de ports locaux :**
   * Les fichiers de logs indiquent que le port 3000 était régulièrement utilisé par un autre processus. Le script batch `ouvrir-izifacture.bat` force le port 3007 (`-- -p 3007`), ce qui est un contournement efficace, mais il convient de s'assurer de la cohérence de l'URL accédée dans le navigateur (`localhost:3000`, `3001` ou `3007`).

---

## 8. Instructions pour lancer le projet localement

### Prérequis
* Node.js (version 18.x ou 20.x LTS recommandée).
* Un projet Supabase actif.

### Étape 1 : Installation des dépendances
Ouvrez un terminal dans le dossier racine du projet et exécutez :
```bash
npm install
```

### Étape 2 : Configuration des variables d'environnement
À la racine du projet, créez ou vérifiez le fichier `.env.local` (en vous basant sur `.env.local.example`) :
```env
NEXT_PUBLIC_SUPABASE_URL=https://<VOTRE-PROJET-ID>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<VOTRE-CLE-PUBLIQUE-ANON>
SUPABASE_SERVICE_ROLE_KEY=<VOTRE-CLE-SECRETE-SERVICE-ROLE>
```
*(Remarque de sécurité : Ne commitez jamais ce fichier sur un dépôt Git distant).*

### Étape 3 : Initialisation de la base de données Supabase
1. Rendez-vous sur votre tableau de bord Supabase dans la section **SQL Editor**.
2. Copiez l'intégralité du fichier `supabase-all-in-one.sql`.
3. Collez-le dans l'éditeur SQL et cliquez sur **Run** pour créer les tables, les clés étrangères, les déclencheurs de calcul de montants et les règles RLS.
4. Dans **Authentication > Providers**, vérifiez que le fournisseur **Email** est activé.

### Étape 4 : Test de diagnostic Supabase
Exécutez le script de contrôle intégré pour valider que Next.js parvient à communiquer avec Supabase :
```bash
npm run verify-supabase
```
Le terminal doit confirmer la présence et l'accessibilité des 5 tables (`profiles`, `entreprises`, `clients`, `factures`, `lignes_facture`).

### Étape 5 : Lancement du serveur de développement

* **Méthode standard (tous OS) :**
  ```bash
  npm run dev
  ```
  L'application sera accessible sur `http://localhost:3000` (ou `http://localhost:3001` si le port 3000 est occupé).

* **Méthode rapide sous Windows :**
  Double-cliquez sur le fichier `ouvrir-izifacture.bat`, qui démarre automatiquement le serveur sur le port `3007` et ouvre la page dans votre navigateur par défaut (`http://localhost:3007`).

### Étape 6 : Première utilisation
1. Ouvrez `http://localhost:3000/auth/login` (ou le port utilisé).
2. Renseignez un email et un mot de passe (au moins 6 caractères) et cliquez sur **Créer un compte**.
3. Une fois connecté, rendez-vous d'abord dans l'onglet **Espace de travail** (`/workspace`) pour créer votre première entreprise.
4. Vous pouvez ensuite ajouter vos clients (`/clients`) et générer vos factures (`/invoices/new`).
