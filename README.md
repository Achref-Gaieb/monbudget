<div align="center">

# MonBudget

**Application intelligente de gestion budgétaire permettant de suivre ses revenus, dépenses et objectifs financiers.**

Créez votre budget en moins d'une minute, comprenez où part votre argent et atteignez vos objectifs — sans inscription, avec des données qui restent sur votre appareil.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-149eca?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6?logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06b6d4?logo=tailwindcss)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

</div>

---

## Présentation

MonBudget applique le principe **50/30/20** (besoins / plaisirs / épargne) — et le rend entièrement personnalisable. L'utilisateur saisit ses revenus, choisit une répartition, puis suit ses dépenses au fil du mois. L'application calcule en temps réel ce qui reste, projette la fin du mois, détecte les dépenses inhabituelles et note la santé du budget.

Tout fonctionne **côté client** : aucune donnée n'est envoyée à un serveur, aucun compte n'est nécessaire. La persistance passe par une couche d'abstraction prête à accueillir un backend cloud sans toucher au reste du code.

**Essayer sans rien saisir** : le bouton « Voir une démo » de la page d'accueil charge quatre mois de données d'exemple.

## Fonctionnalités principales

### Création de budget guidée

- Parcours en trois étapes sur une seule page : revenus → répartition → simulation
- Simulation instantanée avec donut animé : montants par enveloppe, revenu disponible, épargne conseillée, reste à vivre
- Méthodes prêtes à l'emploi (50/30/20, 60/20/20, 70/20/10, 33/33/33, 50/20/30) ou répartition personnalisée validée à 100 %

### Suivi et pilotage

- **Catégories** : budget alloué, dépensé, reste, pourcentage utilisé, nombre de dépenses, prévision de fin de mois et écart — recalculés instantanément
- **Dépenses** : récurrentes ou ponctuelles, recherche instantanée, filtres (catégorie, type, montant) et tri
- **Revenus** multiples avec répartition visualisée
- **Alertes** de dépassement aux seuils 80 % / 90 % / 100 %

### Intelligence budgétaire

- **Moteur de prévision** — projection globale et par catégorie à partir du rythme de dépenses et des charges récurrentes
- **Recommandations & anomalies** — part des charges fixes, potentiel d'épargne, dépassement anticipé, dépense inhabituelle, doublons, économies annualisées
- **Score budgétaire 0-100** expliqué composante par composante (épargne, dépassements, stabilité, imprévus, objectifs, équilibre)
- **Simulateur de scénarios** — comparaison temps réel entre la situation actuelle et une nouvelle répartition, courbe d'épargne sur 12 mois

### Organisation

- **Profils de budget** multiples (personnel, couple, famille, freelance…) avec bascule sans perte de données
- **7 templates** prêts à l'emploi : étudiant, jeune actif, famille, couple, indépendant, minimaliste, FIRE
- **Objectifs d'épargne** avec progression, date estimée et projection
- **Gamification** : 8 succès dérivés automatiquement des données
- **Historique mensuel** avec comparaison multi-mois
- **Export** PDF, CSV, Excel et sauvegarde/restauration JSON

### Expérience

- Mode clair par défaut, mode sombre au choix, préférence sauvegardée
- Responsive mobile / tablette / desktop
- Interface bilingue français / anglais
- Devises : €, $, £, MAD, TND, CHF, CAD
- Animations discrètes (Framer Motion) et accessibilité soignée (rôles ARIA, navigation clavier, `prefers-reduced-motion`)

## Technologies utilisées

| Domaine | Choix |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| UI | React 19, TypeScript strict |
| Styles | Tailwind CSS 4, shadcn/ui (Base UI), design tokens CSS |
| Animations | Framer Motion |
| Graphiques | Recharts |
| Icônes | Lucide |
| État | Zustand + middleware `persist` |
| Persistance | LocalStorage via une couche `StorageService` abstraite |
| Exports | jsPDF, SheetJS (xlsx) |

## Installation locale

**Prérequis** : Node.js 20 ou supérieur.

```bash
git clone https://github.com/Achref-Gaieb/monbudget.git
```

```bash
cd monbudget && npm install
```

```bash
npm run dev
```

L'application est disponible sur [http://localhost:3000](http://localhost:3000).

## Variables d'environnement

**Aucune variable n'est requise** pour faire tourner la v1.0.0 : l'application fonctionne entièrement dans le navigateur. Les variables listées dans [`.env.example`](.env.example) préparent les étapes de la roadmap.

```bash
cp .env.example .env.local
```

| Variable | Requise | Rôle |
|---|---|---|
| `NEXT_PUBLIC_APP_URL` | Recommandée | URL publique, utilisée pour les URLs canoniques et les aperçus Open Graph |
| `NEXT_PUBLIC_SUPABASE_URL` | Non | Sauvegarde cloud (roadmap) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Non | Sauvegarde cloud (roadmap) |
| `DATABASE_URL` | Non | Base de données (roadmap) |
| `AUTH_SECRET` | Non | Authentification (roadmap) |
| `STRIPE_SECRET_KEY` | Non | Abonnements Premium (roadmap) |
| `ANTHROPIC_API_KEY` | Non | Assistant IA, côté serveur uniquement (roadmap) |

