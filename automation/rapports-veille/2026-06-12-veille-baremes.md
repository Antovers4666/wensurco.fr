# Veille barèmes officiels — 2026-06-12

- Référence : `data/baremes-officiels.json` version **2026.06.2**, dernière vérification humaine le 2026-06-12
- Signal 1 (scraping) : 4 source(s) officielle(s)
- Signal 2 (recoupement web) : désactivé (--sans-web)

## Synthèse : ✅ 19 confirmé(s) · ⚠️ 0 écart(s) · ❓ 7 introuvable(s) · 💥 0 erreur(s)

**Aucun écart détecté, mais certaines valeurs n'ont pas pu être vérifiées (voir tableau).**

## Détail valeur par valeur

| Famille | Clé | Valeur du site | Scraping | Recherche web | Statut |
|---|---|---|---|---|---|
| cotisations_sociales | vente_marchandises | 12,3 % | 12,3 % | — | CONFIRMÉ |
| cotisations_sociales | services_commerciaux | 21,2 % | 21,2 % | — | CONFIRMÉ |
| cotisations_sociales | liberal_bnc | 25,6 % | 25,6 % | — | CONFIRMÉ |
| cotisations_sociales | liberal_cipav | 23,2 % | 23,2 % | — | CONFIRMÉ |
| cotisations_sociales | artisanal | 21,2 % | 21,2 % | — | CONFIRMÉ |
| formation_professionnelle | vente_marchandises | 0,1 % | — | — | INTROUVABLE |
| formation_professionnelle | services_commerciaux | 0,2 % | — | — | INTROUVABLE |
| formation_professionnelle | liberal_bnc | 0,2 % | — | — | INTROUVABLE |
| formation_professionnelle | liberal_cipav | 0,2 % | — | — | INTROUVABLE |
| formation_professionnelle | artisanal | 0,3 % | — | — | INTROUVABLE |
| plafonds_ca | vente_marchandises | 203 100 € | 203 100 € | — | CONFIRMÉ |
| plafonds_ca | services_commerciaux | 83 600 € | 83 600 € | — | CONFIRMÉ |
| tva_franchise | ventes_normal | 85 000 € | 85 000 € | — | CONFIRMÉ |
| tva_franchise | ventes_majore | 93 500 € | 93 500 € | — | CONFIRMÉ |
| tva_franchise | services_normal | 37 500 € | 37 500 € | — | CONFIRMÉ |
| tva_franchise | services_majore | 41 250 € | 41 250 € | — | CONFIRMÉ |
| vfl | vente_marchandises | 1 % | 1 % | — | CONFIRMÉ |
| vfl | services_commerciaux | 1,7 % | 1,7 % | — | CONFIRMÉ |
| vfl | liberal_bnc | 2,2 % | 2,2 % | — | CONFIRMÉ |
| vfl | seuil_rfr_par_part | 27 794 € | — | — | INTROUVABLE |
| acre | palier_applicable | 50 % | 50 % | — | CONFIRMÉ |
| acre | prochain_palier | 25 % | — | — | INTROUVABLE |
| abattements_fiscaux | vente_marchandises | 71 % | 71 % | — | CONFIRMÉ |
| abattements_fiscaux | services_commerciaux | 50 % | 50 % | — | CONFIRMÉ |
| abattements_fiscaux | liberal_bnc | 34 % | 34 % | — | CONFIRMÉ |
| abattements_fiscaux | minimum | 305 € | 305 € | — | CONFIRMÉ |

## Actions recommandées en cas d'écart confirmé

1. Vérifier **humainement** la valeur sur les URLs officielles citées ci-dessus.
2. Si le changement est avéré : éditer `data/baremes-officiels.json` (valeur + `verifie_le` + `meta.version` + `meta.derniere_verification_humaine`).
3. Régénérer : `npm run build:baremes`, puis contrôler : `npm run check:baremes` et `npm run test:calc`.
4. Bumper les `?v=` des scripts sur les pages, et vérifier les montants dérivés écrits en dur dans les textes (voir `automation/inventaire-plafonds.md` pour la méthode).

---
*Rapport généré automatiquement par `automation/veille-baremes.js`. **Aucun fichier de données ni page du site n'a été modifié.***
