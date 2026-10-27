# iZiFacture - Documentation Complète

## Ce que l'application fait

iZiFacture est une application web de facturation et gestion commerciale conçue pour les petites entreprises et freelances. Elle permet de :

- **Créer et gérer des factures** : Édition de factures avec lignes de produits/services, calcul automatique des montants, gestion des taxes (TVA 18%)
- **Gérer les clients** : Répertoire professionnel avec informations de contact, historique de facturation
- **Suivre les paiements** : Dashboard avec statistiques en temps réel, graphiques d'évolution des encaissements
- **Générer des rapports** : Export CSV/PDF, analyse par périodes (12 mois, semestres, trimestres)
- **Interface multiespace** : Support pour plusieurs espaces de travail/entreprises

## Fonctionnalités Implémentées

### Dashboard Principal
- **Cartes de statistiques** : Total facturé, total encaissé, en attente, factures en retard
- **Graphique d'évolution des encaissements** : Courbe SVG interactive avec plusieurs périodes
- **Répartition des factures** : Graphique circulaire par statut (Payées, Envoyées, En retard, Brouillons)
- **Tableau des dernières factures** : Liste rapide avec statuts colorés
- **Actions rapides** : Créer une facture, ajouter un client
- **Tooltip d'aide** : Point d'interrogation interactif sur la section répartition

### Gestion des Factures
- **Liste complète** : Filtrage par statut, recherche par client
- **Création de factures** : Formulaire avec sélection de client, dates, lignes de produits
- **Calcul automatique** : Sous-total, TVA (18%), total TTC
- **Gestion des lignes** : Ajout/suppression de lignes, quantité, prix unitaire
- **Statuts** : Brouillon, Envoyée, Payée, En retard
- **Actions** : Sauvegarder brouillon, envoyer facture

### Gestion des Clients
- **Liste de clients** : Cartes avec informations de contact
- **Création de clients** : Formulaire avec type (entreprise/particulier), coordonnées complètes
- **Édition** : Modification des informations client
- **Suppression** : Avec confirmation
- **Statistiques** : Nombre de factures, total facturé par client

### Fonctionnalités Techniques
- **Recherche globale** : Modal accessible via Ctrl+K
- **Notifications** : Popover avec indicateur
- **Menu utilisateur** : Profil, paramètres
- **Navigation responsive** : Sidebar mobile/desktop
- **Export de données** : CSV et PDF pour les rapports
- **Objectifs mensuels** : Configuration et suivi des objectifs de chiffre d'affaires

## Structure des Fichiers

```
iZiFacture/
├── src/
│   ├── app/                      # Pages Next.js (App Router)
│   │   ├── layout.tsx           # Layout racine
│   │   ├── page.tsx             # Page d'accueil (Dashboard)
│   │   ├── invoices/            # Pages factures
│   │   │   ├── page.tsx         # Liste des factures
│   │   │   ├── new/             # Création facture
│   │   │   │   └── page.tsx
│   │   │   └── [number]/        # Pages dynamiques facture
│   │   │       ├── page.tsx     # Détail facture
│   │   │       └── edit/        # Édition facture
│   │   │           └── page.tsx
│   │   ├── clients/             # Pages clients
│   │   │   ├── page.tsx         # Liste clients
│   │   │   └── new/             # Création client
│   │   │       └── page.tsx
│   │   ├── reports/             # Rapports
│   │   │   └── page.tsx
│   │   ├── settings/            # Paramètres
│   │   │   └── page.tsx
│   │   ├── support/             # Support
│   │   │   └── page.tsx
│   │   ├── profile/             # Profil utilisateur
│   │   │   └── page.tsx
│   │   └── workspace/           # Espace de travail
│   │       └── page.tsx
│   │
│   ├── components/              # Composants React
│   │   ├── app-shell.tsx        # Layout principal (sidebar + header)
│   │   ├── dashboard-shell.tsx  # Layout spécifique dashboard
│   │   ├── invoice-form.tsx     # Formulaire création facture
│   │   ├── invoice-list.tsx    # Liste des factures
│   │   ├── invoice-detail.tsx  # Détail d'une facture
│   │   ├── client-form.tsx      # Formulaire création client
│   │   ├── client-list.tsx      # Liste des clients
│   │   ├── revenue-chart-card.tsx  # Graphique évolution
│   │   ├── custom-select.tsx    # Select personnalisé
│   │   ├── date-picker.tsx      # Sélecteur de date
│   │   ├── global-search-modal.tsx  # Modal recherche globale
│   │   ├── notifications-popover.tsx  # Popover notifications
│   │   ├── user-profile-menu.tsx    # Menu utilisateur
│   │   ├── sidebar-user-card.tsx    # Carte utilisateur sidebar
│   │   ├── icons.tsx            # Icônes Lucide React
│   │   ├── settings-view.tsx   # Vue paramètres
│   │   ├── settings-pages.tsx  # Pages paramètres
│   │   ├── profile-view.tsx    # Vue profil
│   │   └── reports-view.tsx     # Vue rapports
│   │
│   └── data/                    # Données de l'application
│       ├── dashboard.ts         # Données dashboard
│       └── app-data.ts          # Données générales (clients, factures)
│
├── package.json                 # Dépendances npm
├── tsconfig.json               # Configuration TypeScript
├── tailwind.config.ts          # Configuration Tailwind CSS
├── next.config.mjs             # Configuration Next.js
└── postcss.config.mjs          # Configuration PostCSS
```

