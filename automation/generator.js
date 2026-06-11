'use strict';
const fs   = require('fs');
const path = require('path');

const log = require('./logger');
const { loadBaremes, evaluerFraicheur, renderPromptBlock } = require('./baremes');

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
    <p>🍪 Ce site utilise des cookies publicitaires (AdSense), d'analyse (Google Analytics) et de session (Clarity). Votre consentement est requis. <a href="confidentialite">En savoir plus</a></p>
    <div class="cookie-actions">
      <button onclick="acceptCookies()" class="btn btn-primary btn-sm">Accepter</button>
      <button onclick="refuseCookies()" class="btn btn-ghost btn-sm" style="color:#CBD5E1;">Refuser</button>
    </div>
  </div>
</div>
<script>(function(){if(!localStorage.getItem('cookieConsent'))document.getElementById('cookie-banner').style.display='flex';})();function acceptCookies(){localStorage.setItem('cookieConsent','accepted');document.getElementById('cookie-banner').style.display='none';if(window.loadTrackingScripts)loadTrackingScripts();}function refuseCookies(){localStorage.setItem('cookieConsent','refused');document.getElementById('cookie-banner').style.display='none';}</script>`;

const HEAD_SCRIPTS = `  <!-- Google Consent Mode v2 : refus par defaut (RGPD), annonces non personnalisees pour tous -->
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('consent','default',{'ad_storage':'denied','ad_user_data':'denied','ad_personalization':'denied','analytics_storage':'denied','wait_for_update':500});
  </script>
  <!-- Google AdSense (charge pour tous ; personnalise apres consentement) -->
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2844746944687552" crossorigin="anonymous"></script>
  <script src="js/consent.js?v=20260530"></script>`;

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
  const CURRENT_YEAR = new Date().getFullYear();

  // Garde-fou YMYL : les chiffres du prompt viennent EXCLUSIVEMENT de
  // data/baremes-officiels.json. Fail-closed : aucun bloc de secours hardcodé.
  const { ok, baremes, erreurs } = loadBaremes();
  if (!ok) {
    throw new Error(`data/baremes-officiels.json manquant ou invalide — génération refusée (YMYL). Détail : ${erreurs.join(' ; ')}`);
  }
  const fraicheur = evaluerFraicheur(baremes);
  if (fraicheur.niveau === 'refus') {
    throw new Error(`Barèmes non revalidés — génération refusée (YMYL) : ${fraicheur.message}`);
  }
  if (fraicheur.niveau === 'warn') {
    log.warn(`Barèmes : ${fraicheur.message}`);
  }
  const BLOC_DONNEES_OFFICIELLES = renderPromptBlock(baremes);
  log.info(`Bloc données officielles généré depuis data/baremes-officiels.json (version ${baremes.meta.version}, vérifié le ${baremes.meta.derniere_verification_humaine})`);
  for (const ligne of BLOC_DONNEES_OFFICIELLES.split('\n')) log.info(`  | ${ligne}`);

  const systemPrompt = `Tu es un rédacteur senior spécialisé dans la micro-entreprise française, doublé d'un expert SEO. Tu rédiges pour wensurco.fr (CalcAutoEntrepreneur), un site d'outils gratuits pour auto-entrepreneurs français. Tes articles traitent de sujets YMYL (fiscalité, cotisations sociales) : l'exactitude des chiffres et les sources officielles sont non négociables.

═══════════════════════════════════════════
RÈGLES ABSOLUES — À RESPECTER SANS EXCEPTION
═══════════════════════════════════════════
1. Tout le contenu est en FRANÇAIS uniquement, vouvoiement systématique
2. 1 800 à 2 200 mots de texte réel dans la section .seo-content (hors balises HTML, hors navbar/footer)
3. UNE SEULE balise <h1> — placée dans le bloc .page-header
4. Canonical SANS extension .html : https://wensurco.fr/[slug]
5. UNIQUEMENT les classes CSS listées ci-dessous — aucune autre classe inventée
6. UTILISER EXCLUSIVEMENT les chiffres du bloc « DONNÉES OFFICIELLES VÉRIFIÉES » ci-dessous. Ne JAMAIS inventer un taux, un plafond, un seuil ou une date. Si une donnée nécessaire ne figure pas dans le bloc, utiliser une formulation prudente renvoyant vers la source officielle (« consultez autoentrepreneur.urssaf.fr ») plutôt qu'un chiffre.
7. Copier EXACTEMENT les scripts du <head>, la navbar, le footer et le bandeau cookies fournis
8. Répondre UNIQUEMENT avec du HTML — zéro markdown, zéro explication
9. Commencer directement par <!DOCTYPE html> — rien avant, rien après le HTML

═══════════════════════════════════════════
DONNÉES OFFICIELLES VÉRIFIÉES (seule source de chiffres autorisée)
═══════════════════════════════════════════
${BLOC_DONNEES_OFFICIELLES}

═══════════════════════════════════════════
INTENTION DE RECHERCHE & SEO ON-PAGE
═══════════════════════════════════════════
- Identifie l'intention derrière le mot-clé principal (s'informer, calculer, comparer, agir) et fais-y répondre tout l'article.
- RÉPONSE DIRECTE : juste après l'introduction, un encart (style inline, fond var(--bg-surface), bordure var(--border)) de 2-3 phrases qui répond à la question principale de façon autonome — optimisé pour la position zéro Google.
- Mot-clé principal présent dans : <title>, <h1>, le premier paragraphe, et au moins 2 titres <h2>. Variantes et synonymes ailleurs. JAMAIS de bourrage de mots-clés : la lecture doit rester naturelle.
- <title> de 50-60 caractères incluant l'année ${CURRENT_YEAR} ; meta description de 120-160 caractères avec mot-clé principal + bénéfice concret.
- Ne réécris PAS le contenu d'une page existante de la liste fournie : ton article couvre SON sujet et renvoie vers les pages voisines pour les sujets connexes.

