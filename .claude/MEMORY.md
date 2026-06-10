## [2026-05-29] — stratege-editorial

**Fait :** Audit complet du contenu existant (37 pages HTML). Inventaire des sujets couverts dressé. Liste des 15 sujets manquants à fort potentiel SEO produite et remise à l'utilisateur.

**Reste :** Création effective des pages manquantes (à passer via brief à redacteur-seo). Priorité immédiate : simulateur-tjm-journalier.html, micro-entreprise-vs-eurl.html, immatriculation-auto-entrepreneur.html.

**Problèmes :** Aucun. MEMORY.md était vide en entrée.

---

## [2026-05-29] — testeur-qa

**Fait :** Audit complet de tous les calculateurs JS (js/calculators.js, js/ui.js) et des 7 pages HTML cibles. Vérification des taux, plafonds, formules et cas limites.

**Reste :** Appliquer les corrections des bugs listés, notamment l'ordre des scripts dans calculateur-cfe.html et comparateur-statuts.html, et corriger calculerAcre() pour les années 2 et 3.

**Problèmes :**
- BLOQUANT : calculateur-cfe.html et comparateur-statuts.html — js/ui.js chargé APRES le script inline (showToast non défini à l'exécution si le bouton est cliqué avant DOMContentLoaded complet).
- MAJEUR : calculerAcre() — les constantes ACRE_TAUX_REDUCTION_ANNEE_2 (25%) et ANNEE_3 (0%) sont déclarées mais jamais utilisées. La simulation 3 ans n'applique pas la dégression réglementaire — économie = 0 pour A2/A3, mais le tableau laisse croire que "avecAcre = sansAcre" sans explication.
- MAJEUR : Barème moto — paliers 3000 km / 6000 km dans calculerIndemnitesKm() à valider contre le barème officiel DGFiP (les paliers voiture sont 5000/20000 km, les motos ont des paliers distincts).
- MINEUR : MOIS_NOMS déclaré après genererCalendrierDeclarations() dans calculators.js (ligne 360 vs 331). Pas de bug en pratique (hoisting non applicable aux const) si la fonction n'est jamais appelée à l'exécution immédiate.
- MINEUR : verifierPlafond() — quand le CA dépasse à la fois le plafond micro ET le seuil TVA, seul le message "dépassement micro" s'affiche (la condition TVA n'est jamais atteinte car la condition > 100% micro prend priorité).
- OK : Taux URSSAF 2025 dans calculators.js tous corrects (12,3% / 21,2% / 24,6% / 23,2% / 6%).
- OK : Plafonds CA 2025 corrects (188 700 € et 77 700 €). **[Note 2026-06-11 : périmé — plafonds 2026 = 203 100 € / 83 600 €, appliqués sur tout le site.]**
- OK : Calculs de base calculerCharges() et simulerRevenuNet() corrects.
- OK : Gestion ACRE 50% en année 1 correcte.

---

## [2026-05-29] — specialist-adsense

**Fait :** Audit complet AdSense sur 34 pages HTML. Résultat critique : 0 bloc `<ins class="adsbygoogle">` actif sur l'ensemble du site. Seul le script loader est présent dans le `<head>`. Le template contient un bloc commenté (XXXXXXXXXX = slot non configuré). Aucune page ne génère d'impression publicitaire.

**Reste :** Obtenir les data-ad-slot réels depuis le tableau de bord AdSense (ca-pub-2844746944687552), puis injecter 2-3 blocs actifs sur chaque page selon les positions recommandées dans le rapport.

**Problèmes :** BLOQUANT — le site est entièrement non monétisé malgré le script AdSense chargé sur toutes les pages. Revenu publicitaire actuel = 0 €. Manque à gagner estimé à 8–25 € RPM x trafic total (non connu ici).

---

## [2026-05-29] — seo-editorial

**Fait :** Audit SEO on-page complet de 34 pages HTML (title, meta description, canonical, H1, H2, Schema.org, liens internes). Identification des 3 meilleures opportunités de gains rapides avec problèmes précis et valeurs cibles.

