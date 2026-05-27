'use strict';
const fs   = require('fs');
const path = require('path');

const PROJECT_ROOT = path.join(__dirname, '..');

// ─── Blocs réutilisables ──────────────────────────────────────────────────────

const NAVBAR = `<nav class="navbar" id="navbar">
  <div class="container">
    <div class="nav-inner">
      <a href="index.html" class="logo"><div class="logo-icon"><svg width="20" height="20" fill="none" stroke="white" stroke-width="2.5" viewBox="0 0 24 24"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="10" y2="10"/><line x1="14" y1="10" x2="16" y2="10"/></svg></div>Calc<span>Auto</span>Entrepreneur</a>
      <ul class="nav-links" id="nav-links">
        <li><a href="index.html">Accueil</a></li>
        <li><a href="calcul-charges-auto-entrepreneur.html">Charges</a></li>
        <li><a href="plafond-chiffre-affaires-micro-entreprise.html">Plafonds</a></li>
        <li><a href="indemnites-kilometriques-2025.html">IK 2025</a></li>
        <li><a href="simulateur-revenu-net-auto-entrepreneur.html">Revenu net</a></li>
        <li><a href="calcul-acre-auto-entrepreneur.html">ACRE</a></li>
        <li><a href="faq-auto-entrepreneur.html">FAQ</a></li>
        <li><a href="tableau-de-bord.html">Tableau de bord</a></li><li><a href="calcul-charges-auto-entrepreneur.html" class="nav-cta">Calculer</a></li><li><button class="theme-toggle" aria-label="Changer de thème"></button></li>
      </ul>
      <div class="hamburger" id="hamburger"><span></span><span></span><span></span></div>
    </div>
  </div>
</nav>`;

const FOOTER = `<footer>
  <div class="container">
    <div class="footer-grid">
      <div><div class="footer-logo"><div class="logo-icon" style="width:30px;height:30px;"><svg width="16" height="16" fill="none" stroke="white" stroke-width="2.5" viewBox="0 0 24 24"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="10" x2="10" y2="10"/></svg></div>CalcAutoEntrepreneur</div><p class="footer-desc">Outils gratuits pour auto-entrepreneurs. Taux 2025 officiels.</p></div>
      <div class="footer-col"><h4>Outils</h4><ul class="footer-links"><li><a href="calcul-charges-auto-entrepreneur.html">Calcul charges</a></li><li><a href="simulateur-revenu-net-auto-entrepreneur.html">Revenu net</a></li><li><a href="plafond-chiffre-affaires-micro-entreprise.html">Plafond CA</a></li><li><a href="calcul-acre-auto-entrepreneur.html">ACRE</a></li></ul></div>
      <div class="footer-col"><h4>Guides métier</h4><ul class="footer-links"><li><a href="auto-entrepreneur-graphiste.html">Graphiste AE</a></li><li><a href="auto-entrepreneur-developpeur-web.html">Développeur web AE</a></li><li><a href="rc-pro-auto-entrepreneur.html">RC Pro</a></li><li><a href="faq-auto-entrepreneur.html">FAQ</a></li></ul></div>
      <div class="footer-col"><h4>Légal</h4><ul class="footer-links"><li><a href="mentions-legales.html">Mentions légales</a></li><li><a href="confidentialite.html">Confidentialité</a></li></ul></div>
    </div>
    <div class="footer-bottom"><p>© 2025 wensurco.fr — Guide à titre informatif. Consultez un expert-comptable pour toute décision.</p><div class="footer-legal"><a href="mentions-legales.html">Mentions légales</a><a href="confidentialite.html">Confidentialité</a></div></div>
  </div>
</footer>`;

