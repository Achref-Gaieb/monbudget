# Changelog

Toutes les évolutions notables de MonBudget sont consignées ici.

Le format suit [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/)
et le projet respecte le [versionnage sémantique](https://semver.org/lang/fr/) :

- **MAJOR** (`v2.0.0`) — changement incompatible (format de données, refonte)
- **MINOR** (`v1.1.0`) — nouvelle fonctionnalité rétrocompatible
- **PATCH** (`v1.0.1`) — correction de bug rétrocompatible

## [Non publié]

Voir la [roadmap](README.md#roadmap).

## [1.0.0] — 2026-08-02

Première version publique.

### Ajouté

- **Création de budget** — parcours en trois étapes sur la page d'accueil (revenus → répartition → simulation instantanée) et assistant détaillé sur `/creer`
- **Méthodes de répartition** — 50/30/20, 50/20/30, 60/20/20, 70/20/10, 33/33/33 et répartition personnalisée validée à 100 %
- **Catégories** — création, couleur, icône, pourcentage, réorganisation par glisser-déposer, et affichage permanent du budget, du dépensé, du reste, du pourcentage utilisé, du nombre de dépenses, de la prévision de fin de mois et de l'écart
- **Dépenses** — récurrentes ou ponctuelles, recherche instantanée, filtres et tri
- **Dashboard** — cartes animées, alertes de dépassement (80 / 90 / 100 %), statistiques de période, camembert, prévu vs dépensé, évolution mensuelle, répartition des revenus et heatmap
- **Moteur de prévision** — projection de fin de mois globale et par catégorie
- **Moteur de recommandations et d'anomalies** — dépassement anticipé, dépense inhabituelle, doublons, potentiel d'épargne, économies annualisées
- **Score budgétaire** 0-100 expliqué par composante
- **Simulateur de scénarios** avec comparaison temps réel et projection d'épargne sur 12 mois
- **Profils de budget** multiples et 7 templates (étudiant, jeune actif, famille, couple, indépendant, minimaliste, FIRE)
- **Objectifs d'épargne** avec progression, date estimée et projection
- **Gamification** — 8 succès dérivés des données
- **Historique** mensuel avec comparaison multi-mois
- **Exports** PDF, CSV, Excel et sauvegarde/restauration JSON
- **Offres Free / Premium** pilotées par feature flags, avec bascule de démonstration
- **Paramètres** — devise, langue (FR/EN), thème, couleur d'accent, profil
- **Architecture** — couche de persistance abstraite (`lib/storage.ts`) et interfaces d'assistant IA (`lib/assistant.ts`) prêtes pour un backend cloud

### Modifié

- Mode clair adopté comme thème par défaut ; le mode sombre et le suivi du système restent disponibles et la préférence est sauvegardée
- Toutes les couleurs d'interface passent par des tokens sémantiques (variables CSS) afin de s'adapter aux deux thèmes

### Corrigé

- Les compteurs animés pouvaient rester figés sur une valeur périmée : écrire `textContent` dans un nœud dont React gérait les enfants détachait le nœud texte suivi par React. Le composant possède désormais son contenu et se stabilise même lorsque les animations sont suspendues (onglet en arrière-plan).

[Non publié]: https://github.com/Achref-Gaieb/monbudget/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/Achref-Gaieb/monbudget/releases/tag/v1.0.0