**TOP 3 pages à corriger en priorité :**
1. `plafond-chiffre-affaires-micro-entreprise.html` — Schema manquant, title 77 chars, seulement 3 H2, lien footer cassé href="#"
2. `simulateur-revenu-net-auto-entrepreneur.html` — Schema manquant, title 81 chars, seulement 2 H2, contenu éditorial très mince (21 balises p/li)
3. `calendrier-declarations-auto-entrepreneur.html` — Schema manquant, title 72 chars, seulement 2 H2, 22 liens internes

**Reste :** Appliquer les corrections concrètes sur ces 3 pages (nouvelles balises title, meta desc, Schema JSON-LD, H2 éditoriaux supplémentaires).

**Problèmes :** 5 pages sans Schema.org : simulateur-revenu-net, plafond-chiffre-affaires, calendrier-declarations, retraite-auto-entrepreneur, cumul-chomage-auto-entrepreneur. Majorité des pages ont un title > 60 chars (28/34). Plusieurs meta descriptions > 155 chars.

---

## [2026-05-29] — ingenieur-perf

**Fait :** Audit complet Core Web Vitals (css/style.css, js/ui.js, js/calculators.js, index.html, calcul-charges-auto-entrepreneur.html). 14 problèmes identifiés et priorisés.

**Reste :** Appliquer les corrections dans cet ordre de priorité :
1. CRITIQUE LCP : ajouter `preconnect` Google Fonts + `rel="preload"` sur style.css dans les deux HTML
2. CRITIQUE LCP : passer les scripts AdSense/GA/Clarity en `defer` ou déplacer en fin de body (ils sont dans le `<head>` sans `defer`)
3. CRITIQUE CLS : ajouter `min-height` sur les blocs `<ins class="adsbygoogle">` pour réserver l'espace avant chargement AdSense
4. MOYEN INP : supprimer le `setTimeout` 2000ms dans l'IntersectionObserver (force layout thrashing)
5. MOYEN INP : ajouter `{passive: true}` sur le listener `scroll` de la navbar (ligne 20 ui.js)
6. QUICK WIN CSS : supprimer l'animation `flashRed` sur `.progress-bar.danger` (boucle infinie, inutile si pas de plafond dépassé)
7. QUICK WIN CSS : déplacer `<style>` inline de index.html (filter-bar, article-card) vers style.css

**Problèmes :**
- BLOQUANT CLS : blocs `<ins class="adsbygoogle">` sans height réservée → décalage layout à l'affichage AdSense (estimation CLS +0.15)
- BLOQUANT LCP : Google Fonts chargé par `@import` dans CSS (render-blocking double : CSS puis font) — manque `preconnect` sur fonts.googleapis.com et fonts.gstatic.com
- MAJEUR LCP : scripts dans `<head>` (AdSense, GA, Clarity) sans `defer` explicite — GA4 inline script bloque le parser
- MAJEUR scroll-navbar : listener `scroll` sans `{passive: true}` → jank potentiel sur mobile
- MOYEN : `setTimeout(..., 2000)` dans l'IntersectionObserver fallback cause un recalcul de style inutile 2s après le chargement
- MINEUR : `@import` Google Fonts dans CSS non critique (Inter + Playfair Display, 6 variantes) sans `font-display: swap`

---

## [2026-05-29] — designer-uiux

**Fait :** Audit design complet (css/style.css, index.html, guide-auto-entrepreneur-2025.html, calcul-charges-auto-entrepreneur.html). Diagnostic des problèmes d'identité visuelle "site IA" et 12 recommandations CSS/HTML priorisées produites.

**Reste :** Implémenter les corrections dans cet ordre de priorité :
1. Supprimer emojis des blocs CTA inline dans tous les articles (signal "site IA" le plus fort)
2. Corriger background cookie banner : #1E293B → #2D0C00
3. Ajouter règles CSS pour corps de texte articles : color #44403C, line-height 1.8, border-top H2
4. Créer classes .article-cta, .article-toc, .page-header--calc / --article dans style.css
5. Corriger result-panel-header gradient : valeurs hardcodées → variables CSS
6. Sortir .article-card et filtres du style inline dans index.html vers style.css
7. Ajouter barre de progression lecture (3px warm-gradient, position fixed top)