## Technologies Utilisées

### Framework & Core
- **Next.js 14.2.35** : Framework React avec App Router
- **React 18.3.1** : Bibliothèque UI
- **TypeScript 5.7.2** : Typage statique

### Styling
- **Tailwind CSS 3.4.16** : Framework CSS utility-first
- **PostCSS 8.4.49** : Traitement CSS
- **Autoprefixer 10.4.20** : Préfixes CSS automatiques

### UI Components
- **Lucide React 0.468.0** : Bibliothèque d'icônes
- **React Day Picker 10.0.1** : Sélecteur de date
- **date-fns 4.4.0** : Manipulation de dates

### Développement
- **ESLint 8.57.1** : Linting JavaScript/TypeScript
- **ESLint Config Next 14.2.35** : Configuration ESLint pour Next.js

## Décisions de Design

### Architecture des Composants
- **Séparation des responsabilités** : Chaque composant a une fonction unique
- **Composants de layout** : `AppShell` et `DashboardShell` pour la structure commune
- **Composants réutilisables** : CustomSelect, DatePicker pour la cohérence UI

### Design System
- **Palette de couleurs personnalisée** :
  - `ink` (#17221d) : Texte principal
  - `sage` (#557b68) : Accent vert
  - `cream` (#f7f8f4) : Fond clair
  - `navy` (#101827) : Sidebar sombre
  - Couleurs de statut : `status-paid`, `status-sent`, `status-late`, `status-draft`

- **Typographie** :
  - `font-display` : Manrope pour les titres
  - `font-sans` : DM Sans pour le corps

- **Border radius** :
  - `panel` (16px) : Cartes et conteneurs
  - `control` (12px) : Boutons et inputs

### Gestion d'État
- **État local** : Utilisation de `useState` pour les composants individuels
- **Pas de gestion d'état global** : Données stockées dans fichiers TypeScript
- **Navigation** : Next.js Link pour la navigation entre pages

### UX/UI
- **Responsive design** : Sidebar mobile/desktop, grilles adaptatives
- **Accessibilité** : Labels ARIA, navigation clavier (Ctrl+K)
- **Feedback utilisateur** : Toast notifications, états de chargement
- **Animations** : Transitions fluides avec `transition-motion`

### Données
- **Données mockées** : Fichiers TypeScript avec données de démonstration
- **Types TypeScript** : Interfaces strictes pour les données
- **Formattage** : Fonctions utilitaires pour les montants FCFA

## Instructions pour Futur Modèle IA

### Principes à Respecter
1. **Maintenir la cohérence du design system** : Utiliser les couleurs et classes Tailwind définies
2. **Suivre le pattern de composants** : Créer des composants réutilisables et modulaires
3. **TypeScript strict** : Toujours définir les interfaces et types pour les nouvelles fonctionnalités
4. **Accessibilité** : Ajouter les labels ARIA et supporter la navigation clavier
5. **Responsive first** : Tester sur mobile et desktop pour chaque nouvelle fonctionnalité

### Conventions de Code
- **Nom des fichiers** : kebab-case pour les composants (`invoice-form.tsx`)
- **Nom des composants** : PascalCase (`InvoiceForm`)
- **Utilisation des hooks** : "use client" pour les composants interactifs
- **Imports** : Alias `@/` pour les imports relatifs
- **Classes Tailwind** : Préférer les classes utilitaires au CSS inline

### Structure des Nouvelles Fonctionnalités
1. **Créer le type TypeScript** dans `src/data/app-data.ts` ou un nouveau fichier
2. **Créer le composant** dans `src/components/`
3. **Créer la page** dans `src/app/` si nécessaire
4. **Intégrer dans le layout** : Utiliser `AppShell` ou `DashboardShell`
5. **Ajouter la navigation** : Mettre à jour les menus dans les layouts

### Gestion des Données
- **Actuellement** : Données stockées dans fichiers TypeScript (mock data)
- **Futur** : Prévoir l'intégration d'une base de données ou API
- **Types à respecter** : `Client`, `InvoiceRecord`, `InvoiceLine`, `InvoiceStatus`

### Tests et Validation
- **Tester sur mobile** : Responsivité cruciale pour l'UX
- **Vérifier l'accessibilité** : Navigation clavier, lecteurs d'écran
- **Valider les formulaires** : Messages d'erreur clairs
- **Performance** : Optimiser les rendus et les imports

### Internationalisation
- **Langue actuelle** : Français
- **Format monétaire** : FCFA (Franc CFA)
- **Format de date** : Format français (DD/MM/YYYY)

### Patterns Réutilisables
- **Modals** : Pattern similaire à `GlobalSearchModal`
- **Popovers** : Pattern similaire à `NotificationsPopover`
- **Formulaires** : Pattern similaire à `ClientForm` et `InvoiceForm`
- **Listes** : Pattern similaire à `InvoiceList` et `ClientList`

### Fonctionnalités à Implémenter (Idées)
- **Persistance des données** : Intégration base de données/API
- **Authentification** : Système de login/logout
- **Export PDF réel** : Génération de PDF pour les factures
- **Notifications email** : Envoi automatique des factures
- **Tableau de bord avancé** : Plus de graphiques et filtres
- **Multi-devises** : Support de plusieurs devises
- **Collaboration** : Multi-utilisateurs par espace de travail

### Note Importante
Ce fichier doit être maintenu à jour à chaque modification majeure du projet pour servir de référence continue pour les futurs développements IA.