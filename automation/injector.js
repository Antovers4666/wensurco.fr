'use strict';
const fs   = require('fs');
const path = require('path');

const INDEX = path.join(__dirname, '..', 'index.html');

const COLORS = [
  '#9C4221', '#059669', '#C05621', '#0891B2',
  '#DC2626', '#D97706', '#F59E0B', '#C05621', '#10B981',
];

function colorForCategory(category) {
  const map = {
    'Métier':      '#C05621',
    'Artisan':     '#D97706',
    'Services':    '#059669',
    'Fiscalité':   '#DC2626',
    'Gestion':     '#0891B2',
    'Comparatif':  '#C05621',
    'Aides':       '#10B981',
    'Protection':  '#9C4221',
    'Commerce':    '#F59E0B',
    'Transport':   '#0891B2',
    'Cumul':       '#C05621',
    'Charges':     '#DC2626',
    'Santé':       '#059669',
    'Outils':      '#C05621',
  };
  return map[category] || COLORS[Math.floor(Math.random() * COLORS.length)];
}

function buildCard(topic) {
  const color = topic.categoryColor || colorForCategory(topic.category);
  return `
      <a href="${topic.slug}.html" style="background:white;border:1px solid var(--border);border-radius:var(--radius-lg);padding:1.5rem;text-decoration:none;display:block;transition:box-shadow 0.2s,transform 0.2s;" onmouseover="this.style.boxShadow='0 4px 20px rgba(37,99,235,0.12)';this.style.transform='translateY(-2px)'" onmouseout="this.style.boxShadow='';this.style.transform=''">
        <div style="font-size:0.7rem;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:${color};margin-bottom:0.5rem;">${topic.category}</div>
        <h3 style="margin:0 0 0.5rem;font-size:1rem;color:var(--text);">${topic.title.replace(/ 2025.*$/, '').replace(/^Auto-Entrepreneur /, '').replace(/^Micro-Entrepreneur /, '')}</h3>
        <p style="margin:0;font-size:0.85rem;color:var(--text-muted);">${topic.description.slice(0, 120)}${topic.description.length > 120 ? '…' : ''}</p>
      </a>`;
}

function injectCard(topic) {
  let content = fs.readFileSync(INDEX, 'utf-8');

  // Idempotent check
  if (content.includes(`href="${topic.slug}.html"`)) return false;

  // Injection point : juste avant la fermeture de la grille d'articles
  const ANCHOR = '<!-- ===== CTA FINAL ===== -->';
  const anchorIdx = content.indexOf(ANCHOR);
  if (anchorIdx === -1) throw new Error("Ancre '<!-- ===== CTA FINAL ===== -->' introuvable dans index.html");

  // Trouver le dernier </div> avant l'ancre (fermeture de la grille)
  const beforeAnchor = content.slice(0, anchorIdx);
  const lastDivClose = beforeAnchor.lastIndexOf('</div>');
  if (lastDivClose === -1) throw new Error('Impossible de trouver la fermeture de grille dans index.html');

  const card = buildCard(topic);
  content = content.slice(0, lastDivClose) + card + '\n\n    ' + content.slice(lastDivClose);

  fs.writeFileSync(INDEX, content, 'utf-8');
  return true;
}

module.exports = { injectCard };