**Problèmes identifiés :**
- MAJEUR : Emojis unicode (🧮💰⚠️📅🎁🚗💚📋) dans contenus éditoriaux et labels résultats — marqueur IA très visible
- MAJEUR : Cookie banner background #1E293B totalement hors palette Terracotta (palette Tailwind slate importée d'un autre projet)
- MAJEUR : .article-card et filtres définis en style inline dans index.html (pas dans style.css) — incohérence système design
- MOYEN : Styles inline massifs et répétitifs dans guide-auto-entrepreneur-2025.html (6 blocs CTA identiques avec ~12 propriétés inline chacun)
- MOYEN : border-radius 20px hardcodé dans plusieurs endroits (outil-moment, blocs guide) au lieu de var(--radius-xl)
- MOYEN : result-panel-header utilise #1C0A00/#7C2D12 au lieu des variables CSS nommées
- FAIBLE : Témoignages visuellement génériques (3 personas archétypaux, étoiles unicode, pas d'italique sur citation)
- FAIBLE : Hero sans texture — fond dégradé CSS pur sans grain ni motif subtil

---

## [2026-05-29] — seo-technique

**Fait :** Audit SEO technique complet (sitemap.xml, robots.txt, balises OG/Twitter, canonical, Schema.org, favicon, preconnect) sur 37 pages HTML.

**Problèmes critiques identifiés :**
- BLOQUANT : 0 favicon ni manifest.json sur le site — signal de crédibilité manquant
- BLOQUANT : 37/39 pages sans og:image — le partage social génère un aperçu blanc (zéro CTR social)
- BLOQUANT : 39/39 pages sans Twitter Card — aucun enrichissement sur X/Twitter
- BLOQUANT : 3 pages sans Schema.org du tout : arret-maladie, cumul-chomage, retraite
- MAJEUR : 34/37 pages sans og:type et sans og:url
- MAJEUR : BreadcrumbList Schema présent uniquement dans _template-article.html (jamais déployé sur les pages réelles)
- MAJEUR : 0 preconnect sur aucune page — Google Fonts, AdSense, GA4, Clarity chargés sans hint réseau
- MAJEUR : tableau-de-bord en priorité 0.9 dans sitemap (app locale, pas une page SEO)
- MAJEUR : lastmod de declaration-impots-auto-entrepreneur = 2026-05-27 (date future erronée)
- MOYEN : index.html référencé comme "/" dans sitemap mais absent du noeud HTML (lien href="index.html" dans nav, pas "/" )
- MOYEN : 63 liens internes avec extension .html dans index.html (incohérent avec canonical sans .html)
- MINEUR : WebSite Schema sans SearchAction sur index.html
- MINEUR : Article Schema sans "publisher" sur certaines pages (incohérence entre pages)
- OK : robots.txt correct (Allow: /, Sitemap pointé)
- OK : canonical sans .html sur toutes les pages (cohérent avec sitemap)
- OK : ads.txt correct (ca-pub-2844746944687552, DIRECT)
- OK : 37 pages présentes dans sitemap (37 URLs hors 404 et template)

**Reste :** Créer favicon + og:image + Twitter Cards. Déployer BreadcrumbList sur toutes les pages. Ajouter preconnect. Corriger lastmod declaration-impots. Réduire priorité tableau-de-bord à 0.5.

---

## [2026-05-29] — dev-accessibilite

**Fait :** Audit WCAG 2.1 AA complet sur index.html, css/style.css, calcul-charges-auto-entrepreneur.html, guide-auto-entrepreneur-2025.html. 16 problèmes identifiés, classés par criticité, avec corrections exactes.

**Problèmes BLOQUANTS (5) :**
- Skip link absent sur toutes les pages (WCAG 2.4.1 A)
- Hamburger <div> non accessible : pas button, pas aria-label, pas aria-expanded (WCAG 4.1.2 A)
- outline:none sans alternative visible sur .form-control et .input-prefix input (WCAG 2.4.7 AA)
- Label "Période" sans fieldset/legend sur le groupe radio (WCAG 1.3.1 A)
- Résultats calculateur non annoncés aux lecteurs d'écran (pas d'aria-live, WCAG 4.1.3 AA)

