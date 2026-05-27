# 🤖 ANTIGRAVITY CONTEXT — wensurco.fr
> Lis ce fichier EN PREMIER au démarrage de chaque nouvelle conversation.
> Il contient TOUT le contexte du projet pour ne rien oublier.

---

## 👤 Utilisateur
- **Prénom** : Antoine
- **Langue** : Français (toujours répondre en français)

---

## 🌐 Le Site — wensurco.fr

### Identité
- **Nom** : CalcAutoEntrepreneur (marque : wensurco.fr)
- **Concept** : Site d'outils gratuits pour auto-entrepreneurs, monétisé via Google AdSense
- **URL** : https://wensurco.fr
- **Dossier local** : `C:\Users\linkl\Desktop\CalcAutoEntrepreneur`

### Stack technique
- HTML/CSS/JS statique (pas de framework)
- CSS : `css/style.css` (design system complet avec variables CSS)
- JS : `js/calculators.js` (namespace `CAE`) + `js/ui.js`
- Hébergement : **Netlify** (déploiement automatique via API PowerShell)

---

## 🔑 Credentials & IDs (CONFIDENTIELS)

```
Netlify Token    : nfp_fz9PqTB7CwUGDE2mHgFNTJKpKbQ46NRJ9448
Netlify Site ID  : 328933e1-8b6a-47a3-b506-bfbb9204944b
AdSense Client   : ca-pub-2844746944687552
Domaine OVH      : wensurco.fr (acheté 3 ans, ~15,58€)
```

---

## 🚀 Déploiement Automatique Netlify

**TOUJOURS utiliser le script `deploy-netlify.ps1`** (à la racine du dossier).
Il utilise l'API File Digest de Netlify (fiable, forward slashes corrects).

```powershell
# Commande pour déployer :
powershell -ExecutionPolicy Bypass -File "C:\Users\linkl\Desktop\CalcAutoEntrepreneur\deploy-netlify.ps1"
```

⚠️ **NE PAS** utiliser `Compress-Archive` + ZIP — ça casse les chemins CSS/JS (backslashes).

### Comment ça marche
1. Calcule SHA1 de chaque fichier
2. Envoie le manifeste à Netlify API
3. Netlify répond avec les fichiers manquants
4. Upload uniquement les fichiers nouveaux/modifiés
5. Déploiement en ~5 secondes

---

## 📄 Pages existantes (27 pages au total)

### Outils calculateurs (pages principales)
| Fichier | Description |
|---------|-------------|
| `index.html` | Page d'accueil |
| `calcul-charges-auto-entrepreneur.html` | Calculateur de charges URSSAF |
| `simulateur-revenu-net-auto-entrepreneur.html` | Simulateur revenu net |
| `plafond-chiffre-affaires-micro-entreprise.html` | Plafonds CA 2025 |
| `indemnites-kilometriques-2025.html` | Calculateur IK |
| `calcul-acre-auto-entrepreneur.html` | Calculateur ACRE |
| `calendrier-declarations-auto-entrepreneur.html` | Calendrier déclarations |
| `comparateur-statuts.html` | Comparateur de statuts |
| `calculateur-cfe.html` | Calculateur de CFE |
| `tableau-de-bord.html` | Tableau de bord personnel (SaaS local) |


### Articles de blog SEO (créés automatiquement)
| Fichier | Sujet |
|---------|-------|
| `guide-auto-entrepreneur-2025.html` | Guide complet 2025 |
| `faq-auto-entrepreneur.html` | FAQ |
| `cfe-auto-entrepreneur-2025.html` | CFE auto-entrepreneur |
| `arret-maladie-auto-entrepreneur.html` | Arrêt maladie |
| `cumul-chomage-auto-entrepreneur.html` | Cumul ARE + AE |
| `retraite-auto-entrepreneur.html` | Retraite micro-entrepreneur |
| `frais-deductibles-micro-entreprise.html` | Frais déductibles ✨ NOUVEAU |
| `tva-auto-entrepreneur.html` | TVA auto-entrepreneur ✨ NOUVEAU |
| `compte-bancaire-pro-auto-entrepreneur.html` | Compte bancaire pro ✨ NOUVEAU |
| `rc-pro-auto-entrepreneur.html` | RC Pro auto-entrepreneur ✨ NOUVEAU |
| `passer-salarie-auto-entrepreneur.html` | Passer salarié à AE ✨ NOUVEAU |
| `mutuelle-tns-auto-entrepreneur.html` | Mutuelle TNS ✨ NOUVEAU |
| `auto-entrepreneur-graphiste.html` | Graphiste auto-entrepreneur ✨ NOUVEAU |
| `auto-entrepreneur-developpeur-web.html` | Développeur web auto-entrepreneur ✨ NOUVEAU |