const COOKIE_BANNER = `<div id="cookie-banner" class="cookie-banner" style="display:none;">
  <div class="cookie-inner">
    <p>🍪 Ce site utilise des cookies publicitaires (Google AdSense). En continuant, vous acceptez. <a href="confidentialite.html">En savoir plus</a></p>
    <div class="cookie-actions">
      <button onclick="acceptCookies()" class="btn btn-primary btn-sm">Accepter</button>
      <button onclick="refuseCookies()" class="btn btn-ghost btn-sm" style="color:#CBD5E1;">Refuser</button>
    </div>
  </div>
</div>
<script>(function(){if(!localStorage.getItem('cookieConsent'))document.getElementById('cookie-banner').style.display='flex';})();function acceptCookies(){localStorage.setItem('cookieConsent','accepted');document.getElementById('cookie-banner').style.display='none';}function refuseCookies(){localStorage.setItem('cookieConsent','refused');document.getElementById('cookie-banner').style.display='none';}</script>`;

const HEAD_SCRIPTS = `  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2844746944687552" crossorigin="anonymous"></script>
  <!-- Google Analytics 4 -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-4H7VPXJ6KS"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-4H7VPXJ6KS');
  </script>
  <!-- Microsoft Clarity -->
  <script type="text/javascript">
    (function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, "clarity", "script", "wxp28322ek");
  </script>`;

function getExistingPages() {
  return fs.readdirSync(PROJECT_ROOT)
    .filter(f => f.endsWith('.html'))
    .sort()
    .join('\n');
}