**Problèmes MAJEURS (6) :**
- --text-light (#A8A29E) ratio ~2,7:1 sur blanc — non conforme AA (WCAG 1.4.3)
- ~40 SVG décoratifs sans aria-hidden="true" focusable="false" sur toutes les pages (WCAG 1.1.1 A)
- FAQ accordéon : .faq-q sont des <div> non focusables, sans aria-expanded (WCAG 4.1.2 A, 2.1.1 A)
- Tooltips visibles uniquement au hover, pas au focus clavier (WCAG 1.4.13 AA)
- Animations flashRed et pulse sans prefers-reduced-motion (WCAG 2.3.3)
- <main> absent de index.html (landmark manquant)

**QUICK WINS identifiés (10) — chacun < 5 min :**
QW1: aria-hidden sur SVG | QW2: aria-label hamburger | QW3: emojis aria-hidden
QW4: emoji cookie banner | QW5: prefers-reduced-motion | QW6: aria-label nav
QW7: aria-live result-panel | QW8: scope tableaux | QW9: target="_blank" sr-only | QW10: skip link

**Reste :** Appliquer les 10 quick wins (env. 30 min total), puis les 6 corrections lourdes (env. 3h total).
**Problèmes :** Aucun autre agent n'a encore appliqué de correctifs accessibilité. Aucune régression à surveiller.

---

## [2026-05-29] — seo-editorial (audit éditorial approfondi)

**Fait :** Audit éditorial complet de 49 pages HTML. Analyse densité de contenu (mots), qualité des H2, maillage interne entrant/sortant, identification des pages thin content. 5 articles de référence lus intégralement.

**TOP 8 pages thin content (< 500 mots) à enrichir en priorité :**
1. `portage-salarial-vs-auto-entrepreneur.html` — 357 mots, 3 H2, 0 liens internes entrants
2. `abattement-forfaitaire-micro-entreprise.html` — 380 mots, lien entrant faible
3. `cotisation-formation-professionnelle-ae.html` — 383 mots, 3 H2, 0 lien entrant
4. `micro-entreprise-vs-eurl.html` — 405 mots, 2 H2, 1 lien entrant
5. `auto-entrepreneur-coach.html` — 424 mots, 3 H2, 1 lien entrant
6. `simulateur-revenu-net-auto-entrepreneur.html` — 442 mots (calculateur = normal mais éditorial insuffisant)
7. `penalites-urssaf-auto-entrepreneur.html` — 465 mots, 4 H2
8. `devis-auto-entrepreneur.html` — 468 mots, 3 H2

**Pages orphelines (0 lien entrant) :**
- `cotisation-formation-professionnelle-ae.html`
- `portage-salarial-vs-auto-entrepreneur.html`
- `seuil-tva-auto-entrepreneur.html`
- `simulateur-retraite-auto-entrepreneur.html`

**Reste :** Enrichir les 8 pages thin content (objectif 800+ mots chacune). Ajouter maillage interne vers les 4 orphelines. Améliorer les H2 de guide-auto-entrepreneur-2025 (contiennent des emojis). La FAQ a ses H2 visuels mais pas structurés par section SEO.

**Problèmes :**
- BLOQUANT : 8 pages avec moins de 500 mots — risque "thin content" Google
- MAJEUR : 4 pages sans aucun lien interne entrant (orphelines)
- MAJEUR : H2 du guide contiennent emojis unicode (signal IA)
- MAJEUR : tva-auto-entrepreneur.html n'a pas de lien vers `seuil-tva-auto-entrepreneur.html` (doublon/cannibalisation potentielle)
- MOYEN : frais-deductibles ne lie pas vers `declaration-impots` alors que les sujets sont intimement liés
- MINEUR : faq-auto-entrepreneur ne contient que 2 questions dans le Schema FAQPage (sur 30 disponibles)

---

## [2026-05-29] — dev-calculateurs

**Fait :** Analyse complète de calculators.js (namespace CAE, 8 fonctions, constantes 2025), calcul-charges-auto-entrepreneur.html et simulateur-revenu-net-auto-entrepreneur.html. Roadmap technique des 5 nouveaux calculateurs produite avec formules précises, inputs/outputs, cas limites et estimation de complexité.

**Reste :** Implémenter dans cet ordre de priorité : C (projeterSeuilTva — 4h), A (calculerTjm — 5h), D (calculerTrimestresRetraite — 4h), E (calculerAbattement — 3h), B (calculerImpotIR + comparerVflVsIr — 8h). Ajouter 4 constantes dans calculators.js : ABATTEMENTS_MICRO_2025, ABATTEMENT_MINIMUM_2025, SMIC_HORAIRE_2025, SEUIL_VFL_PAR_PART_2025. Corriger le bug calculerAcre() (années 2 et 3) avant de lancer les nouveaux outils.

**Problèmes :**
- VIGILANCE : Barème IR 2025 non encore publié — utiliser barème 2024 avec disclaimer dans calculateur VFL.
- VIGILANCE : SMIC potentiellement revalorisé au 1er mai 2025 (valeur 11,88 EUR/h certaine au 1er nov 2024).
- VIGILANCE : Seuil accès VFL (RFR N-2 par part ~27 478 EUR) à confirmer via BOFiP.
- BUG CONNU : calculerAcre() — ACRE_TAUX_REDUCTION_ANNEE_2 et ANNEE_3 déclarées mais inutilisées.

---

## [2026-05-29] — ingenieur-perf (audit CSS/JS approfondi, passe 2)

**Fait :** Audit ligne par ligne css/style.css (1025 lignes), js/calculators.js (725 lignes), js/ui.js (374 lignes), js/consent.js (44 lignes). 18 problèmes identifiés et classés.

**Reste :** Appliquer correctifs dans cet ordre : (1) remplacer `background: white` par `var(--white)` dans style.css — 14 occurrences, (2) supprimer doublon tooltip lines 655-675, (3) corriger btn-success:hover, (4) déplacer ABATTEMENTS_2025 et MOIS_NOMS avant leurs fonctions dans calculators.js, (5) supprimer `joursConges_`, (6) corriger fallback tauxVfl dans calculerTjm, (7) supprimer `.tools-grid-4`.

**Problèmes :**
- BLOQUANT dark mode : 14 occurrences `background: white` hardcodé dans style.css (non surchargé par body.dark-theme) -- affecte .card, .tool-card, .calc-panel-header, .faq-q, .btn-secondary, .page-header, .seo-content, .testimonial-card, .hero-badge, .nav-links mobile. Correction : `var(--white)`.
- MAJEUR CSS : doublon `.tooltip-content` -- `white-space: nowrap` (l.666) immédiatement annulé par `white-space: normal` (l.672) dans le même bloc.
- MAJEUR CSS : `.btn-success:hover { background: #059669 }` identique à `var(--secondary)` -- le hover n'a aucun effet visuel sur le fond.
- MAJEUR JS : `ABATTEMENTS_2025` (const l.635) utilisé dans `comparerVflVsIr` (l.510) -- const déclaré APRES la fonction. Pas de ReferenceError à l'exécution (corps de fonction) mais ordering très risqué.
- MAJEUR JS : `MOIS_NOMS` (const l.363) utilisé dans `genererCalendrierDeclarations` (l.329) -- même problème d'ordering.
- MOYEN JS : `joursConges_` (l.562 calculators.js) -- variable calculée et non utilisée dans `calculerTjm`.
- MOYEN JS : `tauxVfl` fallback `|| 0` dans `calculerTjm` (l.551) incohérent avec `|| 0.017` dans les autres fonctions.
- MOYEN JS : `tauxAcre` (l.552) variable intermédiaire redondante dans `calculerTjm`.
- MOYEN JS : `showToast` hardcode `color:#1E293B` (Tailwind slate, hors palette) -- non adapté au dark mode.
- MINEUR CSS : `.tools-grid-4` jamais utilisé dans aucun HTML (sélecteur mort).
- MINEUR CSS : `border-radius: 100px` répété 8 fois -- candidat à une variable `--radius-pill`.
- MINEUR JS : `window.shareCurrentUrl` défini dans le bloc DOMContentLoaded -- devrait être à top-level.
- OK : consent.js est correct et robuste -- vérification `accepted`/`refused`, double-injection protégée par `querySelector`.
- OK : scroll listener navbar et lecture tous les deux `{passive: true}` -- INP mobile correct.
- OK : toutes les fonctions exposées dans `window.CAE` sont effectivement utilisées dans les pages HTML.

---

## [2026-05-29] — redacteur-seo (réécriture encodage)

**Fait :** Réécriture complète des 3 pages thin content identifiées par seo-editorial (audit éditorial approfondi). Bug d'encodage corrigé (accents et apostrophes absents). Contenu enrichi à 800+ mots chacun.
- `auto-entrepreneur-coach.html` : 7 H2/H3, tableau 4 activités, certifications BPJEPS/ICF/EMCC, fiscalité formateurs, tarification, assurances RC Pro, 4 FAQ
- `portage-salarial-vs-auto-entrepreneur.html` : tableau comparatif 10 critères, simulation chiffrée 60 000 € (AE vs portage), 2 sections quand choisir, transition portage→AE en 5 étapes, 4 FAQ
- `cotisation-formation-professionnelle-ae.html` : tableau 4 taux CFP + OPCO, explication prélèvement URSSAF, CPF (500–800 €/an), 3 OPCO (AGEFICE/FIFPL/FAFCEA), 4 étapes pour demander financement, formations finançables, différence CFP vs CPF, 4 FAQ
- Navbar complète alignée sur calcul-charges-auto-entrepreneur.html (7 liens + hamburger + theme-toggle)
- Cookie banner corrigé : texte complet avec AdSense + Analytics + Clarity
- Taux URSSAF 2025 officiels respectés (21,2%, 24,6%, CFP 0,1%–0,3%)
- Aucune balise AdSense supprimée ou modifiée

**Reste :** Déploiement GitHub Pages (agent github-pages-deploy). Maillage entrant vers cotisation-formation-professionnelle-ae.html et portage-salarial-vs-auto-entrepreneur.html depuis les autres articles (pages orphelines).

**Problèmes :** Aucun. Les 3 fichiers passent de 350–425 mots à 800–1000 mots. Le bug d'encodage (pas d'accents) est intégralement corrigé.

