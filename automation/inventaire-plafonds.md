# Inventaire plafonds CA — migration 188 700 € / 77 700 € → 203 100 € / 83 600 €

> Généré le 2026-06-10 — diagnostic en lecture seule, AUCUN fichier modifié.
> Regex utilisée : `188[^0-9]?700|77[^0-9]?700` (couvre « 188 700 », « 188700 », etc.)
> **84 occurrences** dans **23 fichiers** : 10 en logique JS (`js/calculators.js`), 6 en logique+affichage (`tableau-de-bord.html`), 64 en texte affiché (19 pages HTML), 4 dans les CLAUDE.md.
> Nouveaux plafonds 2026 (vérifiés par Antoine sur sources officielles le 2026-06-10) : ventes/hébergement **203 100 €**, services/libéraux **83 600 €**.

---

## Catégorie 1 — LOGIQUE de calcul (à modifier avec tests)

### `js/calculators.js` (10 occurrences) — source de vérité des calculateurs

| Ligne | Code | Rôle |
|---|---|---|
| 33 | `vente_marchandises: 188700,` | Constante `PLAFONDS_CA_2025` (nom gardé par convention du chantier 2026, valeurs à migrer) |
| 34 | `services_commerciaux: 77700,` | idem |
| 35 | `liberal_bnc: 77700,` | idem |
| 36 | `liberal_cipav: 77700,` | idem |
| 37 | `meuble_tourisme: 188700,` | idem — ⚠️ vérifier si le meublé de tourisme suit bien le plafond ventes 203 100 € |
| 38 | `artisanal: 77700,` | idem |
| 97 | `const plafond = PLAFONDS_CA_2025[type] \|\| 77700;` | Fallback dans `calculerCharges()` (calculateur de charges) |
| 151 | `const plafondAnnuel = PLAFONDS_CA_2025[type] \|\| 77700;` | Fallback dans `verifierPlafond()` (calculateur de plafond) |
| 581 | `const plafond = PLAFONDS_CA_2025[type] \|\| 77700;` | Fallback dans le simulateur TJM (`depassePlafond`) |
| 609 | `const seuilMicro = PLAFONDS_CA_2025[type] \|\| 77700;` | Fallback dans `projeterSeuilTva()` |

→ **Action** : mettre à jour les 6 valeurs de la constante + les 4 fallbacks `|| 77700` → `|| 83600`. Tester les 4 calculateurs après modification (testeur-qa).

### `tableau-de-bord.html` (6 occurrences) — JS inline + affichage couplé

| Ligne | Contenu | Type |
|---|---|---|
| 342 | `Math.min((allAmounts.services / 77700) * 100, 100)` | **Logique** : jauge % du plafond |
| 464 | `// 3. CA Services Ceiling (threshold 77,700 €)` | Commentaire |
| 465 | `const caServicesPct = Math.min((serviceCa / 77700) * 100, 100);` | **Logique** : jauge % |
| 508 | `${CAE.formatEuro(77700 - serviceCa)}` dans l'alerte 🚨 | **Logique** : montant restant avant plafond |
| 202 | `Sur 77 700 €` | Affichage (libellé de la jauge) |
| 470 | `` `${CAE.formatEuro(serviceCa)} / 77 700 €` `` | Affichage dans template literal JS |

→ **Action** : logique + affichage à changer ensemble (sinon jauge incohérente avec le libellé).

---

## Catégorie 2 — TEXTE AFFICHÉ dans les pages (64 occurrences, 19 pages)

### 2a. ⚠️ Valeurs DÉRIVÉES à RECALCULER (pas un simple chercher-remplacer)

| Fichier:ligne | Valeur actuelle | Nouveau calcul (plafond 83 600 €) |
|---|---|---|
| auto-entrepreneur-consultant.html:237 | TJM max **388 €/j** (= 77 700 ÷ 200 j) | **418 €/j** (= 83 600 ÷ 200) |
| auto-entrepreneur-developpeur-web.html:266 | TJM max **388 €/j** (avec la formule « 77 700 ÷ 200 » écrite en toutes lettres) | **418 €/j** (« 83 600 ÷ 200 ») |
| auto-entrepreneur-consultant.html:171 | Ligne de tableau « 77 700 € (plafond) → 19 891 € / 9 946 € / 57 809 € » (BNC 25,6 %) | 83 600 € → **21 402 €** cotis. / **10 701 €** ACRE / **62 198 €** net |
| auto-entrepreneur-formateur.html:194 | Même ligne « 77 700 € (plafond) → 19 891 / 9 946 / 57 809 » | Mêmes nouveaux montants que ci-dessus |
| auto-entrepreneur-developpeur-web.html:195 | « 77 700 € (plafond) → 16 472 € / 8 236 € / 61 228 € » (BIC 21,2 %) | 83 600 € → **17 723 €** / **8 862 €** / **65 877 €** |
| depasser-plafond-micro-entreprise.html:196-200 | Proratisation : 1er avril ≈ **58 562 €**, 1er juillet ≈ **39 156 €**, 1er octobre ≈ **19 578 €** | ≈ **62 986 €**, ≈ **42 144 €**, ≈ **21 072 €** |
| depasser-plafond-micro-entreprise.html:304 | Exemple prorata « 77 700 × (184/365) ≈ 39 156 € » | « 83 600 × (184/365) ≈ 42 144 € » |

