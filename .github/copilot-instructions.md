# Regle de reference UI iZiFacture

Pour toute nouvelle page, tout nouveau composant ou toute modification d'interface dans ce projet, respecter le design system iZiFacture existant avant d'ajouter un nouveau style.

## Direction visuelle

- Construire une interface SaaS de facturation claire, dense, professionnelle et facile a scanner.
- Utiliser les tokens Tailwind de `tailwind.config.ts` et les primitives CSS de `src/app/globals.css` avant toute valeur arbitraire.
- Conserver la palette : fond `cream`, surfaces blanches, texte `ink`, accent `sage`, navigation `navy`, bordure `line`.
- Utiliser Manrope pour les titres et DM Sans pour le texte courant.
- Utiliser des rayons de 12px pour les controles et 16px pour les panneaux.
- Utiliser des bordures fines, des ombres discretes et une hierarchie visuelle sobre. Ne pas empiler des cartes dans des cartes.

## Composants et etats

- Reutiliser les patterns existants pour boutons, cartes, badges de statut, tableaux, navigation, erreurs, chargement et etats vides.
- Les statuts de facture gardent leurs couleurs semantiques : vert payee, bleu envoyee, orange en attente, rouge en retard, gris brouillon.
- Chaque bouton doit avoir un etat hover, active, focus-visible et disabled si pertinent.
- Les icones viennent de `lucide-react`, avec un label accessible pour les boutons icon-only.
- Les montants utilisent le format FCFA sans decimales et les dates le format jour/mois/annee.

## Motion

- Utiliser des transitions courtes d'environ 180ms avec une acceleration naturelle.
- Les actions principales peuvent se soulever legerement au survol, changer de teinte et renforcer leur ombre.
- Utiliser les apparitions progressives avec moderation; l'animation ne doit jamais retarder l'usage.
- Respecter obligatoirement `prefers-reduced-motion`.

## Responsive obligatoire

- Toute interface doit fonctionner de 280px a 768px et au-dela, sans debordement horizontal global.
- Ne jamais utiliser une largeur fixe pour le contenu principal; preferer `minmax(0, 1fr)`, `w-full`, `max-w-*` et des contraintes fluides.
- Tester au minimum les largeurs 280, 320, 375, 430 et 768px.
- Sur mobile, empiler les blocs, rendre les actions principales accessibles, conserver des zones tactiles confortables et transformer les tableaux en conteneurs defilables explicites.
- La navigation desktop devient une sidebar mobile ouvrable avec hamburger, overlay et fermeture accessible.
- Verifier que les textes, boutons, graphiques et badges restent contenus et lisibles sur chaque largeur.

## Validation avant livraison

- Verifier le typage et l'absence d'erreurs dans l'editeur.
- Executer le build ou le test le plus proche du changement.
- Tester le rendu desktop et mobile, dont l'absence de scroll horizontal involontaire.
- Ne pas introduire de dependance, couleur, rayon, espacement ou animation qui contredit ce referentiel sans raison explicite.
