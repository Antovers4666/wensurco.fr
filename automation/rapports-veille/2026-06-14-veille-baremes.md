# Veille barèmes officiels — 2026-06-14

- Référence : `data/baremes-officiels.json` version **2026.06.3**, dernière vérification humaine le 2026-06-12
- Signal 1 (scraping) : 4 source(s) officielle(s)
- Signal 2 (recoupement web) : modèle claude-sonnet-4-6, 6 recherche(s), domaines officiels uniquement

## Synthèse : ✅ 25 confirmé(s) · ⚠️ 0 écart(s) · 🟡 1 toléré(s) · ❓ 0 introuvable(s) · 💥 0 erreur(s)

**✅ Aucun écart réel. 1 écart(s) toléré(s) (bruit connu documenté) — aucune action requise.**

## Détail valeur par valeur

| Famille | Clé | Valeur du site | Scraping | Recherche web | Statut |
|---|---|---|---|---|---|
| cotisations_sociales | vente_marchandises | 12,3 % | 12,3 % | 12,3 % | CONFIRMÉ |
| cotisations_sociales | services_commerciaux | 21,2 % | 21,2 % | 21,2 % | CONFIRMÉ |
| cotisations_sociales | liberal_bnc | 25,6 % | 25,6 % | 25,6 % | CONFIRMÉ |
| cotisations_sociales | liberal_cipav | 23,2 % | 23,2 % | 23,2 % | CONFIRMÉ |
| cotisations_sociales | artisanal | 21,2 % | 21,2 % | 21,2 % | CONFIRMÉ |
| formation_professionnelle | vente_marchandises | 0,1 % | — | 0,1 % | CONFIRMÉ |
| formation_professionnelle | services_commerciaux | 0,2 % | — | 0,1 % | ÉCART TOLÉRÉ (bruit connu) |
| formation_professionnelle | liberal_bnc | 0,2 % | — | 0,2 % | CONFIRMÉ |
| formation_professionnelle | liberal_cipav | 0,2 % | — | 0,2 % | CONFIRMÉ |
| formation_professionnelle | artisanal | 0,3 % | — | 0,3 % | CONFIRMÉ |
| plafonds_ca | vente_marchandises | 203 100 € | 203 100 € | 203 100 € | CONFIRMÉ |
| plafonds_ca | services_commerciaux | 83 600 € | 83 600 € | 83 600 € | CONFIRMÉ |
| tva_franchise | ventes_normal | 85 000 € | 85 000 € | 85 000 € | CONFIRMÉ |
| tva_franchise | ventes_majore | 93 500 € | 93 500 € | 93 500 € | CONFIRMÉ |
| tva_franchise | services_normal | 37 500 € | 37 500 € | 37 500 € | CONFIRMÉ |
| tva_franchise | services_majore | 41 250 € | 41 250 € | 41 250 € | CONFIRMÉ |
| vfl | vente_marchandises | 1 % | 1 % | 1 % | CONFIRMÉ |
| vfl | services_commerciaux | 1,7 % | 1,7 % | 1,7 % | CONFIRMÉ |
| vfl | liberal_bnc | 2,2 % | 2,2 % | 2,2 % | CONFIRMÉ |
| vfl | seuil_rfr_par_part | 29 315 € | — | 29 315 € | CONFIRMÉ |
| acre | palier_applicable | 50 % | 50 % | 50 % | CONFIRMÉ |
| acre | prochain_palier | 25 % | — | 25 % | CONFIRMÉ |
| abattements_fiscaux | vente_marchandises | 71 % | 71 % | 71 % | CONFIRMÉ |
| abattements_fiscaux | services_commerciaux | 50 % | 50 % | 50 % | CONFIRMÉ |
| abattements_fiscaux | liberal_bnc | 34 % | 34 % | 34 % | CONFIRMÉ |
| abattements_fiscaux | minimum | 305 € | 305 € | 305 € | CONFIRMÉ |

## 🟡 Écarts tolérés (bruit connu — aucune action requise)

### formation_professionnelle.services_commerciaux — taux de contribution à la formation professionnelle (CFP) micro-entrepreneur — prestations de services BIC
- Valeur du site (référence) : **0,2 %**
- Valeur divergente d'une seule source : **0,1 %**
- Raison documentée : CFP des prestations de services = 0,2 %. Les pages URSSAF agrégées (« l'essentiel du statut ») affichent souvent 0,1 % — le taux des activités commerciales/vente — d'où une divergence mono-signal récurrente sans changement réglementaire réel. Documenté le 2026-06-12 ; toute autre valeur (ex. 0,3 %) reste une alerte.

## Actions recommandées en cas d'écart confirmé

1. Vérifier **humainement** la valeur sur les URLs officielles citées ci-dessus.
2. Si le changement est avéré : éditer `data/baremes-officiels.json` (valeur + `verifie_le` + `meta.version` + `meta.derniere_verification_humaine`).
3. Régénérer : `npm run build:baremes`, puis contrôler : `npm run check:baremes` et `npm run test:calc`.
4. Bumper les `?v=` des scripts sur les pages, et vérifier les montants dérivés écrits en dur dans les textes (voir `automation/inventaire-plafonds.md` pour la méthode).

---
*Rapport généré automatiquement par `automation/veille-baremes.js`. **Aucun fichier de données ni page du site n'a été modifié.***
