'use strict';
const fs   = require('fs');
const path = require('path');

const PROJECT_ROOT = path.join(__dirname, '..');
const STATE_FILE   = path.join(__dirname, 'state.json');
const TOPICS_FILE  = path.join(__dirname, 'topics.json');

function loadState() {
  if (!fs.existsSync(STATE_FILE)) return { generated: [] };
  try { return JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8')); }
  catch (_) { return { generated: [] }; }
}

function saveState(state) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf-8');
}

function getExistingSlugs() {
  return fs.readdirSync(PROJECT_ROOT)
    .filter(f => f.endsWith('.html'))
    .map(f => f.replace('.html', ''));
}

function pickNextTopic(ga4Pages = []) {
  const topics        = JSON.parse(fs.readFileSync(TOPICS_FILE, 'utf-8'));
  const existingSlugs = new Set(getExistingSlugs());
  const state         = loadState();
  const generatedSet  = new Set(state.generated.map(g => g.slug));

  const available = topics.filter(t => !existingSlugs.has(t.slug) && !generatedSet.has(t.slug));
  if (available.length === 0) return null;

  // Build a traffic score from GA4 data
  const trafficMap = {};
  for (const p of ga4Pages) {
    const key = p.page.replace(/^\//, '').replace('.html', '');
    trafficMap[key] = (p.sessions || 0);
  }

  const scored = available.map(topic => {
    let score = topic.priority * 10;
    for (const kw of (topic.targetKeywords || [])) {
      for (const [page, sessions] of Object.entries(trafficMap)) {
        if (page.includes(kw.toLowerCase())) {
          score += Math.min(sessions / 10, 20);
        }
      }
    }
    return { ...topic, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored[0];
}

function markGenerated(slug, result) {
  const state = loadState();
  state.generated.push({ slug, generatedAt: new Date().toISOString(), ...result });
  saveState(state);
}

function markDeployed(url) {
  const state = loadState();
  state.lastDeploy    = new Date().toISOString();
  state.lastDeployUrl = url;
  saveState(state);
}

function markAudited() {
  const state = loadState();
  state.lastAudit = new Date().toISOString();
  saveState(state);
}

module.exports = { pickNextTopic, markGenerated, markDeployed, markAudited, getExistingSlugs, loadState };
