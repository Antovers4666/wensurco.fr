'use strict';
const fs   = require('fs');
const path = require('path');

const PROJECT_ROOT = path.join(__dirname, '..');

const SKIP_WORD_COUNT = new Set([
  'mentions-legales.html', 'confidentialite.html',
  'tableau-de-bord.html', 'index.html',
]);

const SKIP_LINKS = new Set([
  'mentions-legales.html', 'confidentialite.html',
  'tableau-de-bord.html', 'index.html', 'ads.txt',
]);

function countWords(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[^\wÀ-ÿ\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter(w => w.length > 2).length;
}

function auditFile(filePath) {
  const filename = path.basename(filePath);
  let content;
  try { content = fs.readFileSync(filePath, 'utf-8'); }
  catch (e) { return { file: filename, ok: false, issues: [`❌ Lecture impossible : ${e.message}`], wordCount: 0, internalLinks: 0 }; }

  const issues = [];

  // H1 unique
  const h1s = (content.match(/<h1[\s>]/gi) || []).length;
  if (h1s === 0) issues.push('❌ Aucune balise <h1>');
  if (h1s > 1)  issues.push(`❌ ${h1s} balises <h1> — doit être 1`);

  // Canonical sans .html
  const canon = content.match(/<link[^>]+rel="canonical"[^>]+href="([^"]+)"/i)
             || content.match(/<link[^>]+href="([^"]+)"[^>]+rel="canonical"/i);
  if (!canon)                           issues.push('❌ Balise canonical manquante');
  else if (canon[1].endsWith('.html')) issues.push(`❌ Canonical avec .html : ${canon[1]}`);

  // Scripts tracking
  if (!content.includes('G-4H7VPXJ6KS'))          issues.push('❌ Script GA4 manquant');
  if (!content.includes('wxp28322ek'))             issues.push('❌ Script Clarity manquant');
  if (!content.includes('ca-pub-2844746944687552')) issues.push('❌ Script AdSense manquant');

  // Navbar
  if (!content.includes('class="navbar"'))  issues.push('❌ Navbar manquante');
  if (!content.includes('theme-toggle'))    issues.push('⚠️  Bouton dark mode manquant');

  // Footer
  if (!content.includes('<footer>'))        issues.push('❌ Footer manquant');

  // Cookies
  if (!content.includes('cookie-banner'))   issues.push('⚠️  Bandeau cookies manquant');

  // Mots
  const wordCount = countWords(content);
  if (!SKIP_WORD_COUNT.has(filename) && wordCount < 800)
    issues.push(`⚠️  Contenu court : ${wordCount} mots (min 800)`);

  // Liens internes
  const internalLinks = (content.match(/href="[^"#]+\.html"/g) || []).length;
  if (!SKIP_LINKS.has(filename) && internalLinks < 3)
    issues.push(`⚠️  Seulement ${internalLinks} lien(s) interne(s) (min 3)`);

  return {
    file: filename,
    wordCount,
    internalLinks,
    issues,
    ok: !issues.some(i => i.startsWith('❌')),
  };
}

function auditSite() {
  const htmlFiles = fs.readdirSync(PROJECT_ROOT)
    .filter(f => f.endsWith('.html'))
    .sort();

  const results = htmlFiles.map(f => auditFile(path.join(PROJECT_ROOT, f)));
  const failures = results.filter(r => !r.ok);
  const warnings = results.filter(r => r.ok && r.issues.length > 0);

  return { results, failures, warnings, total: results.length };
}

module.exports = { auditSite, auditFile };
