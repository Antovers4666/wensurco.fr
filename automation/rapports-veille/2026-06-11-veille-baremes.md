# Veille barèmes officiels — 2026-06-11

- Référence : `data/baremes-officiels.json` version **2026.06.1**, dernière vérification humaine le 2026-06-10
- Signal 1 (scraping) : 4 source(s) officielle(s)
- Signal 2 (recoupement web) : modèle claude-sonnet-4-6, 7 recherche(s), domaines officiels uniquement

## Synthèse : ✅ 23 confirmé(s) · ⚠️ 6 écart(s) · ❓ 0 introuvable(s) · 💥 0 erreur(s)

**⚠️ Au moins un écart détecté : vérification humaine requise avant toute mise à jour.**

## Détail valeur par valeur

| Famille | Clé | Valeur du site | Scraping | Recherche web | Statut |
|---|---|---|---|---|---|
| cotisations_sociales | vente_marchandises | 12,3 % | 12,3 % | 12,3 % | CONFIRMÉ |
| cotisations_sociales | services_commerciaux | 21,2 % | 21,2 % | 24,6 % | ÉCART À VÉRIFIER |
| cotisations_sociales | liberal_bnc | 25,6 % | 25,6 % | 26,1 % | ÉCART À VÉRIFIER |
| cotisations_sociales | liberal_cipav | 23,2 % | 23,2 % | 23,2 % | CONFIRMÉ |
| cotisations_sociales | meuble_tourisme | 6 % | 6 % | 6 % | CONFIRMÉ |
| cotisations_sociales | artisanal | 21,2 % | 21,2 % | 25,6 % | ÉCART À VÉRIFIER |
| formation_professionnelle | vente_marchandises | 0,1 % | — | 0,1 % | CONFIRMÉ |
| formation_professionnelle | services_commerciaux | 0,2 % | — | 0,1 % | ÉCART À VÉRIFIER |
| formation_professionnelle | liberal_bnc | 0,2 % | — | 0,2 % | CONFIRMÉ |
| formation_professionnelle | liberal_cipav | 0,2 % | — | 0,2 % | CONFIRMÉ |
| formation_professionnelle | meuble_tourisme | 0,1 % | — | 0,1 % | CONFIRMÉ |
| formation_professionnelle | artisanal | 0,3 % | — | 0,3 % | CONFIRMÉ |
| plafonds_ca | vente_marchandises | 203 100 € | 203 100 € | 203 100 € | CONFIRMÉ |
| plafonds_ca | services_commerciaux | 83 600 € | 83 600 € | 83 600 € | CONFIRMÉ |
| plafonds_ca | meuble_tourisme | 203 100 € | 203 100 € | 83 600 € | ÉCART À VÉRIFIER |
| tva_franchise | ventes_normal | 85 000 € | 85 000 € | 85 000 € | CONFIRMÉ |
| tva_franchise | ventes_majore | 93 500 € | 93 500 € | 93 500 € | CONFIRMÉ |
| tva_franchise | services_normal | 37 500 € | 37 500 € | 37 500 € | CONFIRMÉ |
| tva_franchise | services_majore | 41 250 € | 41 250 € | 41 250 € | CONFIRMÉ |
| vfl | vente_marchandises | 1 % | 1 % | 1 % | CONFIRMÉ |
| vfl | services_commerciaux | 1,7 % | 1,7 % | 1,7 % | CONFIRMÉ |
| vfl | liberal_bnc | 2,2 % | 2,2 % | 2,2 % | CONFIRMÉ |
| vfl | seuil_rfr_par_part | 27 794 € | — | 29 315 € | ÉCART À VÉRIFIER |
| acre | palier_applicable | 50 % | 50 % | 50 % | CONFIRMÉ |
| acre | prochain_palier | 25 % | — | 25 % | CONFIRMÉ |
| abattements_fiscaux | vente_marchandises | 71 % | 71 % | 71 % | CONFIRMÉ |
| abattements_fiscaux | services_commerciaux | 50 % | 50 % | 50 % | CONFIRMÉ |
| abattements_fiscaux | liberal_bnc | 34 % | 34 % | 34 % | CONFIRMÉ |
| abattements_fiscaux | minimum | 305 € | 305 € | 305 € | CONFIRMÉ |

## ⚠️ Écarts détectés

### cotisations_sociales.services_commerciaux — taux de cotisations sociales micro-entrepreneur — prestations de services BIC
- Valeur actuelle du site : **21,2 %**
- Recherche web : **24,6 %** (source : https://www.autoentrepreneur.urssaf.fr/portail/accueil/sinformer-sur-le-statut/lessentiel-du-statut.html)

### cotisations_sociales.liberal_bnc — taux de cotisations sociales micro-entrepreneur — professions libérales BNC (SSI)
- Valeur actuelle du site : **25,6 %**
- Recherche web : **26,1 %** (source : https://www.autoentrepreneur.urssaf.fr/portail/accueil/sinformer-sur-le-statut/toutes-les-actualites/evolution-des-taux-de-cotisation.html)

### cotisations_sociales.artisanal — taux de cotisations sociales micro-entrepreneur — prestations de services artisanales
- Valeur actuelle du site : **21,2 %**
- Recherche web : **25,6 %** (source : https://www.autoentrepreneur.urssaf.fr/portail/accueil/sinformer-sur-le-statut/lessentiel-du-statut.html)

### formation_professionnelle.services_commerciaux — taux de contribution à la formation professionnelle (CFP) micro-entrepreneur — prestations de services BIC
- Valeur actuelle du site : **0,2 %**
- Recherche web : **0,1 %** (source : https://www.urssaf.fr/accueil/outils-documentation/taux-baremes/taux-cotisations-ac-plnr.html)

### plafonds_ca.meuble_tourisme — plafond de chiffre d'affaires micro-entreprise — meublés de tourisme classés
- Valeur actuelle du site : **203 100 €**
- Recherche web : **83 600 €** (source : https://www.economie.gouv.fr/entreprises/micro-entreprises-entrepreneur-auto-entrepreneur-declaration-revenus)

### vfl.seuil_rfr_par_part — revenu fiscal de référence maximum (N-2, par part) pour accéder au versement libératoire
- Valeur actuelle du site : **27 794 €**
- Recherche web : **29 315 €** (source : https://www.autoentrepreneur.urssaf.fr/portail/accueil/sinformer-sur-le-statut/toutes-les-actualites/modalites-dadhesion-au-verseme-2.html)

## Actions recommandées en cas d'écart confirmé

1. Vérifier **humainement** la valeur sur les URLs officielles citées ci-dessus.
2. Si le changement est avéré : éditer `data/baremes-officiels.json` (valeur + `verifie_le` + `meta.version` + `meta.derniere_verification_humaine`).
3. Régénérer : `npm run build:baremes`, puis contrôler : `npm run check:baremes` et `npm run test:calc`.
4. Bumper les `?v=` des scripts sur les pages, et vérifier les montants dérivés écrits en dur dans les textes (voir `automation/inventaire-plafonds.md` pour la méthode).

---
*Rapport généré automatiquement par `automation/veille-baremes.js`. **Aucun fichier de données ni page du site n'a été modifié.***
