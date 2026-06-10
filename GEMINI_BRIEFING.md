> ⚠️ **Document d'archive** (bandeau ajouté le 2026-06-11) — les chiffres et états décrits reflètent la situation à leur date de rédaction. Ne pas utiliser comme référence courante : taux, plafonds et seuils TVA y sont périmés. Référence à jour : CLAUDE.md.

# 📋 BRIEFING COMPLET — wensurco.fr / CalcAutoEntrepreneur
*À lire en entier avant de répondre à quoi que ce soit.*

---

## 1. QUI JE SUIS ET CE QU'ON FAIT

Tu es un assistant Antigravity IDE travaillant sur le projet **wensurco.fr** (aussi appelé **CalcAutoEntrepreneur**).
C'est un site web de calculateurs et d'articles SEO pour les auto-entrepreneurs français.

- **Site live** : https://wensurco.fr
- **Hébergement** : Netlify (déploiement automatique via script)
- **Dossier projet** : `C:\Users\linkl\Desktop\CalcAutoEntrepreneur\`

---

## 2. ARCHITECTURE DU PROJET

### Fichiers clés
| Fichier | Rôle |
|---------|------|
| `index.html` | Homepage avec outils + section "Guides & Articles" |
| `css/style.css` | Styles globaux du site |
| `js/ui.js` | Interactions UI communes (navbar, animations, etc.) |
| `sitemap.xml` | Sitemap soumis à Google |
| `robots.txt` | Autorisation crawl + lien sitemap |
| `deploy-netlify.ps1` | Script de déploiement Netlify (TOUJOURS utiliser ce script) |
| `launch-browser.ps1` | Lance Chrome debug sur port 9222 (profil isolé AntigravityDebug) |
| `ANTIGRAVITY_CONTEXT.md` | État du projet, sujets traités/restants, priorités SEO |

### Outils calculateurs (pages principales)
- `calcul-charges-auto-entrepreneur.html`
- `simulateur-revenu-net-auto-entrepreneur.html`
- `plafond-chiffre-affaires-micro-entreprise.html`
- `indemnites-kilometriques-2025.html`
- `calcul-acre-auto-entrepreneur.html`
- `calendrier-declarations-auto-entrepreneur.html`

### Articles SEO publiés (14 articles)
- guide-auto-entrepreneur-2025.html
- faq-auto-entrepreneur.html
- cfe-auto-entrepreneur-2025.html
- arret-maladie-auto-entrepreneur.html
- cumul-chomage-auto-entrepreneur.html
- retraite-auto-entrepreneur.html
- frais-deductibles-micro-entreprise.html
- tva-auto-entrepreneur.html
- compte-bancaire-pro-auto-entrepreneur.html
- rc-pro-auto-entrepreneur.html
- passer-salarie-auto-entrepreneur.html
- mutuelle-tns-auto-entrepreneur.html
- auto-entrepreneur-graphiste.html
- auto-entrepreneur-developpeur-web.html

### 10 sujets restants à créer (dans l'ordre)
1. auto-entrepreneur-consultant
2. auto-entrepreneur-formateur
3. radiation-auto-entrepreneur
4. auto-entrepreneur-et-salarie
5. facturer-auto-entrepreneur
6. siren-siret-auto-entrepreneur
7. bilan-comptable-auto-entrepreneur
8. auto-entrepreneur-etranger
9. micro-entreprise-vs-sasu
10. auto-entrepreneur-immobilier

---

## 3. RÈGLES ABSOLUES À RESPECTER

### Déploiement
- **TOUJOURS** déployer via : `powershell -ExecutionPolicy Bypass -File "C:\Users\linkl\Desktop\CalcAutoEntrepreneur\deploy-netlify.ps1"`
- **JAMAIS** utiliser `Compress-Archive` ou ZIP dans le script de déploiement
- Vérifier que l'état final est `ready` après chaque déploiement
- **UN SEUL déploiement** à la fin d'une session de travail, pas un par fichier

### Qualité des articles
Chaque article HTML doit obligatoirement avoir :
- `<title>` unique ≤ 60 caractères
- `<meta description>` unique 120-160 caractères
- `<link rel="canonical" href="https://wensurco.fr/[slug]">`
- **Exactement 1** balise `<h1>`
- Schema.org JSON-LD (`application/ld+json`)
- AdSense : `ca-pub-2844746944687552`
- Cookie banner (avec acceptCookies/refuseCookies)
- `<script src="js/ui.js"></script>` en bas de page
- **Plus de 800 mots** de contenu
- **Au moins 3 liens internes** vers d'autres pages du site

### js/ui.js — Règle critique
`.seo-content` ne doit **JAMAIS** être mis à `opacity: 0` dans ui.js.
Bug corrigé le 2026-05-27 : l'animation fadeInUp ne doit s'appliquer qu'aux `.tool-card` et `.testimonial-card`, jamais au contenu des articles.

### sitemap.xml + index.html
À chaque nouvel article créé :
1. Ajouter l'URL dans `sitemap.xml`
2. Ajouter une carte dans la section "Guides & Articles" de `index.html`
3. Mettre à jour `ANTIGRAVITY_CONTEXT.md` (déplacer sujet vers "DÉJÀ traités")

---

## 4. TEMPLATE D'ARTICLE

Utiliser `frais-deductibles-micro-entreprise.html` comme modèle de référence pour la structure complète (navbar, page-header, container-narrow, seo-content, footer, cookie banner).

Structure de la navbar : liens vers calcul-charges, plafond-chiffre-affaires, indemnites-kilometriques-2025, simulateur-revenu-net, calcul-acre, faq-auto-entrepreneur.

---

## 5. SYSTÈME D'AUTOMATISATION

### Timers (actuellement en pause — quota Claude épuisé)
Les timers utilisent le quota du modèle de la conversation. Ils sont en pause jusqu'au reset du quota (~2 juin 2026).

**Timer articles** (à relancer quand quota rechargé) :
- Cron : `0 */5 * * 0,2-6` (toutes les 5h, SAUF le lundi)
- Action : créer 4 articles parmi les restants + QA + sitemap + index + déploiement

**Timer maintenance** (à relancer quand quota rechargé) :
- Cron : `0 7 * * 1` (chaque lundi à 7h UTC)
- Action : audit SEO + corrections + 1 seul déploiement
- **Le lundi = PAS d'articles**, seulement la maintenance (pour économiser le quota)

### Relancer les timers
Quand le quota est rechargé, utiliser le `schedule` tool avec ces paramètres exacts.

---

## 6. INFORMATIONS NETLIFY

- **Site ID** : dans le script `deploy-netlify.ps1`
- **Token** : dans le script `deploy-netlify.ps1`
- **URL** : https://wensurco.fr
- Le script détecte automatiquement les fichiers modifiés (file digest API) et n'uploade que ceux qui ont changé

---

## 7. SEO & MONÉTISATION

- **AdSense** : `ca-pub-2844746944687552` — présent sur toutes les pages
- **Canonical** : toujours `https://wensurco.fr/[slug-sans-.html]`
- **Taux de cotisations 2025** (à utiliser dans les articles) :
  - BNC (professions libérales) : 24,6%
  - BIC services : 21,2%
  - BIC commerce : 12,3%
  - ACRE (1ère année) : taux divisé par 2
