#!/usr/bin/env node
'use strict';

// ── Chargement du .env ────────────────────────────────────────────────────────
const fs   = require('fs');
const path = require('path');

const ENV_FILE = path.join(__dirname, '..', '.env');
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

// ── Imports ───────────────────────────────────────────────────────────────────
const log             = require('./logger');
const { auditSite, auditFile } = require('./auditor');
const { fetchGA4Stats, formatGA4Report } = require('./ga4');
const { pickNextTopic, markGenerated, markDeployed, markAudited } = require('./decision');
const { generateArticle } = require('./generator');
const { updateSitemap }   = require('./sitemap-updater');
const { injectCard }      = require('./injector');
const { deploy }          = require('./deployer');

const PROJECT_ROOT = path.join(__dirname, '..');

// ── Parse args ────────────────────────────────────────────────────────────────
const args       = process.argv.slice(2);
const DRY_RUN    = args.includes('--dry-run');
const AUDIT_ONLY = args.includes('--audit');
const GA4_ONLY   = args.includes('--ga4');
const FORCE_SLUG = (args.find(a => a.startsWith('--topic=')) || '').split('=')[1];
const HELP       = args.includes('--help') || args.includes('-h');

// ── Helpers ───────────────────────────────────────────────────────────────────
function printHelp() {
  log.raw(`
Usage : node automation/director.js [options]

  (aucun)              Génère 1 article et déploie sur Netlify
  --dry-run            Génère l'article mais ne déploie pas
  --audit              Rapport QA sur tous les fichiers HTML
  --ga4                Affiche les stats GA4 des 30 derniers jours
  --topic=<slug>       Force un sujet spécifique (slug du topics.json)
  --help               Affiche cette aide

Variables .env requises :
  ANTHROPIC_API_KEY    Clé API Anthropic (obligatoire pour générer)
  NETLIFY_TOKEN        Token Netlify (pré-rempli)
  NETLIFY_SITE_ID      Site ID Netlify (pré-rempli)
  GA4_PROPERTY_ID      Propriété GA4 numérique (optionnel)
  GA4_KEY_FILE         Fichier JSON compte de service GA4 (optionnel)
`);
}

function printAuditReport(results) {
  const line = '─'.repeat(72);
  log.raw(`\n${line}`);
  log.raw('  Rapport QA — wensurco.fr');
  log.raw(line);

  let passed = 0, warned = 0, failed = 0;
  for (const r of results) {
    const icon = r.ok ? (r.issues.length ? '⚠ ' : '✓ ') : '✗ ';
    const color = r.ok ? (r.issues.length ? '\x1b[33m' : '\x1b[32m') : '\x1b[31m';
    log.raw(`${color}${icon}\x1b[0m ${r.file.padEnd(50)} ${String(r.wordCount).padStart(5)} mots  ${r.internalLinks} liens`);
    for (const issue of r.issues) log.raw(`     ${issue}`);
    if (!r.ok) failed++;
    else if (r.issues.length) warned++;
    else passed++;
  }

  log.raw(line);
  log.raw(`  Total : ${results.length} fichiers  ✓ ${passed} OK  ⚠ ${warned} avertissements  ✗ ${failed} erreurs`);
  log.raw(line + '\n');
}

function updateModifications(topic, deployUrl) {
  const modFile = path.join(PROJECT_ROOT, 'MODIFICATIONS.md');
  const today   = new Date().toISOString().replace('T', ' ').slice(0, 19);
  const entry = `\n---\n\n## ${today} — Article généré : ${topic.title}\n\n- **Fichier** : \`${topic.slug}.html\`\n- **Catégorie** : ${topic.category}\n- **URL** : https://wensurco.fr/${topic.slug}\n- **Déploiement** : ${deployUrl || 'dry-run'}\n- **Mots-clés** : ${(topic.targetKeywords || []).join(', ')}\n- **Générateur** : automation/director.js (Anthropic Claude)\n`;

  if (fs.existsSync(modFile)) {
    fs.appendFileSync(modFile, entry, 'utf-8');
  } else {
    fs.writeFileSync(modFile, `# Journal des Modifications — wensurco.fr\n${entry}`, 'utf-8');
  }
}