---

## [2026-05-29] — reviewer-code

**Fait :** Audit d'intégrité complet du site (53 fichiers HTML, 3 fichiers JS, CNAME, .nojekyll, ads.txt, robots.txt, sitemap.xml). Vérification : liens internes, scripts JS, balises AdSense, consent.js, cookie banner, favicon, meta description, canonical, viewport, taux URSSAF, frameworks JS, XSS.

**Résultats :**
- OK : CNAME (wensurco.fr) et .nojekyll présents
- OK : 0 lien cassé sur l'ensemble des 53 pages HTML
- OK : js/calculators.js, js/ui.js, js/consent.js présents
- OK : Tous les taux URSSAF 2025 corrects dans calculators.js (12.3% / 21.2% / 24.6%)
- OK : Plafonds 2025 corrects dans calculators.js (188 700 € / 77 700 €) **[Note 2026-06-11 : périmé — calculators.js utilise désormais PLAFONDS_CA 2026 = 203 100 € / 83 600 €.]**
- OK : consent.js présent dans `<head>` sur TOUTES les pages
- OK : Cookie banner (cookie-banner div + acceptCookies() + refuseCookies()) sur toutes les pages
- OK : Favicon présent sur toutes les pages
- OK : Meta description présente sur toutes les pages
- OK : Canonical sans .html sur toutes les pages
- OK : Balise viewport (responsive) présente sur toutes les pages
- OK : ID AdSense ca-pub-2844746944687552 correct sur toutes les pages monétisées
- OK : 0 framework JS importé (la mention "Vue.js" dans auto-entrepreneur-developpeur-web.html est du contenu éditorial, pas un import)
- OK : 0 vulnérabilité XSS détectée (innerHTML limité à ICONS.sun/moon et feedback "Copié !" — sources internes uniquement)
- OK : Les 4 nouveaux calculateurs présents et fonctionnels (formulaire + JS + résultats + 2 blocs AdSense chacun)
- OK : Les 10 nouveaux articles présents avec tous les éléments obligatoires