### Pages légales
- `mentions-legales.html`
- `confidentialite.html`
- `ads.txt` : `google.com, pub-2844746944687552, DIRECT, f08c47fec0942fa0`

---

## 🤖 Système de création automatique de contenu

### Mission
Toutes les 5 heures (quand le quota se recharge), créer **4-5 nouveaux articles** SEO sur des sujets auto-entrepreneur, puis déployer automatiquement sur Netlify.

### Comment relancer le timer automatique (À FAIRE EN PREMIER dans nouvelle conversation)
```
Utilise l'outil schedule avec DurationSeconds=300 (5 min pour tester) 
puis DurationSeconds=18000 (5 heures pour les cycles suivants)
```

### Template d'article (structure obligatoire)
Chaque article doit avoir :
- `<!DOCTYPE html>` + `<html lang="fr">`
- `<meta charset="UTF-8">` + viewport
- Title SEO + meta description unique
- `<link rel="stylesheet" href="css/style.css">`
- Script AdSense `ca-pub-2844746944687552` dans le `<head>`
- Navbar avec tous les outils (inclure ACRE)
- Structure : `.page-header` > `h1` > `.container-narrow` > `.seo-content`
- H2/H3 bien structurés, ~1500 mots, données 2025 précises
- CTA vers outils existants
- Footer avec `mentions-legales.html` et `confidentialite.html`
- Bandeau cookie (script JS en bas de page)
- `<script src="js/ui.js"></script>` avant `</body>`

### Sujets DÉJÀ traités (ne pas refaire)
- cfe-auto-entrepreneur-2025
- arret-maladie-auto-entrepreneur
- cumul-chomage-auto-entrepreneur
- retraite-auto-entrepreneur
- guide-auto-entrepreneur-2025
- faq-auto-entrepreneur
- frais-deductibles-micro-entreprise
- tva-auto-entrepreneur
- compte-bancaire-pro-auto-entrepreneur
- rc-pro-auto-entrepreneur
- passer-salarie-auto-entrepreneur
- mutuelle-tns-auto-entrepreneur
- auto-entrepreneur-graphiste
- auto-entrepreneur-developpeur-web
- auto-entrepreneur-consultant
- auto-entrepreneur-formateur
- radiation-auto-entrepreneur
- auto-entrepreneur-et-salarie
- facturer-auto-entrepreneur
- siren-siret-auto-entrepreneur
- bilan-comptable-auto-entrepreneur
- auto-entrepreneur-etranger
- micro-entreprise-vs-sasu
- auto-entrepreneur-immobilier

### Sujets RESTANTS à traiter (par ordre de priorité SEO)
Aucun (les 24 articles prévus sont rédigés et publiés)

---

## 💰 Monétisation & Revenus

### Actuel : Google AdSense
- Script dans `<head>` de toutes les pages
- `ads.txt` à la racine avec ligne DIRECT Google
- Revenus estimés : 3-8€ RPM (Revenue Per 1000 visitors)
- Niche finance/AE = CPC élevé

### Futur (dans 6-12 mois)
- Comparateur d'assurance RC Pro (affiliation ~30-80€/lead)
- Comparateur mutuelles TNS (affiliation ~20-50€/lead)
- Comparateur banques pro (affiliation ~50-150€/compte)
- Comparateur logiciels comptables (affiliation)

---