> ⚠️ Ne jamais committer `.env.local` ni de clés réelles. Le préfixe `NEXT_PUBLIC_` expose la valeur au navigateur : ne l'utilisez que pour des données publiques.

## Commandes disponibles

| Commande | Description |
|---|---|
| `npm run dev` | Serveur de développement (Turbopack) |
| `npm run build` | Build de production |
| `npm start` | Serveur de production (après `build`) |
| `npm run lint` | Analyse ESLint |
| `npx tsc --noEmit` | Vérification TypeScript |

## Structure du projet

```
app/
  page.tsx              # Page d'accueil : création de budget en 3 étapes
  layout.tsx            # Métadonnées SEO, thème initial, providers
  icon.svg              # Favicon
  opengraph-image.tsx   # Image de partage social générée
  creer/                # Assistant de création détaillé
  (app)/                # Pages applicatives (layout avec sidebar)
    dashboard/          # Vue d'ensemble, score, insights, graphiques
    revenus/            # Sources de revenus
    categories/         # Enveloppes budgétaires (drag & drop)
    depenses/           # Dépenses, recherche et filtres
    simulateur/         # Comparaison de scénarios
    objectifs/          # Épargne et succès
    historique/         # Historique et comparaison des mois
    parametres/         # Profils, offre, préférences, export/import
components/
  ui/                   # Primitives shadcn/ui
  charts/               # Graphiques Recharts et heatmap
  quick-budget/         # Module de création rapide (page d'accueil)
  ...                   # Composants métier réutilisables
lib/
  types.ts              # Types du domaine
  store.ts              # Store Zustand (profils, offre, migrations)
  storage.ts            # Abstraction de persistance (LocalStorage → cloud)
  calculations.ts       # Statistiques, prévisions, agrégats
  insights.ts           # Moteur de recommandations et d'anomalies
  score.ts              # Score budgétaire expliqué
  goals.ts              # Progression, jalons, lien épargne ↔ objectifs
  achievements.ts       # Succès (gamification)
  features.ts           # Feature flags Free / Premium
  templates.ts          # Modèles de budgets
  assistant.ts          # Interfaces de l'assistant IA (à brancher)
  tokens.ts             # Tokens de couleur sémantiques
  i18n.ts, use-i18n.ts  # Traductions FR/EN et formatage
  export.ts             # Exports PDF/CSV/Excel/JSON
```

## Déploiement

### Vercel (recommandé)

1. Poussez le dépôt sur GitHub.
2. Sur [vercel.com](https://vercel.com), importez le dépôt — Next.js est détecté automatiquement.
3. Ajoutez la variable `NEXT_PUBLIC_APP_URL` avec l'URL de production.
4. Déployez.

Aucune configuration supplémentaire n'est nécessaire : toutes les pages sont pré-rendues statiquement.

### Autre hébergeur

```bash
npm run build && npm start
```

Le serveur écoute sur le port `3000` (surchargeable via `PORT`).

## Architecture et évolutivité

Le code est organisé pour absorber les étapes suivantes sans réécriture :

- **`lib/storage.ts`** — remplacer l'adaptateur LocalStorage par Supabase, PostgreSQL ou Firebase sans toucher aux composants
- **`lib/features.ts`** — un seul fichier décide de ce qui est Free ou Premium
- **`lib/assistant.ts`** — les interfaces et le contexte structuré de l'assistant IA sont prêts, il ne reste qu'à brancher un fournisseur
- **`lib/tokens.ts` + variables CSS** — aucune couleur d'interface codée en dur, les deux thèmes suivent automatiquement
- **Dépense ou transfert** — chaque mouvement porte un `kind` (`expense` | `transfer`) et un `destinationId`. Aujourd'hui tout vaut `expense`, donc les chiffres sont inchangés ; le jour où un virement vers un ETF doit cesser d'être compté comme une consommation, c'est une donnée à basculer, pas un modèle à refaire
- **Objectifs génériques** — `nom + cible + actuel + contribution`, avec un `type` extensible (`saving`, `debt`, et `investment` déjà réservé)

## Roadmap

- [x] **v1.0.0** — budget 50/30/20 personnalisable, dashboard, prévisions, insights, score, simulateur, profils, objectifs, exports, thèmes clair/sombre
- [x] **v2.0.0** — refonte de l'expérience quotidienne : ajout d'une dépense en deux gestes, accueil compris en 3 secondes, navigation à 5 entrées, onboarding en une question
- [x] **v2.1.0** — répartition en € ou en %, montants épinglés, objectifs épargne/dette avec jalons, lien épargne ↔ objectifs
- [ ] **v2.1.0** — authentification utilisateur (comptes et sessions)
- [ ] **v2.2.0** — base de données cloud et sauvegarde distante
- [ ] **v2.3.0** — synchronisation multi-appareils
- [ ] **v2.4.0** — abonnements Premium (paiement et facturation)
- [ ] **v3.0.0** — assistant IA : « Où part mon argent ? », « Comment économiser 300 € ? »

Le détail des versions publiées est dans [CHANGELOG.md](CHANGELOG.md).

## Confidentialité

Les données sont stockées localement dans le navigateur (`localStorage`), avec une sauvegarde de secours automatique. Rien n'est transmis à un serveur. L'export JSON permet de récupérer l'intégralité de ses données à tout moment.

## Licence

Distribué sous licence MIT — voir [LICENSE](LICENSE).