⚠️ Les taux de cotisations dans ces tableaux (25,6 % BNC / 21,2 % BIC) sont déjà à jour 2026 — ne recalculer QUE la colonne dépendant du plafond.

### 2b. Remplacements simples (mention du plafond, à actualiser vers les valeurs + année 2026)

| Fichier | Lignes | Contexte |
|---|---|---|
| auto-entrepreneur-artisan-batiment.html | 88, 102 | Tableau taux/plafonds + FAQ « le plafond de 77 700 € inclut-il les matériaux ? » |
| auto-entrepreneur-coach.html | 130, 136, 142, 148 | Colonne « plafond » du tableau des types de coaching (×4) |
| auto-entrepreneur-coach.html | 218 | « …plafond …77 700 € **en 2025** » → réécrire en 2026 |
| auto-entrepreneur-consultant.html | 120, 281 | Tableaux comparatifs micro vs EURL/SASU |
| auto-entrepreneur-consultant.html | 187 | « est de 77 700 € par an **en 2025** » → 2026 |
| auto-entrepreneur-developpeur-web.html | 141, 324 | Tableau comparatif + alerte dépassement 2 ans |
| auto-entrepreneur-developpeur-web.html | 211 | « plafond …77 700 € par an **(2025)** » → 2026 |
| auto-entrepreneur-et-salarie.html | 221 | « plafond identique salarié ou non : 77 700 € » |
| auto-entrepreneur-formateur.html | 163 | « …jusqu'au plafond micro de 77 700 € » |
| auto-entrepreneur-graphiste.html | 141, 194 | « 77 700 € … **(limite en 2025)** » / « **(2025)** » → 2026 |
| auto-entrepreneur-immobilier.html | 194, 195, 286 | Plafond mandataire immobilier (×3) |
| depasser-plafond-micro-entreprise.html | 127, 128, 131 | Définition des deux plafonds + activité mixte (page PILIER du sujet) |
| faq-auto-entrepreneur.html | 146 | « **En 2025**, les plafonds sont 188 700 € / 77 700 € » → 2026 |
| index.html | 336 | FAQ accueil : « **En 2025**, le plafond est de 188 700 €… 77 700 €… » → 2026 |
| index.html | 505 | Description carte consultant « plafond 77 700 € » |
| micro-entreprise-vs-eurl.html | 92 | Tableau « Plafond CA : 77 700 / 188 700 EUR vs Aucun » |
| micro-entreprise-vs-sasu.html | 121, 145 | Tableau + encart ⚠️ dépassement |
| plafond-chiffre-affaires-micro-entreprise.html | 99, 104 | Cartes chiffres « Plafond CA annuel **2025** » → 2026 (page PILIER) |
| plafond-chiffre-affaires-micro-entreprise.html | 291, 292, 311 | Corps de l'article + règle activité mixte |
| portage-salarial-vs-auto-entrepreneur.html | 160, 227 | Tableau + paragraphe conseil |
| radiation-auto-entrepreneur.html | 202 | Radiation pour dépassement 2 ans |
| simulateur-tjm-auto-entrepreneur.html | 233 | Texte d'aide sous le simulateur (cohérence avec calculators.js:581 !) |
| tva-auto-entrepreneur.html | 162 | « seuils TVA majorés par rapport au plafond (188 700 € et 77 700 €) » |

### 2c. Métadonnées SEO (title / description / og / twitter)

| Fichier:ligne | Balise |
|---|---|
| auto-entrepreneur-consultant.html:16 | meta description (« plafond 77 700 € » + « en 2025 ») |
| auto-entrepreneur-consultant.html:18, 28 | og:description, twitter:description |
| auto-entrepreneur-developpeur-web.html:16 | meta description |
| plafond-chiffre-affaires-micro-entreprise.html:15 | `<title>` « Plafond CA Micro-Entreprise **2025** : 77 700 € et 188 700 € » — le title de la page pilier ! |
| plafond-chiffre-affaires-micro-entreprise.html:16, 17, 27 | meta description, og:title, twitter:title |

→ Fort impact SEO : titles/descriptions avec anciens montants + année 2025 = CTR et fraîcheur dégradés.