## 📊 SEO & Google Search Console
- `sitemap.xml` à la racine (15 URLs avec domaine wensurco.fr)
- À soumettre sur Google Search Console → https://search.google.com/search-console

---

## 🔧 Permissions déjà accordées
- ✅ `write_file` pour `C:\Users\linkl\Desktop\CalcAutoEntrepreneur`
- ✅ `write_file` pour `C:\Users\linkl\.gemini\antigravity\mcp_config.json`
- ✅ `powershell` (toutes commandes)
- ✅ `mcp(chrome_devtools/*)` pour contrôle navigateur
- ✅ `Invoke-WebRequest` et `Invoke-RestMethod`
- ✅ `curl.exe`

---

## 🌐 Configuration Navigateur (Chrome + MCP)

### Navigateur utilisé pour le debug : Chrome (profil isolé)
- **Navigateur quotidien d'Antoine** : Brave (NE PAS TOUCHER)
- **Navigateur debug Antigravity** : Google Chrome avec profil isolé
- **Executable** : `C:\Program Files\Google\Chrome\Application\chrome.exe`
- **Port de debug** : `9222`
- **Profil debug isolé** : `%LOCALAPPDATA%\Google\Chrome\AntigravityDebug`
  → Ce profil est séparé du Chrome personnel, ne contient aucune donnée perso

### Script de lancement
```powershell
# Lancement standard (reconnexion si déjà actif)
powershell -ExecutionPolicy Bypass -File "C:\Users\linkl\Desktop\CalcAutoEntrepreneur\launch-browser.ps1"

# Avec test de toutes les pages (19 pages)
powershell -ExecutionPolicy Bypass -File ".\launch-browser.ps1" -TestPages

# Audit SEO/Performance Lighthouse
powershell -ExecutionPolicy Bypass -File ".\launch-browser.ps1" -Lighthouse

# Fermer l'instance debug Chrome (pas le Chrome perso)
powershell -ExecutionPolicy Bypass -File ".\launch-browser.ps1" -KillDebug
```

### Serveurs MCP configurés (`mcp_config.json`)
| Serveur | Usage | Endpoint |
|---------|-------|----------|
| `notebooks` | DataCloud IDE | proxy bundle |
| `visualization` | Visualisation IDE | proxy bundle |
| `chrome` | Bridge Chrome Extension | `http://127.0.0.1:12306/mcp` |
| `puppeteer` | Automation Chrome (profil AntigravityDebug) | port 9222 |

### Node.js
- **Path** : `C:\Program Files\nodejs` (pas dans PATH par défaut)
- **Utilisation** : `$env:PATH = "C:\Program Files\nodejs;" + $env:PATH`
- **Version** : v24.16.0 / npm 11.13.0
- **chrome-mcp-server** : installé globalement (v1.0.30)
- **Native Messaging Host** : enregistré dans Chrome registry

### DevTools URLs
- `http://127.0.0.1:9222/json/version` — info navigateur
- `http://127.0.0.1:9222/json` — liste des onglets
- `ws://127.0.0.1:9222/devtools/browser/...` — WebSocket DevTools

---

## ⚙️ Règles importantes pour Antigravity

1. **Toujours déployer sur Netlify** après TOUTE modification de fichier du site (HTML, CSS, JS, sitemap.xml). Commande : `powershell -ExecutionPolicy Bypass -File "C:\Users\linkl\Desktop\CalcAutoEntrepreneur\deploy-netlify.ps1"`
2. **Encoding** : Fichiers HTML en UTF-8
3. **CSS classes** : Utiliser uniquement les classes existantes dans `style.css`
4. **Timer** : Si Antoine envoie un message, le timer s'annule — toujours le reprogrammer après
5. **Navigateur** : Utiliser `launch-browser.ps1` — Chrome sur port **9222** avec profil isolé `AntigravityDebug`. NE PAS TOUCHER au Brave d'Antoine (son navigateur personnel).
6. **Node.js** : Ajouter au PATH avant d'utiliser : `$env:PATH = "C:\Program Files\nodejs;" + $env:PATH`

---

*Dernière mise à jour : 2026-05-27 16:48 (Paris)*
