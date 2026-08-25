# Changelog

Toutes les évolutions notables de MonBudget sont consignées ici.

Le format suit [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/)
et le projet respecte le [versionnage sémantique](https://semver.org/lang/fr/) :

- **MAJOR** (`v2.0.0`) — changement incompatible (format de données, refonte)
- **MINOR** (`v1.1.0`) — nouvelle fonctionnalité rétrocompatible
- **PATCH** (`v1.0.1`) — correction de bug rétrocompatible

## [2.1.0] — 2026-08-25

Optimisation ciblée : répartir en euros comme on y pense, et donner du sens
à l'épargne en la reliant aux objectifs. Aucun écran ajouté.

### Ajouté

- **Répartition en euros ou en pourcentage** — les deux champs sont côte à côte et éditables ; celui que l'on modifie devient l'épinglé (📌). Un montant épinglé ne bouge plus quand le revenu change : c'est sa part qui est recalculée. À l'inverse, une catégorie laissée libre garde sa part et voit son montant suivre le revenu
- **Répartir le reste** — annonce les montants avant d'agir, puis distribue proportionnellement entre les catégories non épinglées
- **Objectifs de type dette**, avec les libellés adaptés (« remboursé », « reste à rembourser »)
- **Jalons 25 / 50 / 75 / 100 %** en points sobres sous la barre de progression
- **Contribution en un tap** sur le montant mensuel prévu, avec retour immédiat : « 🎯 1 % · d'ici décembre 2034 »
- **Lien épargne ↔ objectifs** — « Épargne mensuelle 1 000 € · affectée 850 € · 150 € non affectés ». Une information, jamais une erreur bloquante
- **Date cible facultative** sur un objectif
- **Bande d'objectifs sur l'accueil**, limitée à deux lignes pour préserver la lecture en trois secondes
- **Modèle « Budget détaillé »** à 9 postes concrets (loyer, courses, transport…), entièrement modifiable

### Modifié

- Création d'un objectif ramenée à **3 champs** (nom, cible, contribution) ; type, montant déjà atteint, date, icône et couleur sont repliés
- La page Objectifs abandonne le graphique de projection au profit de la ligne de rapprochement avec le budget
- Les messages de répartition s'expriment en euros plutôt qu'en pourcentages

### Fondations (préparées, non développées)

Le futur module Investissements pourra arriver sans migration :

- `Expense.kind` (`expense` | `transfer`) distingue l'argent **consommé** de l'argent **déplacé** vers un actif. Tout vaut `expense` par défaut, donc aucun chiffre actuel ne change
- `Expense.destinationId` et `Expense.currency` réservés pour les positions et les actifs libellés en devise
- `Goal.type` accepte déjà `investment` ; les objectifs restent génériques — nom, cible, montant actuel, contribution

Aucun écran, aucune entrée de navigation et aucune information d'investissement
n'a été ajoutée : le cœur du produit reste le budget mensuel.

## [2.0.0] — 2026-08-25

Refonte de l'expérience autour de l'usage quotidien. Priorité donnée au
parcours et à la clarté plutôt qu'au nombre de fonctionnalités : la V2
retire plus qu'elle n'ajoute.

### Ajouté

- **Ajout rapide d'une dépense** — bouton flottant présent sur tous les écrans, puis `montant → catégorie → Ajouter`. La date est aujourd'hui, la couleur vient de la catégorie, le nom est facultatif. Nom, date, note et récurrence sont repliés derrière « Plus d'options »
- **Confirmation utile** après un ajout : « Dépense ajoutée · 8,50 € — Il vous reste 99 € sur Charges ce mois-ci »
- **Barre d'onglets en bas sur mobile** (5 destinations, zones tactiles de 56 px), en remplacement du menu hamburger
- **Page Analyse** (`/analyse`) regroupant score, conseils, prévisions, graphiques et heatmap
- **Répartition en euros** : on saisit « 400 € pour les Plaisirs », le pourcentage est déduit. Les écarts sont annoncés en euros — « Il vous reste 320 € à répartir »
- **Transactions groupées par jour**, avec un total par journée et « Aujourd'hui » / « Hier » en clair
- **États vides utiles** : « Votre mois commence ici » plutôt que « Aucune donnée »
- **Retour positif** : « ✓ Vous êtes dans vos objectifs » quand tout va bien

### Modifié

- **Accueil réduit à l'essentiel** : de 63 à 14 chiffres, de 3,1 à 1,2 écran de défilement, 0 graphique. Il répond à quatre questions — gagné, dépensé, restant, réparti comment
- **Navigation ramenée de 8 à 5 entrées** ; revenus, simulateur et historique sont atteints depuis l'écran auquel ils appartiennent
- **Onboarding en une seule question** — « Combien gagnez-vous par mois ? », 50/30/20 appliqué par défaut. Sources multiples et autres répartitions restent accessibles
- Un utilisateur ayant déjà un budget est **redirigé vers son dashboard** dès l'ouverture du site, sans passer par la page marketing
- Les alertes sont limitées à deux au lieu d'une par catégorie
- Les montants n'affichent des centimes que lorsqu'ils en ont : `8,50 €` mais `1 665 €`
- Les filtres de Transactions sont repliés derrière un bouton

### Retiré

- **Verrouillage Premium** : tout est gratuit. Il dégradait l'expérience de tous les utilisateurs — panneaux floutés, historique tronqué — pour un modèle économique qui n'existe pas encore. Les feature flags restent en place, prêts à être réactivés
- **Succès et badges** de la page Objectifs, contraires à l'intention de ne pas transformer les finances personnelles en jeu
- **Assistant de création `/creer`**, devenu un second chemin vers le même résultat ; l'URL redirige vers l'accueil

### Corrigé

- Une dépense de 8,50 € était confirmée comme « 9 € » : le formateur arrondissait
- Le message de répartition était technique ; il indique désormais ce qu'il reste à répartir, en euros

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

[2.1.0]: https://github.com/Achref-Gaieb/monbudget/compare/v2.0.0...v2.1.0
[2.0.0]: https://github.com/Achref-Gaieb/monbudget/compare/v1.0.0...v2.0.0
[1.0.0]: https://github.com/Achref-Gaieb/monbudget/releases/tag/v1.0.0
