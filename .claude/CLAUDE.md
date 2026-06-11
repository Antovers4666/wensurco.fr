# wensurco.fr — CalcAutoEntrepreneur

## Projet
Site de contenu SEO monétisé par Google AdSense, 100% gratuit pour les visiteurs.
Outils de calcul et guides pour auto-entrepreneurs et micro-entrepreneurs français.

## Stack technique
- HTML/CSS/JS vanilla uniquement — AUCUN framework
- Hébergé sur GitHub Pages (domaine custom : wensurco.fr)
- Pas de base de données, pas de backend
- Monétisation : Google AdSense (ca-pub-2844746944687552)

## Règles absolues pour tous les agents
1. Ne JAMAIS modifier ou supprimer les balises AdSense existantes
2. Ne JAMAIS introduire de framework JS (React, Vue, etc.)
3. Ne JAMAIS inventer un taux URSSAF ou une date officielle — vérifier via web_search
4. Toujours tester mentalement un calcul JS avant de l'écrire
5. Conserver la structure de navigation actuelle du site

## Source de vérité des chiffres officiels : data/baremes-officiels.json
Tous les taux, plafonds, seuils TVA, VFL, ACRE et abattements vivent dans `data/baremes-officiels.json`
(consommé par js/calculators.js via js/baremes-officiels.js généré, et par automation/generator.js).
Procédure de mise à jour (validation humaine OBLIGATOIRE — jamais automatique) :
1. Vérifier la valeur sur les sources officielles citées dans le JSON
2. Éditer le JSON (valeur + verifie_le + meta.version + meta.derniere_verification_humaine)
3. `npm run build:baremes` puis `npm run check:baremes` et `npm run test:calc`
4. Bumper les `?v=` des scripts sur les pages concernées
Veille : `npm run veille` (rapport dans automation/rapports-veille/) + GitHub Action mensuelle.

## Taux URSSAF 2026 officiels (référence rapide — la source faisant foi est le JSON ci-dessus)
- Vente de marchandises : 12,3%
- Prestations de services BIC / artisanat : 21,2%
- Professions libérales BNC SSI : 25,6% (était 24,6% jusqu'en 2025)

## Plafonds micro-entreprise 2026 (référence rapide — la source faisant foi est le JSON ci-dessus)
- Vente de marchandises / hébergement : 203 100 € (était 188 700 € jusqu'en 2025)
- Prestations de services / libéraux : 83 600 € (était 77 700 € jusqu'en 2025)

## Fichier de mémoire partagée
Tous les agents lisent et écrivent leurs conclusions dans .claude/MEMORY.md