async function generateArticle(topic, apiKey) {
  const Anthropic = require('@anthropic-ai/sdk');
  const client    = new Anthropic({ apiKey });
  const model     = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6';
  const today     = new Date().toISOString().split('T')[0];

  const systemPrompt = `Tu es un expert SEO et rédacteur senior spécialisé dans la micro-entreprise et l'auto-entrepreneuriat en France. Tu rédiges pour wensurco.fr (CalcAutoEntrepreneur), un site d'outils gratuits pour auto-entrepreneurs français.

═══════════════════════════════════════════
RÈGLES ABSOLUES — À RESPECTER SANS EXCEPTION
═══════════════════════════════════════════
1. Tout le contenu est en FRANÇAIS uniquement
2. MINIMUM 1 500 mots de texte réel dans la section .seo-content (hors balises HTML, hors navbar/footer)
3. UNE SEULE balise <h1> — placée dans le bloc .page-header
4. Canonical SANS extension .html : https://wensurco.fr/[slug]
5. UNIQUEMENT les classes CSS listées ci-dessous — aucune autre classe inventée
6. MINIMUM 3 liens internes vers des pages du site (href="page.html") dans le contenu
7. Copier EXACTEMENT les scripts d'analytique, la navbar, le footer et le bandeau cookies fournis
8. Répondre UNIQUEMENT avec du HTML — zéro markdown, zéro explication
9. Commencer directement par <!DOCTYPE html> — rien avant, rien après le HTML

═══════════════════════════════════════════
CLASSES CSS AUTORISÉES (style.css existant)
═══════════════════════════════════════════
Mise en page   : container  container-narrow
En-tête page   : page-header  page-header-meta  page-header-badges  breadcrumb-sep
Badges         : badge  badge-blue  badge-green  badge-amber
Contenu        : seo-content  divider
Boutons        : btn  btn-primary  btn-secondary  btn-sm  btn-lg  btn-ghost
Variables CSS  : --primary  --text  --text-muted  --border  --radius-lg  --bg-surface

Pour les tableaux, encarts colorés et autres éléments : style inline uniquement.

═══════════════════════════════════════════
SCRIPTS OBLIGATOIRES DANS <head> — COPIER EXACTEMENT
═══════════════════════════════════════════
${HEAD_SCRIPTS}

═══════════════════════════════════════════
NAVBAR — COPIER EXACTEMENT DANS <body>
═══════════════════════════════════════════
${NAVBAR}

═══════════════════════════════════════════
FOOTER — COPIER EXACTEMENT AVANT </body>
═══════════════════════════════════════════
${FOOTER}

═══════════════════════════════════════════
BANDEAU COOKIES — COPIER EXACTEMENT APRÈS LE FOOTER
═══════════════════════════════════════════
${COOKIE_BANNER}
<script src="js/ui.js"></script>

═══════════════════════════════════════════
PAGES EXISTANTES — UTILISER POUR LES LIENS INTERNES
═══════════════════════════════════════════
${getExistingPages()}

═══════════════════════════════════════════
STRUCTURE HTML OBLIGATOIRE
═══════════════════════════════════════════
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>[Titre article — 50-60 caractères]</title>
  <meta name="description" content="[120-160 caractères précis avec mot-clé principal]">
  <link rel="canonical" href="https://wensurco.fr/[SLUG-SANS-HTML]">
  <link rel="stylesheet" href="css/style.css">
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "[Titre]",
    "datePublished": "${today}",
    "dateModified": "${today}",
    "description": "[Description]",
    "author": {"@type": "Organization", "name": "wensurco.fr"},
    "publisher": {"@type": "Organization", "name": "CalcAutoEntrepreneur", "url": "https://wensurco.fr"}
  }
  </script>
  [SCRIPTS ANALYTIQUES EXACTEMENT COPIÉS]
</head>
<body>
  [NAVBAR EXACTEMENT COPIÉE]

  <div class="page-header">
    <div class="container">
      <div class="page-header-meta"><a href="index.html">Accueil</a><span class="breadcrumb-sep">›</span><span>[Titre court]</span></div>
      <h1>[Titre H1 unique]</h1>
      <p>[Accroche introductive 1-2 phrases percutantes]</p>
      <div class="page-header-badges">
        <span class="badge badge-blue">✓ Mis à jour 2025</span>
        [1 ou 2 autres badges pertinents selon le sujet]
      </div>
    </div>
  </div>

  <main style="padding:2.5rem 0 4rem;">
    <div class="container-narrow">

      <!-- Sommaire avec ancres -->
      <div style="background:white;border:1px solid var(--border);border-radius:var(--radius-lg);padding:1.5rem;margin-bottom:2.5rem;">
        <h2 style="font-size:1rem;margin-bottom:1rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.05em;">📋 Sommaire</h2>
        <ol style="margin:0;padding-left:1.5rem;display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:0.3rem;font-size:0.9rem;">
          <li><a href="#section1">Titre de la section 1</a></li>
          [etc. — autant de sections que nécessaire]
        </ol>
      </div>

      <div class="seo-content">
        <!-- Introduction : 2-3 paragraphes riches (200-300 mots) -->

        <h2 id="section1">Titre section 1</h2>
        <!-- Contenu détaillé avec données chiffrées réelles -->

        <div class="divider"></div>

        <h2 id="section2">Titre section 2</h2>
        <!-- Tableaux de données, listes, encarts colorés en style inline -->

        <!-- CTA vers calculateur interne -->
        <div style="text-align:center;margin:1.5rem 0;">
          <a href="[page-calculateur].html" class="btn btn-primary btn-sm">Calculer maintenant →</a>
        </div>

        <div class="divider"></div>

        [... minimum 8 sections H2 avec contenu substantiel ...]

        <!-- Conclusion avec appels à l'action -->
      </div>

    </div>
  </main>

  [FOOTER EXACTEMENT COPIÉ]
  [BANDEAU COOKIES EXACTEMENT COPIÉ]
  <script src="js/ui.js"></script>
</body>
</html>`;

  const userPrompt = `Génère l'article HTML complet pour :

Slug       : ${topic.slug}
Titre H1   : ${topic.title}
Description: ${topic.description}
Catégorie  : ${topic.category}
Mots-clés  : ${(topic.targetKeywords || []).join(', ')}
Points clés à traiter :
${(topic.keyPoints || []).map((p, i) => `  ${i + 1}. ${p}`).join('\n')}

RAPPEL : commence DIRECTEMENT par <!DOCTYPE html>, zéro texte avant ou après le HTML.`;

  const response = await client.messages.create({
    model,
    max_tokens: 16000,
    system: systemPrompt,
    messages: [
      { role: 'user', content: userPrompt },
    ],
  });

  const text = response.content[0].text;
  const start = text.indexOf('<!DOCTYPE html>');
  return start >= 0 ? text.slice(start) : text;
}

module.exports = { generateArticle };
