#!/usr/bin/env node
'use strict';
/**
 * Veille réglementaire des barèmes officiels — DÉTECTION SEULEMENT (garde-fou YMYL).
 *
 * Croise deux signaux indépendants contre data/baremes-officiels.json :
 *   Signal 1 : scraping des fiches officielles (config : automation/veille-sources.json)
 *   Signal 2 : recoupement par recherche web (API Anthropic, server tool web_search,
 *              domaines officiels uniquement)
 *
 * Produit un rapport automation/rapports-veille/AAAA-MM-JJ-veille-baremes.md.
 * N'écrit JAMAIS dans data/, js/ ni les pages HTML : la mise à jour du JSON
 * reste une décision humaine.
 *
 * Usage : npm run veille [-- --sans-web] [-- --fichier=chemin.json]
 * Codes de sortie : 0 = tout confirmé, 1 = écart ou trop d'introuvables, 2 = erreur technique.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { loadBaremes, palierAcreApplicable, prochainPalierAcre, formatEuroFr, formatPctFr } = require('./baremes');

const DOSSIER_RAPPORTS = path.join(__dirname, 'rapports-veille');
const FICHIER_SOURCES = path.join(__dirname, 'veille-sources.json');
const FICHIER_ETAT = path.join(__dirname, 'veille-state.json');
const ENV_FILE = path.join(__dirname, '..', '.env');

const DOMAINES_OFFICIELS = [
  'urssaf.fr', 'autoentrepreneur.urssaf.fr',
  'service-public.fr', 'entreprendre.service-public.fr',
  'economie.gouv.fr', 'impots.gouv.fr',
  'bofip.impots.gouv.fr', 'legifrance.gouv.fr',
];

// ── Args + .env (même parsing manuel que director.js) ────────────────────────
const args = process.argv.slice(2);
const SANS_WEB = args.includes('--sans-web');
const FICHIER_REF = (args.find(a => a.startsWith('--fichier=')) || '').split('=')[1] || undefined;

if (fs.existsSync(ENV_FILE)) {
  for (const line of fs.readFileSync(ENV_FILE, 'utf-8').split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const eq = t.indexOf('=');
    if (eq === -1) continue;
    const key = t.slice(0, eq).trim();
    const val = t.slice(eq + 1).trim();
    if (key && val && !process.env[key]) process.env[key] = val;
  }
}

// ── Liste des valeurs surveillées (construite depuis le JSON de référence) ───
// Chaque entrée : { id, famille, cle, libelle, type ('pct'|'eur'), ref (décimal ou €) }
function construireSurveillance(baremes) {
  const liste = [];
  const labels = {
    vente_marchandises: 'vente de marchandises / hébergement',
    services_commerciaux: 'prestations de services BIC',
    liberal_bnc: 'professions libérales BNC (SSI)',
    liberal_cipav: 'professions libérales CIPAV',
    artisanal: 'prestations de services artisanales',
  };
  const pousser = (famille, cle, libelle, type, ref) =>
    liste.push({ id: `${famille}.${cle}`, famille, cle, libelle, type, ref });

  for (const [cle, env] of Object.entries(baremes.cotisations_sociales.valeurs)) {
    pousser('cotisations_sociales', cle, `taux de cotisations sociales micro-entrepreneur — ${labels[cle]}`, 'pct', env.valeur);
  }
  for (const [cle, env] of Object.entries(baremes.formation_professionnelle.valeurs)) {
    pousser('formation_professionnelle', cle, `taux de contribution à la formation professionnelle (CFP) micro-entrepreneur — ${labels[cle]}`, 'pct', env.valeur);
  }
  pousser('plafonds_ca', 'vente_marchandises', 'plafond de chiffre d\'affaires micro-entreprise — ventes / hébergement', 'eur', baremes.plafonds_ca.valeurs.vente_marchandises.valeur);
  pousser('plafonds_ca', 'services_commerciaux', 'plafond de chiffre d\'affaires micro-entreprise — prestations de services et libéraux', 'eur', baremes.plafonds_ca.valeurs.services_commerciaux.valeur);
  pousser('tva_franchise', 'ventes_normal', 'seuil de franchise en base de TVA — ventes (seuil normal)', 'eur', baremes.tva_franchise.valeurs.ventes_normal.valeur);
  pousser('tva_franchise', 'ventes_majore', 'seuil majoré de franchise en base de TVA — ventes', 'eur', baremes.tva_franchise.valeurs.ventes_majore.valeur);
  pousser('tva_franchise', 'services_normal', 'seuil de franchise en base de TVA — prestations de services (seuil normal)', 'eur', baremes.tva_franchise.valeurs.services_normal.valeur);
  pousser('tva_franchise', 'services_majore', 'seuil majoré de franchise en base de TVA — prestations de services', 'eur', baremes.tva_franchise.valeurs.services_majore.valeur);
  pousser('vfl', 'vente_marchandises', 'taux du versement libératoire de l\'impôt sur le revenu — ventes', 'pct', baremes.vfl.valeurs.vente_marchandises.valeur);
  pousser('vfl', 'services_commerciaux', 'taux du versement libératoire — prestations de services BIC', 'pct', baremes.vfl.valeurs.services_commerciaux.valeur);
  pousser('vfl', 'liberal_bnc', 'taux du versement libératoire — BNC', 'pct', baremes.vfl.valeurs.liberal_bnc.valeur);
  pousser('vfl', 'seuil_rfr_par_part', 'revenu fiscal de référence maximum (N-2, par part) pour accéder au versement libératoire', 'eur', baremes.vfl.valeurs.seuil_rfr_par_part.valeur);
  pousser('acre', 'palier_applicable', 'taux d\'exonération ACRE des cotisations sociales, première année (micro-entrepreneur), en vigueur aujourd\'hui', 'pct', palierAcreApplicable(baremes).valeur);
  const prochain = prochainPalierAcre(baremes);
  if (prochain) {
    pousser('acre', 'prochain_palier', `taux d'exonération ACRE annoncé à compter du ${prochain.du}`, 'pct', prochain.valeur);
  }
  pousser('abattements_fiscaux', 'vente_marchandises', 'abattement forfaitaire micro-BIC — ventes / hébergement', 'pct', baremes.abattements_fiscaux.valeurs.vente_marchandises.valeur);
  pousser('abattements_fiscaux', 'services_commerciaux', 'abattement forfaitaire micro-BIC — prestations de services', 'pct', baremes.abattements_fiscaux.valeurs.services_commerciaux.valeur);
  pousser('abattements_fiscaux', 'liberal_bnc', 'abattement forfaitaire micro-BNC', 'pct', baremes.abattements_fiscaux.valeurs.liberal_bnc.valeur);
  pousser('abattements_fiscaux', 'minimum', 'abattement forfaitaire minimum en euros (art. 50-0 CGI)', 'eur', baremes.abattements_fiscaux.valeurs.minimum.valeur);
  return liste;
}

// ── Signal 1 : scraping ───────────────────────────────────────────────────────

function normaliserTexte(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;|&#160;| | | /g, ' ')
    .replace(/&amp;/g, '&').replace(/&#39;|&apos;/g, "'").replace(/&quot;/g, '"')
    .replace(/&eacute;/g, 'é').replace(/&egrave;/g, 'è').replace(/&agrave;/g, 'à')
    .replace(/\s+/g, ' ')
    .trim();
}

// Mise en forme de la valeur de référence telle qu'elle apparaît dans les pages
function formatRef(item) {
  return item.type === 'eur'
    ? formatEuroFr(item.ref).replace(' €', '')          // « 203 100 »
    : formatPctFr(item.ref).replace(' %', '');          // « 12,3 » / « 50 »
}

function extraireCandidats(texte, motif, type) {
  const fenetreRe = new RegExp(motif.fenetre, 'gi');
  const valeurRe = type === 'eur'
    ? /(\d{1,3}(?: \d{3})+|\d{3,6}) ?€/g
    : /(\d{1,2}(?:,\d{1,2})?) ?%/g;
  const candidats = new Set();
  let m;
  while ((m = fenetreRe.exec(texte)) !== null) {
    const fenetre = texte.slice(m.index, m.index + 400);
    let v;
    while ((v = valeurRe.exec(fenetre)) !== null) {
      const brut = v[1].replace(/ /g, '');
      candidats.add(type === 'eur' ? parseInt(brut, 10) : parseFloat(brut.replace(',', '.')) / 100);
    }
    valeurRe.lastIndex = 0;
  }
  return [...candidats];
}

async function telechargerPage(url) {
  const controleur = new AbortController();
  const minuteur = setTimeout(() => controleur.abort(), 15000);
  try {
    const reponse = await fetch(url, {
      signal: controleur.signal,
      redirect: 'follow',
      headers: { 'User-Agent': 'wensurco-veille/1.0 (+https://wensurco.fr)' },
    });
    if (!reponse.ok) throw new Error(`HTTP ${reponse.status}`);
    return await reponse.text();
  } finally {
    clearTimeout(minuteur);
  }
}

async function lancerScraping(surveillance, etat) {
  const config = JSON.parse(fs.readFileSync(FICHIER_SOURCES, 'utf8'));
  const signaux = {};        // id → { valeur, source } | { erreur }
  const pagesModifiees = [];
  const erreursSources = [];

  for (const source of config.sources) {
    let texte;
    try {
      const html = await telechargerPage(source.url);
      texte = normaliserTexte(html);
    } catch (err) {
      erreursSources.push(`${source.id} (${source.url}) : ${err.message}`);
      for (const motif of source.motifs) {
        const id = `${motif.famille}.${motif.cle}`;
        if (!signaux[id]) signaux[id] = { erreur: err.message, source: source.url };
      }
      continue;
    }

    // Détection « page modifiée » via hash du texte normalisé
    const hash = crypto.createHash('sha256').update(texte).digest('hex');
    const precedent = etat.pages[source.url];
    if (precedent && precedent.sha256 !== hash) pagesModifiees.push(source.url);
    etat.pages[source.url] = { sha256: hash, derniereVeille: new Date().toISOString().slice(0, 10) };

    for (const motif of source.motifs) {
      const id = `${motif.famille}.${motif.cle}`;
      const item = surveillance.find(s => s.id === id);
      if (!item) continue;

      // 1. La valeur de référence figure-t-elle telle quelle dans la page ?
      const unite = item.type === 'eur' ? '€' : '%';
      const presenceRe = new RegExp(`(^|[^\\d,])${formatRef(item).replace(/[.,]/g, '\\$&')}\\s?${unite}`);
      if (presenceRe.test(texte)) {
        signaux[id] = { valeur: item.ref, source: source.url };
        continue;
      }
      // 2. Sinon : extraction dans les fenêtres. Un candidat unique = valeur de
      // remplacement probable ; ambigu ou vide = la valeur attendue a DISPARU de
      // sa page officielle calibrée → suspicion d'écart (jamais de devinette).
      const candidats = extraireCandidats(texte, motif, item.type);
      if (candidats.length === 1) {
        signaux[id] = { valeur: candidats[0], source: source.url };
      } else if (!signaux[id] || (signaux[id].valeur === null && !signaux[id].absent)) {
        signaux[id] = { valeur: null, absent: true, source: source.url, detail: `valeur attendue absente de la page (${candidats.length} candidat(s) d'extraction)` };
      }
    }

    await new Promise(r => setTimeout(r, 1000)); // courtoisie : 1 requête/seconde
  }

  return { signaux, pagesModifiees, erreursSources, nbSources: config.sources.length };
}

// ── Signal 2 : recoupement web (API Anthropic, web_search) ───────────────────

async function lancerRecoupementWeb(surveillance, anneeFiscale) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return { erreur: 'ANTHROPIC_API_KEY absente du .env', signaux: {}, nbRecherches: 0, modele: null };

  const Anthropic = require('@anthropic-ai/sdk');
  const client = new Anthropic({ apiKey });
  const modele = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6';

  const lignes = surveillance.map(s =>
    `- id "${s.id}" : ${s.libelle} (format attendu : ${s.type === 'eur' ? 'montant entier en euros' : 'pourcentage, ex. 21.2'})`
  ).join('\n');

  const prompt = `Tu vérifies les barèmes officiels français de la micro-entreprise (auto-entrepreneur) pour l'année fiscale ${anneeFiscale}, en vigueur aujourd'hui.

Recherche sur le web les valeurs OFFICIELLES ACTUELLES des éléments suivants (uniquement sur les sites officiels autorisés) :
${lignes}

Réponds UNIQUEMENT avec un objet JSON strict, sans aucun texte autour, au format :
{"resultats":[{"id":"<id>","valeur":<nombre ou null>,"url_source":"<url ou null>","confiance":"haute|moyenne|basse"}]}

Règles impératives :
- N'extrapole JAMAIS : si une valeur est introuvable sur les domaines autorisés, mets "valeur": null.
- Les pourcentages en nombre décimal au sens courant (21,2 % → 21.2), les montants en euros en entier (83 600 € → 83600).
- Une entrée par id, tous les ids présents.`;

  const reponse = await client.messages.create({
    model: modele,
    max_tokens: 4000,
    tools: [{
      type: 'web_search_20250305',
      name: 'web_search',
      max_uses: 8,
      allowed_domains: DOMAINES_OFFICIELS,
    }],
    messages: [{ role: 'user', content: prompt }],
  });

  const nbRecherches = (reponse.usage && reponse.usage.server_tool_use && reponse.usage.server_tool_use.web_search_requests) || 0;
  const texte = reponse.content.filter(b => b.type === 'text').map(b => b.text).join('\n');

  // Parse défensif : premier bloc {...} équilibré
  const debut = texte.indexOf('{');
  if (debut === -1) return { erreur: 'réponse sans JSON', signaux: {}, nbRecherches, modele };
  let profondeur = 0, fin = -1;
  for (let i = debut; i < texte.length; i++) {
    if (texte[i] === '{') profondeur++;
    else if (texte[i] === '}') { profondeur--; if (profondeur === 0) { fin = i; break; } }
  }
  if (fin === -1) return { erreur: 'JSON non équilibré dans la réponse', signaux: {}, nbRecherches, modele };

  let parse;
  try {
    parse = JSON.parse(texte.slice(debut, fin + 1));
  } catch (err) {
    return { erreur: `JSON invalide : ${err.message}`, signaux: {}, nbRecherches, modele };
  }

  const signaux = {};
  for (const r of (parse.resultats || [])) {
    if (!r || typeof r.id !== 'string') continue;
    const item = surveillance.find(s => s.id === r.id);
    if (!item) continue;
    if (typeof r.valeur === 'number') {
      // pourcentage « 21.2 » → décimal 0.212 ; euros tels quels
      signaux[r.id] = {
        valeur: item.type === 'pct' ? r.valeur / 100 : r.valeur,
        url: r.url_source || null,
        confiance: r.confiance || 'moyenne',
      };
    } else {
      signaux[r.id] = { valeur: null, url: null, confiance: r.confiance || 'basse' };
    }
  }
  return { signaux, nbRecherches, modele, erreur: null };
}

// ── Comparaison ───────────────────────────────────────────────────────────────

function arrondir(v) { return Math.round(v * 10000) / 10000; }

// Tolérances « bruit connu » : liste en config (automation/veille-sources.json →
// tolerances_connues), chaque entrée { id, valeur_bruit, raison }.
function chargerTolerances() {
  try {
    const config = JSON.parse(fs.readFileSync(FICHIER_SOURCES, 'utf8'));
    return Array.isArray(config.tolerances_connues) ? config.tolerances_connues : [];
  } catch (_) {
    return [];
  }
}

// Une divergence est « tolérée » seulement si elle correspond EXACTEMENT à un bruit
// documenté (même id ET même valeur). N'importe quelle autre valeur reste une alerte.
function estToleree(item, valeurDivergente, tolerances) {
  if (!Array.isArray(tolerances) || valeurDivergente === null || valeurDivergente === undefined) return false;
  return tolerances.some(t => t.id === item.id && arrondir(t.valeur_bruit) === arrondir(valeurDivergente));
}

// Décision de statut — fonction pure (testable hors réseau).
function deciderStatut({ valScrape, valWeb, ref, scrapeAbsent, scrapeErreur, item, tolerances }) {
  const confirme = [valScrape, valWeb].filter(v => v !== null && v === ref).length;
  const divergents = [valScrape, valWeb].filter(v => v !== null && v !== ref);

  if (scrapeErreur && valWeb === null) return { statut: 'ERREUR', tolere: false };
  if (divergents.length === 2 && divergents[0] === divergents[1]) return { statut: 'ÉCART CONFIRMÉ', tolere: false };
  if (divergents.length >= 1 || scrapeAbsent) {
    // Bruit connu : UNE seule source diverge, exactement sur une valeur documentée.
    // Jamais quand les deux sources divergent (écart confirmé) ni quand la valeur a
    // disparu de sa page calibrée (scrapeAbsent) — on ne tolère qu'un faux positif identifié.
    if (divergents.length === 1 && !scrapeAbsent && estToleree(item, divergents[0], tolerances)) {
      return { statut: 'ÉCART TOLÉRÉ (bruit connu)', tolere: true };
    }
    return { statut: 'ÉCART À VÉRIFIER', tolere: false };
  }
  if (confirme >= 1) return { statut: 'CONFIRMÉ', tolere: false };
  return { statut: 'INTROUVABLE', tolere: false };
}

function comparer(surveillance, scrape, web, tolerances = []) {
  return surveillance.map(item => {
    const s = scrape.signaux[item.id];
    const w = web.signaux[item.id];

    const valScrape = s && !s.erreur && s.valeur !== null && s.valeur !== undefined ? arrondir(s.valeur) : null;
    const valWeb = w && w.valeur !== null && w.valeur !== undefined ? arrondir(w.valeur) : null;
    const ref = arrondir(item.ref);
    const scrapeAbsent = Boolean(s && s.absent); // valeur disparue de sa page calibrée

    const { statut, tolere } = deciderStatut({
      valScrape, valWeb, ref, scrapeAbsent,
      scrapeErreur: Boolean(s && s.erreur), item, tolerances,
    });
    const tol = tolere ? tolerances.find(t => t.id === item.id) : null;

    return { item, valScrape, valWeb, ref, statut, tolere, raisonTolerance: tol && tol.raison, sourceScrape: s && s.source, urlWeb: w && w.url, detailScrape: s && (s.erreur || s.detail) };
  });
}

// ── Rapport ───────────────────────────────────────────────────────────────────

function formatVal(item, v) {
  if (v === null || v === undefined) return '—';
  return item.type === 'eur' ? formatEuroFr(v) : formatPctFr(v);
}

function genererRapport({ baremes, resultats, scrape, web, maintenant }) {
  const compte = (st) => resultats.filter(r => r.statut === st).length;
  const ecarts = resultats.filter(r => r.statut.startsWith('ÉCART') && !r.tolere);
  const toleres = resultats.filter(r => r.tolere);
  const lignes = [];

  lignes.push(`# Veille barèmes officiels — ${maintenant.toISOString().slice(0, 10)}`);
  lignes.push('');
  lignes.push(`- Référence : \`data/baremes-officiels.json\` version **${baremes.meta.version}**, dernière vérification humaine le ${baremes.meta.derniere_verification_humaine}`);
  lignes.push(`- Signal 1 (scraping) : ${scrape.nbSources} source(s) officielle(s)${scrape.erreursSources.length ? ` — ${scrape.erreursSources.length} en erreur` : ''}`);
  lignes.push(SANS_WEB
    ? '- Signal 2 (recoupement web) : désactivé (--sans-web)'
    : `- Signal 2 (recoupement web) : ${web.erreur ? `ERREUR (${web.erreur})` : `modèle ${web.modele}, ${web.nbRecherches} recherche(s), domaines officiels uniquement`}`);
  lignes.push('');

  const nbEcart = ecarts.length;
  const nbIntrouvable = compte('INTROUVABLE');
  const nbErreur = compte('ERREUR');
  lignes.push(`## Synthèse : ✅ ${compte('CONFIRMÉ')} confirmé(s) · ⚠️ ${nbEcart} écart(s)${toleres.length ? ` · 🟡 ${toleres.length} toléré(s)` : ''} · ❓ ${nbIntrouvable} introuvable(s) · 💥 ${nbErreur} erreur(s)`);
  lignes.push('');
  lignes.push(nbEcart > 0
    ? '**⚠️ Au moins un écart détecté : vérification humaine requise avant toute mise à jour.**'
    : toleres.length > 0
      ? `**✅ Aucun écart réel. ${toleres.length} écart(s) toléré(s) (bruit connu documenté) — aucune action requise.**`
      : nbIntrouvable + nbErreur === 0
        ? '**✅ Toutes les valeurs du site sont confirmées par les sources officielles.**'
        : '**Aucun écart détecté, mais certaines valeurs n\'ont pas pu être vérifiées (voir tableau).**');
  lignes.push('');

  lignes.push('## Détail valeur par valeur');
  lignes.push('');
  lignes.push('| Famille | Clé | Valeur du site | Scraping | Recherche web | Statut |');
  lignes.push('|---|---|---|---|---|---|');
  for (const r of resultats) {
    lignes.push(`| ${r.item.famille} | ${r.item.cle} | ${formatVal(r.item, r.ref)} | ${formatVal(r.item, r.valScrape)}${r.detailScrape ? ` (${r.detailScrape})` : ''} | ${formatVal(r.item, r.valWeb)} | ${r.statut} |`);
  }
  lignes.push('');

  if (ecarts.length > 0) {
    lignes.push('## ⚠️ Écarts détectés');
    lignes.push('');
    for (const r of ecarts) {
      lignes.push(`### ${r.item.id} — ${r.item.libelle}`);
      lignes.push(`- Valeur actuelle du site : **${formatVal(r.item, r.ref)}**`);
      if (r.valScrape !== null && r.valScrape !== r.ref) lignes.push(`- Scraping : **${formatVal(r.item, r.valScrape)}** (source : ${r.sourceScrape})`);
      if (r.valWeb !== null && r.valWeb !== r.ref) lignes.push(`- Recherche web : **${formatVal(r.item, r.valWeb)}**${r.urlWeb ? ` (source : ${r.urlWeb})` : ''}`);
      lignes.push('');
    }
  }

  if (toleres.length > 0) {
    lignes.push('## 🟡 Écarts tolérés (bruit connu — aucune action requise)');
    lignes.push('');
    for (const r of toleres) {
      const divergent = (r.valWeb !== null && r.valWeb !== r.ref) ? r.valWeb : r.valScrape;
      lignes.push(`### ${r.item.id} — ${r.item.libelle}`);
      lignes.push(`- Valeur du site (référence) : **${formatVal(r.item, r.ref)}**`);
      lignes.push(`- Valeur divergente d'une seule source : **${formatVal(r.item, divergent)}**`);
      if (r.raisonTolerance) lignes.push(`- Raison documentée : ${r.raisonTolerance}`);
      lignes.push('');
    }
  }

  if (scrape.pagesModifiees.length > 0) {
    lignes.push('## ℹ️ Pages officielles modifiées depuis la dernière veille');
    lignes.push('');
    for (const u of scrape.pagesModifiees) lignes.push(`- ${u}`);
    lignes.push('');
  }
  if (scrape.erreursSources.length > 0) {
    lignes.push('## 💥 Sources en erreur technique');
    lignes.push('');
    for (const e of scrape.erreursSources) lignes.push(`- ${e}`);
    lignes.push('');
  }

  lignes.push('## Actions recommandées en cas d\'écart confirmé');
  lignes.push('');
  lignes.push('1. Vérifier **humainement** la valeur sur les URLs officielles citées ci-dessus.');
  lignes.push('2. Si le changement est avéré : éditer `data/baremes-officiels.json` (valeur + `verifie_le` + `meta.version` + `meta.derniere_verification_humaine`).');
  lignes.push('3. Régénérer : `npm run build:baremes`, puis contrôler : `npm run check:baremes` et `npm run test:calc`.');
  lignes.push('4. Bumper les `?v=` des scripts sur les pages, et vérifier les montants dérivés écrits en dur dans les textes (voir `automation/inventaire-plafonds.md` pour la méthode).');
  lignes.push('');
  lignes.push('---');
  lignes.push('*Rapport généré automatiquement par `automation/veille-baremes.js`. **Aucun fichier de données ni page du site n\'a été modifié.***');

  return lignes.join('\n') + '\n';
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const maintenant = new Date();
  const { ok, baremes, erreurs } = loadBaremes(FICHIER_REF);
  if (!ok) {
    console.error('✗ Référence barèmes invalide :');
    for (const e of erreurs) console.error(`  - ${e}`);
    process.exit(2);
  }

  const surveillance = construireSurveillance(baremes);
  console.log(`Veille barèmes — ${surveillance.length} valeurs surveillées (référence version ${baremes.meta.version}).`);

  let etat = { pages: {} };
  if (fs.existsSync(FICHIER_ETAT)) {
    try { etat = JSON.parse(fs.readFileSync(FICHIER_ETAT, 'utf8')); } catch (_) { /* état corrompu : repart de zéro */ }
  }
  if (!etat.pages) etat.pages = {};

  console.log('Signal 1/2 : scraping des sources officielles…');
  const scrape = await lancerScraping(surveillance, etat);
  console.log(`  ${Object.values(scrape.signaux).filter(s => s.valeur !== null && s.valeur !== undefined).length} valeur(s) lue(s), ${scrape.erreursSources.length} source(s) en erreur.`);

  let web = { signaux: {}, nbRecherches: 0, modele: null, erreur: null };
  if (SANS_WEB) {
    console.log('Signal 2/2 : recoupement web désactivé (--sans-web).');
  } else {
    console.log('Signal 2/2 : recoupement par recherche web (API Anthropic)…');
    try {
      web = await lancerRecoupementWeb(surveillance, baremes.meta.annee_fiscale);
      if (web.erreur) console.warn(`  ⚠ Recoupement web indisponible : ${web.erreur} — poursuite avec le seul signal scraping.`);
      else console.log(`  ${Object.values(web.signaux).filter(s => s.valeur !== null).length} valeur(s) recoupées (${web.nbRecherches} recherches).`);
    } catch (err) {
      web = { signaux: {}, nbRecherches: 0, modele: null, erreur: err.message };
      console.warn(`  ⚠ Recoupement web en échec : ${err.message} — poursuite avec le seul signal scraping.`);
    }
  }

  const tolerances = chargerTolerances();
  const resultats = comparer(surveillance, scrape, web, tolerances);

  // Rapport
  fs.mkdirSync(DOSSIER_RAPPORTS, { recursive: true });
  const jour = maintenant.toISOString().slice(0, 10);
  let fichierRapport = path.join(DOSSIER_RAPPORTS, `${jour}-veille-baremes.md`);
  for (let n = 2; fs.existsSync(fichierRapport); n++) {
    fichierRapport = path.join(DOSSIER_RAPPORTS, `${jour}-veille-baremes-${n}.md`);
  }
  fs.writeFileSync(fichierRapport, genererRapport({ baremes, resultats, scrape, web, maintenant }), 'utf8');
  fs.writeFileSync(FICHIER_ETAT, JSON.stringify(etat, null, 2) + '\n', 'utf8');

  // Console + code de sortie
  const nbEcart = resultats.filter(r => r.statut.startsWith('ÉCART') && !r.tolere).length;
  const nbTolere = resultats.filter(r => r.tolere).length;
  const nbIntrouvable = resultats.filter(r => r.statut === 'INTROUVABLE').length;
  const nbErreur = resultats.filter(r => r.statut === 'ERREUR').length;
  const nbConfirme = resultats.filter(r => r.statut === 'CONFIRMÉ').length;

  console.log(`\nRésultat : ✅ ${nbConfirme} confirmé(s) · ⚠️ ${nbEcart} écart(s)${nbTolere ? ` · 🟡 ${nbTolere} toléré(s)` : ''} · ❓ ${nbIntrouvable} introuvable(s) · 💥 ${nbErreur} erreur(s)`);
  console.log(`Rapport : ${path.relative(path.join(__dirname, '..'), fichierRapport)}`);

  if (nbErreur === resultats.length) {
    console.error('✗ Toutes les valeurs en erreur technique.');
    process.exit(2);
  }
  if (nbEcart > 0) {
    console.error('⚠ Écart(s) détecté(s) — vérification humaine requise. AUCUNE modification automatique effectuée.');
    process.exit(1);
  }
  if (nbIntrouvable > resultats.length * 0.3) {
    console.error(`⚠ Trop de valeurs invérifiables (${nbIntrouvable}/${resultats.length}).`);
    process.exit(1);
  }
  console.log('✓ Veille terminée : aucun écart détecté.');
  process.exit(0);
}

if (require.main === module) {
  main().catch(err => {
    console.error(`✗ Erreur fatale veille : ${err.message}`);
    process.exit(2);
  });
}

// Exports pour les tests (automation/tests/test-veille.js) — aucun effet de bord à l'import.
module.exports = { deciderStatut, estToleree, arrondir, chargerTolerances, comparer, construireSurveillance };
