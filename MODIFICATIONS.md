# Journal des Modifications — wensurco.fr (CalcAutoEntrepreneur)

Ce document consigne l'ensemble des modifications apportées au projet de manière autonome par l'IA Antigravity pour améliorer le design, le référencement (SEO), l'utilité globale et les performances du site.

---

## 1. Intégration de Google Analytics 4 & Microsoft Clarity (27 mai 2026)

Pour suivre le trafic des utilisateurs et comprendre leur comportement (dans le but d'optimiser le taux de conversion et les revenus publicitaires AdSense) :
- **Google Analytics 4** : Création et configuration de la propriété avec l'identifiant de mesure `G-4H7VPXJ6KS`.
- **Microsoft Clarity** : Configuration du projet avec l'identifiant de suivi `wxp28322ek`.
- **Injection automatique** : Les scripts de suivi GA4 et Clarity ont été injectés dans la section `<head>` de l'intégralité des **32 fichiers HTML** existants à cette date.
- **Déploiement** : Mise en ligne réussie sur Netlify.

---

## 2. Création de l'Article Final : Auto-Entrepreneur Immobilier (27 mai 2026)

Le 24ème et dernier article prévu pour couvrir tout l'écosystème de la micro-entreprise en France a été créé.
- **Fichier créé** : `auto-entrepreneur-immobilier.html`
- **Contenu** : Article rédigé en français, structuré pour le SEO (> 1500 mots), incluant :
  - La distinction entre agent commercial immobilier et mandataire.
  - La règle légale stricte de la **Loi Hoguet** (interdiction pour un auto-entrepreneur de détenir la **Carte T** en nom propre ; obligation d'exercer sous mandat d'habilitation).
  - Les taux de cotisations sociales applicables en **2025** pour l'activité de prestations de services / BNC (**24,6%** de charges sociales).
  - Le plafond de chiffre d'affaires 2025 de **77 700 €**.
  - L'abattement fiscal forfaitaire de **34%** (BNC).
  - L'obligation de souscription à une assurance **RC Pro** et de s'inscrire au **RSAC** (Greffe du Tribunal de Commerce).
  - Un exemple de calcul concret montrant l'impact des frais réels non déductibles sur les commissions d'un mandataire.
  - Des liens internes vers nos outils (`calcul-charges-auto-entrepreneur.html`, `simulateur-revenu-net-auto-entrepreneur.html`, `rc-pro-auto-entrepreneur.html`).
- **Scripts et monétisation** : Intégration du bandeau cookie, de l'AdSense Client `ca-pub-2844746944687552`, ainsi que des balises GA4 et Clarity dans le `<head>`.
- **Lien depuis la page d'accueil** : Ajout d'une carte d'aperçu pour cet article dans la grille « Guides & Articles » de `index.html`.
- **Mise à jour du sitemap** : Ajout de la nouvelle URL canonique `https://wensurco.fr/auto-entrepreneur-immobilier` dans `sitemap.xml`.

---

## 3. Mise à jour de la documentation projet (27 mai 2026)
- **Fichier modifié** : `ANTIGRAVITY_CONTEXT.md` mis à jour pour déplacer le sujet `auto-entrepreneur-immobilier` de la liste des sujets restants vers la liste des sujets déjà traités. Les 24 articles prévus sont désormais tous rédigés et publiés.

---

## 4. Plan d'Action d'Amélioration du Site (27 mai 2026)

Mise en œuvre autonome du plan d'action d'amélioration globale approuvé par Antoine :
- **Activation du Simulateur ACRE** : Le bouton ACRE sur la page d'accueil pointe désormais vers `calcul-acre-auto-entrepreneur.html`.
- **Mode Sombre / Mode Clair (Dark Mode)** :
  - Variables de couleurs et règles de bascule ajoutées dans `css/style.css` via le sélecteur `body.dark-theme`.
  - Intégration automatique d'un bouton de thème dans le menu de navigation de l'ensemble des **33 pages HTML** du site (via script Node.js).
  - Gestion du chargement immédiat (pour éviter le flash blanc), de la mémorisation locale (`localStorage`) et de la synchronisation de l'icône (Soleil / Lune) dans `js/ui.js`.
- **Création du Comparateur de Statuts** :
  - **Fichier créé** : `comparateur-statuts.html`
  - **Logique** : Ajout de la fonction `CAE.comparerStatuts(ca, expenses, type)` dans `js/calculators.js` comparant le revenu net de poche annuel restant après cotisations et impôts entre Auto-entrepreneur, EURL (IS) et SASU (Dividendes et Salaires).
  - **Graphique** : Intégration d'une fonction `drawBarChart(svgId, data)` dans `js/ui.js` pour dessiner des barres de comparaison SVG dynamiques animées.
  - **Conseil automatisé** : Algorithme délivrant une recommandation textuelle adaptée au profil saisi.
- **Création du Calculateur de CFE** :
  - **Fichier créé** : `calculateur-cfe.html`
  - **Logique** : Ajout de `CAE.calculerCfe(ca, communeTaux)` dans `js/calculators.js` estimant la CFE 2025 selon la commune et les règles de chiffre d'affaires N-2, avec détection automatique des critères d'exonération totale (première année civile d'activité, ou CA ≤ 5 000 €).
- **Mise à jour du sitemap et de l'index** :
  - Indexation des deux nouvelles pages dans `sitemap.xml`.
  - Remplacement des mentions "Coming soon" sur la page d'accueil par des liens actifs vers `comparateur-statuts.html` et `calculateur-cfe.html`.

---

## 5. Création du Tableau de Bord Personnel (SaaS Client-Side) (27 mai 2026)

Mise en place d'un espace complet de pilotage et gestion de la micro-entreprise, autonome et 100% côté client (`localStorage`) :
- **Fichier créé** : [tableau-de-bord.html](file:///c:/Users/linkl/Desktop/CalcAutoEntrepreneur/tableau-de-bord.html)
- **Fonctionnalités clés** :
  - **Livre des Recettes (CRUD)** : Possibilité d'ajouter et de supprimer des factures encaissées avec nom de client, montant, date et type d'activité.
  - **Indicateurs clés (KPIs)** : Affichage en temps réel du chiffre d'affaires cumulé annuel, des cotisations URSSAF 2025 estimées (comprenant l'option ACRE) et du revenu net restant disponible.
  - **Suivi des Seuils 2025** : Jauges de progression dynamiques avec codes couleur (vert/orange/rouge) pour suivre les limites de franchise de TVA (Prestations de services à 36 800 € et Ventes à 91 900 €) ainsi que le plafond global de la micro-entreprise de services (77 700 €).
  - **Graphique mensuel interactif** : Rendu d'un graphique SVG représentant les encaissements par mois, doté d'effets de survol (tooltips).
- **Navigation globale** : Injection automatisée du lien "Tableau de bord" dans les en-têtes (navbar) de l'ensemble des **36 fichiers HTML** du site (marqué comme `active` sur la page du tableau de bord).
- **Sitemap** : Ajout de la nouvelle URL canonique `/tableau-de-bord` au fichier [sitemap.xml](file:///c:/Users/linkl/Desktop/CalcAutoEntrepreneur/sitemap.xml).



---

## 2026-05-27 18:35:16 — Article généré : Déclaration Impôts Auto-Entrepreneur 2025 : Guide Complet

- **Fichier** : `declaration-impots-auto-entrepreneur.html`
- **Catégorie** : Fiscalité
- **URL** : https://wensurco.fr/declaration-impots-auto-entrepreneur
- **Déploiement** : https://6a1739614aa124ba62777d5e--autoentrepreneurcalc.netlify.app
- **Mots-clés** : impôts, déclaration, fiscal, 2042, revenus
- **Générateur** : automation/director.js (Anthropic Claude)