- **Plafonds CA 2025** :
  - Vente de marchandises : 188 700 €
  - Prestations de services : 77 700 €

---

## 8. CE QU'IL NE FAUT PAS FAIRE

- ❌ Ne jamais créer plusieurs sous-agents en rafale pour la même tâche
- ❌ Ne jamais déployer avec `Compress-Archive`
- ❌ Ne jamais mettre `opacity: 0` sur `.seo-content` dans ui.js
- ❌ Ne jamais créer d'article sans faire le contrôle qualité (7 checks)
- ❌ Ne jamais publier d'articles le lundi (jour réservé maintenance)
- ❌ Ne jamais créer un article sans l'ajouter au sitemap ET à index.html

---

## 9. ÉTAT AU 2026-05-27

- **Site** : en ligne ✅
- **Articles publiés** : 14/24 prévus
- **Quota Claude** : épuisé jusqu'au ~2 juin 2026 (enveloppe hebdomadaire dépassée)
- **Timers** : en pause (à relancer quand quota rechargé)
- **Bug mobile corrigé** : ui.js ne cache plus .seo-content (fix déployé ce matin)

---

*Ce fichier remplace le contexte de la conversation précédente. Lire aussi `ANTIGRAVITY_CONTEXT.md` pour le détail complet des sujets SEO.*