### 2d. JSON-LD (données structurées)

| Fichier:ligne | Contenu |
|---|---|
| faq-auto-entrepreneur.html:47 | Schema FAQPage : « Quel est le plafond de CA en micro-entreprise **en 2025** ? … 188 700 € … » → réécrire Q et R en 2026 (visible dans les rich results Google) |

### 2e. Libellés couplés à la logique

| Fichier:lignes | Contenu |
|---|---|
| plafond-chiffre-affaires-micro-entreprise.html:135-138 | `<option>` du sélecteur du calculateur : « Vente de marchandises / Hébergement (188 700 €) », « Prestations BIC (77 700 €) », « BNC (77 700 €) », « CIPAV (77 700 €) » — **à changer dans le même commit que calculators.js** (les values alimentent `PLAFONDS_CA_2025`) |

---

## Catégorie 3 — CLAUDE.md (instructions agents)

| Fichier:lignes | Contenu | Action |
|---|---|---|
| CLAUDE.md:29-30 | « Plafonds micro-entreprise **2025** : 188 700 € / 77 700 € » | Mettre à jour vers « Plafonds 2026 : 203 100 € / 83 600 € » (sinon les futurs agents régresseront) |
| .claude/CLAUDE.md:26-27 | idem | idem |

Nota : ces valeurs étaient exactes pour 2025 — le problème est que le fichier les présente comme la référence courante.

---

## ⚠️ Cas où 188 700 / 77 700 sont CORRECTS (ne PAS remplacer aveuglément)

1. **`guide-auto-entrepreneur-2025.html:197, 202`** — cellules « 188 700 € / 77 700 € — Plafond annuel **2025** » dans une page intitulée « Guide Auto-Entrepreneur **2025** ». Les montants sont **historiquement exacts**. Deux options (décision éditoriale, pas un remplacement) : (a) laisser la page en l'état comme archive 2025, (b) refondre toute la page en « Guide 2026 » — auquel cas tout change ensemble (titre, slug ?, taux, plafonds).
2. **`faq-auto-entrepreneur.html:156`** — exemple explicitement daté : « si vous démarrez le **1er juillet 2025**, votre plafond sera d'environ 38 850 € (77 700 × 6/12) ». **Exact pour 2025.** Recommandation : transposer l'exemple en 2026 (« 1er juillet 2026 → 41 800 € (83 600 × 6/12) ») pour la fraîcheur, mais ce n'est pas une erreur factuelle.

Tous les AUTRES « en 2025 / (2025) » (coach:218, consultant:16/187, developpeur-web:16/211, graphiste:141/194, faq:47/146, index:336, plafond-chiffre:15/17/27/99/104) présentent l'information comme **l'état actuel** du régime : ils étaient justes à la rédaction mais sont périmés aujourd'hui → à actualiser vers 2026 (montants ET année).

---

## 🐛 Bonus — erreur factuelle PRÉEXISTANTE découverte (indépendante de la migration)

**`depasser-plafond-micro-entreprise.html:180 et :294`** confondent plafonds CA et seuils TVA :

> « si votre CA dépasse le seuil normal **(77 700 € ou 188 700 €)** mais reste en dessous du seuil majoré **(41 250 € ou 93 500 €)**, vous conservez la franchise TVA »

C'est incohérent (77 700 > 41 250) : la phrase décrit le mécanisme de franchise TVA, dont les seuils normaux sont **37 500 € / 85 000 €** (et majorés 41 250 € / 93 500 €). Les montants 77 700/188 700 n'ont rien à faire dans cette phrase. → À corriger lors du chantier (remplacer par 37 500 € / 85 000 €, PAS par les nouveaux plafonds CA).

---

## Synthèse et ordre de chantier recommandé

| Lot | Contenu | Risque |
|---|---|---|
| 1. Logique | `js/calculators.js` (10) + `tableau-de-bord.html` JS (4) + options `plafond-chiffre…:135-138` + libellés couplés (202, 470) | Élevé — tester les 4 calculateurs + le dashboard |
| 2. Pages piliers | `plafond-chiffre-affaires…` (13 occ., title inclus) + `depasser-plafond…` (7 occ. + bug TVA + recalculs prorata) | Moyen — recalculs |
| 3. Valeurs dérivées | TJM 388→418, tableaux de revenus consultant/formateur/dev-web | Moyen — recalculs |
| 4. Remplacements simples | 14 pages restantes + index + métadonnées SEO + JSON-LD FAQ | Faible |
| 5. Gouvernance | CLAUDE.md ×2 + décision sur `guide-auto-entrepreneur-2025.html` et faq:156 | Décision utilisateur |

Rappel : penser au **cache-busting** (`?v=`) sur `calculators.js` après modification (précédent : v=20260530).