**Problèmes à surveiller (non bloquants pour l'intégrité, déjà signalés par d'autres agents) :**
- ATTENTION : 5 pages légitimement sans AdSense : 404.html, _template-article.html, confidentialite.html, mentions-legales.html, tableau-de-bord.html
- ATTENTION : 6 pages avec seulement 1 bloc AdSense (au lieu de 2 recommandés) : calculateur-cfe.html, calendrier-declarations-auto-entrepreneur.html, comparateur-statuts.html, faq-auto-entrepreneur.html, index.html, simulateur-revenu-net-auto-entrepreneur.html
- NOTE : Les slots data-ad-slot sont numériques et valides (aucun XXXXXXXXXX résiduel)

**Reste :** Appliquer les corrections déjà identifiées par les agents précédents (bugs calculerAcre, dark mode background:white, order const JS). Ajouter un 2e bloc AdSense sur les 6 pages sous-monétisées.

**Problèmes :** Aucun blocant nouveau identifié. Intégrité structurelle du site confirmée.

---

## [2026-05-30] — PLAN D'AUDIT RESTANT (à reprendre après /clear)

Source : analyse approfondie 5 agents. Déjà fait & publié (commit 6744674) : bugs JS VFL/abattements (C5, C6, T2) + 4 pages encodage réécrites. **Ce qui reste à faire :**

