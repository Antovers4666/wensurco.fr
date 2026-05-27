# Projet wensurco.fr — CalcAutoEntrepreneur

## Contexte
Site de calcul gratuit et d'articles SEO pour auto-entrepreneurs français.
Monétisé exclusivement via Google AdSense (client `ca-pub-2844746944687552`).
Déployé sur Netlify via le script PowerShell `./deploy-netlify.ps1`.

## Stack technique
- HTML5 / CSS3 / JavaScript **vanilla uniquement** — aucun framework
- CSS global : `css/style.css` avec variables CSS sur `:root` et `body.dark-theme`
- `js/calculators.js` : logique mathématique (namespace `CAE`)
- `js/ui.js` : Dark Mode, navigation, graphiques SVG
- Google Analytics 4 : `G-4H7VPXJ6KS`
- Microsoft Clarity : `wxp28322ek`

## Structure du projet
- 36 fichiers HTML à la racine
- 24 articles SEO (> 1500 mots, en français)
- `index.html` : page d'accueil avec grille `<div class="articles-grid">`
- `sitemap.xml` : à mettre à jour à chaque nouvel article

## Règles absolues — ne jamais enfreindre
1. **Langue** : tout le contenu généré est en français
2. **Pas de framework** : uniquement HTML/CSS/JS vanilla
3. **Ne jamais toucher** à `css/style.css` sauf instruction explicite
4. **Ne jamais toucher** à `js/calculators.js` sauf instruction explicite
5. **Canonical sans .html** : `<link rel="canonical" href="https://wensurco.fr/[slug]">`
6. **Une seule balise `<h1>`** par page, placée au début du contenu

## Répartition des tâches IA
- **Toi (Claude Code)** : logique Node.js, parsing HTML, scripts d'automatisation, QA
- **API Gemini** (`gemini-2.5-pro` ou `gemini-2.5-flash`) : rédaction des articles HTML
- Clé API Gemini dans `.env` → variable `GEMINI_API_KEY`
- **Économise tes tokens** : délègue toujours la rédaction longue à Gemini

## Objectif principal en cours
Construire le script `/automation/generator.js` qui :
1. Choisit un sujet (fichier config ou appel Gemini)
2. Appelle l'API Gemini pour générer l'article HTML complet
3. Valide automatiquement le HTML généré (QA)
4. Écrit le fichier à la racine du projet
5. Met à jour `sitemap.xml`
6. Injecte une carte dans `index.html` (dans `<div class="articles-grid">`)
7. Lance `./deploy-netlify.ps1` pour déployer

## Structure obligatoire de chaque article généré
```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>[Titre ≤ 60 caractères]</title>
  <meta name="description" content="[120-160 caractères]">
  <link rel="canonical" href="https://wensurco.fr/[slug-sans-html]">
  <!-- Google Analytics 4 -->
  <!-- Microsoft Clarity wxp28322ek -->
  <!-- AdSense ca-pub-2844746944687552 -->
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
  <!-- Navbar standard avec : liens calculateurs, bouton Tableau de bord, CTA Calculer, switch Dark Mode -->
  <h1>[Titre unique]</h1>
  <section class="seo-content">
    <!-- h2, h3, contenu > 1500 mots -->
    <!-- Minimum 3 liens internes contextuels vers calculateurs ou articles existants -->
  </section>
  <!-- Footer réglementaire -->
  <!-- Bandeau RGPD cookies (acceptCookies / refuseCookies) -->
  <script src="js/ui.js"></script>
</body>
</html>
```

## Critères de validation QA (à vérifier après chaque génération)
- [ ] Plus de 800 mots dans le contenu
- [ ] Une seule balise `<h1>`
- [ ] Canonical présente et sans `.html`
- [ ] Navbar contient tous les éléments obligatoires
- [ ] Scripts GA4, Clarity et AdSense présents
- [ ] Minimum 3 liens internes contextuels

## Fichiers de log à mettre à jour après chaque action
- `MODIFICATIONS.md` : ajouter une entrée décrivant ce qui a été fait
- `ANTIGRAVITY_CONTEXT.md` : mettre à jour l'état du projet

## Commandes utiles
```bash
# Déployer sur Netlify
./deploy-netlify.ps1

# Lancer le générateur d'articles
node automation/generator.js

# Vérifier les fichiers HTML existants
ls *.html | wc -l
```

## Pages calculateurs existantes (pour les liens internes)
- `calcul-charges-auto-entrepreneur.html`
- `simulateur-revenu-net-auto-entrepreneur.html`
- `plafond-chiffre-affaires-micro-entreprise.html`
- `indemnites-kilometriques-2025.html`
- `calcul-acre-auto-entrepreneur.html`
- `calendrier-declarations-auto-entrepreneur.html`
- `comparateur-statuts.html`
- `calculateur-cfe.html`
- `tableau-de-bord.html`
