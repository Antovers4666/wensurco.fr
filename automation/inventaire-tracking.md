# Inventaire tracking — GA4 / Clarity / Consent Mode

> Généré le 2026-06-08 — diagnostic en lecture seule, aucune page HTML modifiée.
> Périmètre : les 55 fichiers `*.html` à la racine du dépôt.

## Critères de détection (sous-chaînes exactes)

| Colonne | Chaîne recherchée | Signification |
|---------|-------------------|---------------|
| Consent Mode | `consent','default'` | Bloc Consent Mode v2 par défaut (`gtag('consent','default',{...})`) |
| GA4 | `G-4H7VPXJ6KS` | Tag Google Analytics 4 (chargement + `config`) |
| Clarity | `wxp28322ek` | Snippet Microsoft Clarity |

Ce sont exactement les chaînes que `automation/auditor.js` utilise pour GA4 (ligne 49) et Clarity (ligne 50).

## Tableau page par page

| Page | Consent Mode | GA4 | Clarity |
|------|:---:|:---:|:---:|
| 404.html | ✅ | ✅ | ✅ |
| _template-article.html | ✅ | ✅ | ✅ |
| abattement-forfaitaire-micro-entreprise.html | ✅ | ❌ | ❌ |
| arret-maladie-auto-entrepreneur.html | ✅ | ❌ | ❌ |
| auto-entrepreneur-artisan-batiment.html | ✅ | ❌ | ❌ |
| auto-entrepreneur-coach.html | ✅ | ❌ | ❌ |
| auto-entrepreneur-consultant.html | ✅ | ❌ | ❌ |
| auto-entrepreneur-developpeur-web.html | ✅ | ❌ | ❌ |
| auto-entrepreneur-et-salarie.html | ✅ | ❌ | ❌ |
| auto-entrepreneur-etranger.html | ✅ | ❌ | ❌ |
| auto-entrepreneur-formateur.html | ✅ | ❌ | ❌ |
| auto-entrepreneur-graphiste.html | ✅ | ❌ | ❌ |
| auto-entrepreneur-immobilier.html | ✅ | ❌ | ❌ |
| bilan-comptable-auto-entrepreneur.html | ✅ | ❌ | ❌ |
| calcul-acre-auto-entrepreneur.html | ✅ | ❌ | ❌ |
| calcul-charges-auto-entrepreneur.html | ✅ | ❌ | ❌ |
| calculateur-cfe.html | ✅ | ❌ | ❌ |
| calendrier-declarations-auto-entrepreneur.html | ✅ | ❌ | ❌ |
| cfe-auto-entrepreneur-2025.html | ✅ | ❌ | ❌ |
| comparateur-statuts.html | ✅ | ❌ | ❌ |
| compte-bancaire-pro-auto-entrepreneur.html | ✅ | ❌ | ❌ |
| confidentialite.html | ✅ | ❌ | ❌ |
| cotisation-formation-professionnelle-ae.html | ✅ | ❌ | ❌ |
| cumul-chomage-auto-entrepreneur.html | ✅ | ❌ | ❌ |
| declaration-impots-auto-entrepreneur.html | ✅ | ❌ | ❌ |
| declaration-urssaf-pas-a-pas.html | ❌ | ✅ | ✅ |
| depasser-plafond-micro-entreprise.html | ✅ | ❌ | ❌ |
| devis-auto-entrepreneur.html | ✅ | ❌ | ❌ |
| facturation-electronique-auto-entrepreneur.html | ✅ | ❌ | ❌ |
| facturer-auto-entrepreneur.html | ✅ | ❌ | ❌ |
| faq-auto-entrepreneur.html | ✅ | ❌ | ❌ |
| frais-deductibles-micro-entreprise.html | ✅ | ❌ | ❌ |
| guide-auto-entrepreneur-2025.html | ✅ | ❌ | ❌ |
| immatriculation-auto-entrepreneur.html | ✅ | ❌ | ❌ |
| indemnites-kilometriques-2025.html | ✅ | ❌ | ❌ |
| index.html | ✅ | ❌ | ❌ |
| mentions-legales.html | ✅ | ❌ | ❌ |
| micro-entreprise-vs-eurl.html | ✅ | ❌ | ❌ |
| micro-entreprise-vs-sasu.html | ✅ | ❌ | ❌ |
| mutuelle-tns-auto-entrepreneur.html | ✅ | ❌ | ❌ |
| passer-salarie-auto-entrepreneur.html | ✅ | ❌ | ❌ |
| penalites-urssaf-auto-entrepreneur.html | ✅ | ❌ | ❌ |
| plafond-chiffre-affaires-micro-entreprise.html | ✅ | ❌ | ❌ |
| portage-salarial-vs-auto-entrepreneur.html | ✅ | ❌ | ❌ |
| radiation-auto-entrepreneur.html | ✅ | ❌ | ❌ |
| rc-pro-auto-entrepreneur.html | ✅ | ❌ | ❌ |
| retraite-auto-entrepreneur.html | ✅ | ❌ | ❌ |
| seuil-tva-auto-entrepreneur.html | ✅ | ❌ | ❌ |
| simulateur-retraite-auto-entrepreneur.html | ✅ | ❌ | ❌ |
| simulateur-revenu-net-auto-entrepreneur.html | ✅ | ❌ | ❌ |
| simulateur-tjm-auto-entrepreneur.html | ✅ | ❌ | ❌ |
| siren-siret-auto-entrepreneur.html | ✅ | ❌ | ❌ |
| tableau-de-bord.html | ✅ | ❌ | ❌ |
| tva-auto-entrepreneur.html | ✅ | ❌ | ❌ |
| versement-liberatoire-auto-entrepreneur.html | ✅ | ❌ | ❌ |