### 🔴 Critique
- **C2** — `index.html` : 8 cartes article placées HORS du conteneur `#articles-grid` (cassent la grille / le rendu).
- **C3** — Double bloc AdSense en double après `</footer>` (à dédupliquer).
- **C4** — `404.html` charge Google Analytics + Microsoft Clarity SANS attendre le consentement (non conforme RGPD ; doit passer par consent.js comme les autres pages).

### 🟠 Majeur
- **M1** — Dark mode : ~14 occurrences `background:white` en dur → remplacer par `var(--white)`.
- **M2** — Enrichir les pages thin content (contenu trop court).
- **M5** — Cannibalisation SEO entre `seuil-tva` et `tva` (fusionner / différencier l'intention).
- **M6** — Schema FAQPage : passer de 2 à 17 Q/R (aligner JSON-LD sur le contenu réel).
- **M7** — Navbar incohérente entre pages (uniformiser).
- **M8** — 6 pages avec un seul bloc AdSense (ajouter le 2e) : calculateur-cfe.html, calendrier-declarations-auto-entrepreneur.html, comparateur-statuts.html, faq-auto-entrepreneur.html, index.html, simulateur-revenu-net-auto-entrepreneur.html.
- **M9** — Cookie banner : uniformiser le texte/comportement sur toutes les pages.

### 🟡 Moyen (T1, T3–T9)
- **T1** — Style `.btn-success:hover` manquant.
- **T3** — Doublon `tooltip { white-space: nowrap }`.
- **T4** — Couleur violette résiduelle `#5B21B6` (hors charte orange).
- **T5–T9** — Détails CSS/SEO mineurs (re-auditer pour la liste exacte).

**Règles à respecter** : ne jamais toucher aux balises AdSense, pas de framework, taux URSSAF officiels (12,3% / 21,2% / 24,6%), canonical sans .html, une seule h1, contenu en français.