// ── Pipeline principal ────────────────────────────────────────────────────────
async function main() {
  if (HELP) { printHelp(); return; }

  log.banner();
  log.info(`Mode : ${DRY_RUN ? 'DRY-RUN' : AUDIT_ONLY ? 'AUDIT' : GA4_ONLY ? 'GA4' : 'GÉNÉRATION COMPLÈTE'}`);
  if (FORCE_SLUG) log.info(`Sujet forcé : ${FORCE_SLUG}`);

  const {
    ANTHROPIC_API_KEY,
    NETLIFY_TOKEN, NETLIFY_SITE_ID,
    GA4_PROPERTY_ID, GA4_KEY_FILE,
  } = process.env;

  // ── ÉTAPE 1 : AUDIT ──────────────────────────────────────────────────────
  log.step('1/7  AUDIT — Analyse des fichiers HTML existants');
  const { results, failures, warnings, total } = auditSite();
  printAuditReport(results);
  markAudited();

  if (failures.length > 0) {
    log.warn(`${failures.length} fichier(s) avec des erreurs critiques :`);
    for (const f of failures) log.warn(`  → ${f.file} : ${f.issues.filter(i => i.startsWith('❌')).join(', ')}`);
  }

  if (AUDIT_ONLY) {
    log.done('Audit terminé.');
    return;
  }

  // ── ÉTAPE 2 : GA4 ────────────────────────────────────────────────────────
  log.step('2/7  GA4 — Statistiques des 30 derniers jours');
  const ga4 = await fetchGA4Stats(GA4_PROPERTY_ID, GA4_KEY_FILE);
  if (ga4.available) {
    log.ok(`GA4 : ${ga4.pages.length} pages analysées`);
    log.raw(formatGA4Report(ga4.pages));
  } else {
    log.warn(`GA4 non disponible : ${ga4.reason}`);
    log.warn('Fonctionnement sans données de trafic — scores basés sur la priorité des sujets uniquement.');
  }

  if (GA4_ONLY) {
    if (!ga4.available) log.info('Configurez GA4_PROPERTY_ID et GA4_KEY_FILE dans .env pour activer les stats.');
    log.done('Rapport GA4 terminé.');
    return;
  }

  // ── ÉTAPE 3 : DÉCISION ───────────────────────────────────────────────────
  log.step('3/7  DÉCISION — Choix du prochain sujet');

  let topic;
  if (FORCE_SLUG) {
    const topics = JSON.parse(fs.readFileSync(path.join(__dirname, 'topics.json'), 'utf-8'));
    topic = topics.find(t => t.slug === FORCE_SLUG);
    if (!topic) {
      log.error(`Sujet "${FORCE_SLUG}" introuvable dans topics.json`);
      log.info(`Slugs disponibles : ${topics.map(t => t.slug).join(', ')}`);
      process.exit(1);
    }
  } else {
    topic = pickNextTopic(ga4.pages);
  }

  if (!topic) {
    log.done('🎉 Tous les sujets du catalogue ont déjà été traités !');
    log.info('Ajoutez de nouveaux sujets dans automation/topics.json pour continuer.');
    return;
  }

  log.ok(`Sujet retenu : ${topic.title}`);
  log.info(`Slug : ${topic.slug}  |  Priorité : ${topic.priority}  |  Score : ${topic.score?.toFixed(1) || 'N/A'}`);

  // ── ÉTAPE 4 : GÉNÉRATION ─────────────────────────────────────────────────
  log.step('4/7  GÉNÉRATION — Appel API Anthropic (Claude)');
  if (!ANTHROPIC_API_KEY) {
    log.error('ANTHROPIC_API_KEY manquante dans le fichier .env');
    log.info('Ajoutez votre clé API Anthropic dans .env et relancez.');
    process.exit(1);
  }

  const model = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6';
  log.info(`Modèle : ${model}`);

  let html;
  try {
    html = await generateArticle(topic, ANTHROPIC_API_KEY);
  } catch (err) {
    log.error(`Échec de la génération : ${err.message}`);
    process.exit(1);
  }
  log.ok(`Article généré : ${html.length.toLocaleString()} caractères`);

  // ── ÉTAPE 5 : VALIDATION QA ──────────────────────────────────────────────
  log.step('5/7  QA — Validation du HTML généré');

  const outPath = path.join(PROJECT_ROOT, topic.slug + '.html');
  fs.writeFileSync(outPath, html, 'utf-8');
  log.info(`Fichier écrit : ${topic.slug}.html`);

  const qa = auditFile(outPath);
  const criticalIssues = qa.issues.filter(i => i.startsWith('❌'));

  if (criticalIssues.length > 0) {
    log.warn(`QA : ${criticalIssues.length} erreur(s) critique(s) :`);
    for (const issue of criticalIssues) log.warn(`  ${issue}`);

    if (!DRY_RUN) {
      log.error('Article rejeté — erreurs critiques détectées.');
      log.error('Suppression du fichier généré.');
      fs.unlinkSync(outPath);
      process.exit(1);
    } else {
      log.warn('[DRY-RUN] Article conservé malgré les erreurs (mode test).');
    }
  } else if (qa.issues.length > 0) {
    log.warn(`QA : ${qa.issues.length} avertissement(s) :`);
    for (const issue of qa.issues) log.warn(`  ${issue}`);
  } else {
    log.ok(`QA : OK — ${qa.wordCount} mots, ${qa.internalLinks} liens internes`);
  }

  if (DRY_RUN) {
    log.done(`[DRY-RUN] Article disponible : ${topic.slug}.html`);
    log.info('Relancez sans --dry-run pour mettre à jour le sitemap, l\'index et déployer.');
    return;
  }

  // ── ÉTAPE 6 : SITEMAP + INDEX ─────────────────────────────────────────────
  log.step('6/7  PUBLICATION — Mise à jour sitemap.xml et index.html');

  const sitemapUpdated = updateSitemap(topic.slug, topic.priority >= 8 ? 0.8 : 0.7);
  log.ok(`sitemap.xml : ${sitemapUpdated ? 'URL ajoutée' : 'déjà présente'}`);

  try {
    const cardInjected = injectCard(topic);
    log.ok(`index.html : ${cardInjected ? 'carte injectée' : 'carte déjà présente'}`);
  } catch (err) {
    log.warn(`Injection index.html : ${err.message}`);
  }

  // ── ÉTAPE 7 : DÉPLOIEMENT ────────────────────────────────────────────────
  log.step('7/7  GITHUB PAGES — Déploiement en cours...');

  const { execSync } = require('child_process');
  try {
    execSync('git add -A', { cwd: PROJECT_ROOT, stdio: 'pipe' });
    execSync(`git commit -m "Article: ${topic.title}"`, { cwd: PROJECT_ROOT, stdio: 'pipe' });
    execSync('git push origin main', { cwd: PROJECT_ROOT, stdio: 'pipe' });
  } catch (err) {
    log.error(`Échec du déploiement git : ${err.message}`);
    process.exit(1);
  }

  const deployUrl = `https://wensurco.fr/${topic.slug}`;
  log.ok(`Déployé : ${deployUrl}`);

  // ── FINALISATION ──────────────────────────────────────────────────────────
  markGenerated(topic.slug, {
    wordCount: qa.wordCount,
    internalLinks: qa.internalLinks,
    qaStatus: criticalIssues.length ? 'warnings' : 'passed',
    deployUrl,
  });
  markDeployed(deployUrl);
  updateModifications(topic, deployUrl);

  log.raw('');
  log.done(`Article publié : "${topic.title}"`);
  log.raw(`\n  URL en production : \x1b[36mhttps://wensurco.fr/${topic.slug}\x1b[0m`);
  log.raw(`  Mots              : ${qa.wordCount}`);
  log.raw(`  Liens internes    : ${qa.internalLinks}`);
  log.raw(`  Déploiement       : ${deployUrl}`);
  log.raw('');
  log.info('Prochaine action : relancez "node automation/director.js" pour générer un autre article.');
}

main().catch(err => {
  log.error(`Erreur fatale : ${err.message}`);
  if (process.env.DEBUG) console.error(err);
  process.exit(1);
});
