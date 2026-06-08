---
name: github-pages-deploy
description: |
  Use this skill for all GitHub Pages deployment tasks for wensurco.fr.
  Covers git workflow, CNAME, .nojekyll, and deployment troubleshooting.
---
# GitHub Pages — wensurco.fr

## Déploiement standard
git add -A
git commit -m "[type]: description"
git push origin main

## Types de commits
feat / fix / seo / perf / sec / style

## Fichiers critiques à ne JAMAIS supprimer
- CNAME (contient "wensurco.fr")
- .nojekyll (empêche Jekyll)
- index.html

## Si le site ne se met pas à jour
1. Vérifier l'onglet Actions du repo GitHub
2. Vérifier que la branche source est "main" dans Settings > Pages
3. Attendre 5 minutes (propagation)