## Regroupement par catégorie

| Catégorie | Consent | GA4 | Clarity | Nb pages | Pages |
|-----------|:---:|:---:|:---:|:---:|-------|
| **A. Tout présent** | ✅ | ✅ | ✅ | **2** | `404.html`, `_template-article.html` |
| **B. GA4+Clarity sans Consent Mode** | ❌ | ✅ | ✅ | **1** | `declaration-urssaf-pas-a-pas.html` |
| **C. Consent seul (GA4+Clarity manquants)** | ✅ | ❌ | ❌ | **52** | toutes les autres pages |
| **Total** | | | | **55** | |

## Lecture / conclusions

- **Aucune page ne mélange partiellement GA4 et Clarity** : soit les deux sont présents, soit les deux sont absents. Pas de cas « GA4 oui / Clarity non » ni l'inverse. Cela simplifie l'injection (un seul fragment combiné GA4+Clarity à poser).
- **52 pages sur 55** (catégorie C) ont déjà le Consent Mode v2 mais **pas** le tag GA4 ni le snippet Clarity. C'est le gros du chantier.
  - Pour ces pages, il NE faut PAS recopier le bloc de référence tel quel : elles possèdent déjà `window.dataLayer`, `function gtag(){...}` et `gtag('consent','default',...)`. Recopier le bloc de `declaration-urssaf-pas-a-pas.html` dupliquerait le stub `dataLayer`/`gtag`.
  - Fragment à injecter pour la catégorie C = uniquement : `<script async src=".../gtag/js?id=G-4H7VPXJ6KS">` + `gtag('js', new Date())` + `gtag('config','G-4H7VPXJ6KS')` + snippet Clarity.
- **La page de référence QA (catégorie B)** est en fait *incohérente* avec le reste du site : elle a GA4+Clarity mais **pas** le Consent Mode v2 que les 52 autres pages possèdent. À harmoniser éventuellement (ajouter le consent default).
- **2 pages (catégorie A)** sont complètes et cohérentes — modèles idéaux.

### Implication pour l'outillage
- `automation/injector.js` ne sert qu'à injecter des cartes dans `index.html` → **inutilisable** ici.
- Un **nouveau script d'injection de masse** est nécessaire, avec une logique conditionnelle selon la catégorie (ne pas redéclarer le stub `gtag` quand le Consent Mode est déjà là), et idempotent via `content.includes('G-4H7VPXJ6KS')`.