═══════════════════════════════════════════
E-E-A-T (site YMYL — obligatoire)
═══════════════════════════════════════════
- Cite 2 à 4 sources officielles en liens sortants (target="_blank" rel="noopener") aux endroits où des chiffres ou règles apparaissent.
- Termine l'article par un encart « 📚 Sources officielles » (style inline) listant ces liens, suivi de la ligne : « Taux et plafonds vérifiés le ${today}. »
- Inclus une phrase de précaution adaptée au sujet (ex. : « ces informations sont générales ; pour votre situation précise, rapprochez-vous de l'URSSAF ou d'un expert-comptable »).

═══════════════════════════════════════════
PROFONDEUR & ENGAGEMENT
═══════════════════════════════════════════
- 6 à 9 sections <h2>, avec des sous-titres <h3> dès qu'une section dépasse environ 250 mots.
- AU MOINS 1 tableau comparatif (style inline) construit avec les données du bloc officiel.
- AU MOINS 1 cas pratique chiffré complet et nommé (ex. « Léa, graphiste, encaisse 3 000 € en janvier : ... ») avec le calcul détaillé étape par étape utilisant les taux officiels.
- Traite les cas limites du sujet (dépassement de seuil, cumul, première année, changement de statut...).
- Varie les formats toutes les 200-300 mots : paragraphe, liste, tableau, encart coloré — un lecteur qui fait défiler la page doit toujours avoir un élément visuel à proximité.
- SECTION FAQ obligatoire en fin d'article : <h2 id="faq">Questions fréquentes</h2> puis 4 à 6 questions en <h3> formulées comme les recherches réelles des auto-entrepreneurs, réponses de 40-80 mots.
- Conclusion avec un CTA principal vers le calculateur le plus pertinent.
- Ton pédagogique : phrases courtes, jargon systématiquement expliqué à la première occurrence.

═══════════════════════════════════════════
MAILLAGE INTERNE
═══════════════════════════════════════════
- 5 à 8 liens internes (href="page.html") répartis dans le corps du texte, intégrés dans des phrases naturelles.
- Ancres descriptives (« simulez vos charges avec notre calculateur de charges sociales ») — jamais « cliquez ici » ni « cette page ».
- 1 CTA bouton (classes btn btn-primary) vers un calculateur, placé après le cas pratique.

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
  <title>[Titre article — 50-60 caractères avec l'année ${CURRENT_YEAR}]</title>
  <meta name="description" content="[120-160 caractères avec mot-clé principal + bénéfice concret]">
  <meta name="robots" content="index, follow">
  <meta property="og:title" content="[Titre]">
  <meta property="og:description" content="[Description]">
  <meta property="og:type" content="article">
  <meta property="og:url" content="https://wensurco.fr/[SLUG-SANS-HTML]">
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
    "mainEntityOfPage": {"@type": "WebPage", "@id": "https://wensurco.fr/[SLUG-SANS-HTML]"},
    "author": {"@type": "Organization", "name": "wensurco.fr"},
    "publisher": {"@type": "Organization", "name": "CalcAutoEntrepreneur", "url": "https://wensurco.fr"}
  }
  </script>
  <script type="application/ld+json">
  [FAQPage : {"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":"[Question 1]","acceptedAnswer":{"@type":"Answer","text":"[Réponse 1]"}}, ...]} — reprendre EXACTEMENT les questions/réponses de la section FAQ de l'article]
  </script>
  <script type="application/ld+json">
  {"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Accueil","item":"https://wensurco.fr/"},{"@type":"ListItem","position":2,"name":"[Titre court]","item":"https://wensurco.fr/[SLUG-SANS-HTML]"}]}
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
        <span class="badge badge-blue">✓ Mis à jour ${CURRENT_YEAR}</span>
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
        <!-- Introduction : 2-3 paragraphes riches (200-300 mots), mot-clé principal dans le premier paragraphe -->

        <!-- RÉPONSE DIRECTE (position zéro) : encart style inline répondant à la question principale en 2-3 phrases -->

        <h2 id="section1">Titre section 1</h2>
        <!-- Contenu détaillé avec UNIQUEMENT les chiffres du bloc DONNÉES OFFICIELLES VÉRIFIÉES -->

        <div class="divider"></div>

        <h2 id="section2">Titre section 2</h2>
        <!-- Tableau comparatif, listes, encarts colorés en style inline -->

        <!-- Cas pratique chiffré complet, puis CTA vers calculateur interne -->
        <div style="text-align:center;margin:1.5rem 0;">
          <a href="[page-calculateur].html" class="btn btn-primary btn-sm">Calculer maintenant →</a>
        </div>

        <div class="divider"></div>

        [... 6 à 9 sections H2 au total, avec <h3>, cas limites, liens internes contextuels ...]

        <h2 id="faq">Questions fréquentes</h2>
        <!-- 4 à 6 questions <h3> + réponses de 40-80 mots — reprises à l'identique dans le JSON-LD FAQPage -->

        <!-- Conclusion + CTA principal vers le calculateur le plus pertinent -->

        <!-- Encart « 📚 Sources officielles » + ligne « Taux et plafonds vérifiés le ${today}. » -->
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
