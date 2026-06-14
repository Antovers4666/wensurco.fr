#!/usr/bin/env node
'use strict';
/**
 * Tests de la logique de décision de la veille (automation/veille-baremes.js).
 * Zéro réseau, zéro API : on appelle deciderStatut() avec des signaux synthétiques.
 * Couvre le mécanisme de « tolérance bruit connu » dans les deux sens :
 *   - le faux positif documenté est rétrogradé (pas d'alerte) ;
 *   - toute autre valeur reste une vraie alerte.
 */
const assert = require('node:assert');
const { deciderStatut, arrondir, chargerTolerances } = require('../veille-baremes');

let ok = 0, ko = 0;
function t(nom, fn) {
  try { fn(); ok++; console.log(`  ✓ ${nom}`); }
  catch (e) { ko++; console.error(`  ✗ ${nom}\n    ${e.message}`); }
}

// id surveillés (forme réelle famille.cle)
const CFP_SERVICES = { id: 'formation_professionnelle.services_commerciaux', type: 'pct', libelle: 'CFP services' };
const VENTE_COTIS = { id: 'cotisations_sociales.vente_marchandises', type: 'pct', libelle: 'cotisations vente' };

// Jeu de tolérances explicite (indépendant de la config, pour des cas déterministes)
const TOL = [{ id: 'formation_professionnelle.services_commerciaux', valeur_bruit: 0.001, raison: 'CFP services 0,2 % vs 0,1 % agrégé' }];

console.log('Tests veille — tolérance « bruit connu »\n');

// 1. Faux positif CFP connu (web seul = 0,1 %) → rétrogradé, sans alerte.
t('CFP services, web=0,1 % (mono-signal) → ÉCART TOLÉRÉ, tolere=true', () => {
  const r = deciderStatut({ valScrape: null, valWeb: 0.001, ref: 0.002, scrapeAbsent: false, scrapeErreur: false, item: CFP_SERVICES, tolerances: TOL });
  assert.strictEqual(r.statut, 'ÉCART TOLÉRÉ (bruit connu)');
  assert.strictEqual(r.tolere, true);
});

// 2. Une AUTRE valeur sur le même id déclenche une vraie alerte.
t('CFP services, web=0,3 % (≠ bruit) → ÉCART À VÉRIFIER, tolere=false', () => {
  const r = deciderStatut({ valScrape: null, valWeb: 0.003, ref: 0.002, scrapeAbsent: false, scrapeErreur: false, item: CFP_SERVICES, tolerances: TOL });
  assert.strictEqual(r.statut, 'ÉCART À VÉRIFIER');
  assert.strictEqual(r.tolere, false);
});

// 3. La valeur de bruit sur un AUTRE id n'est pas tolérée (la tolérance est ciblée).
t('Autre id, web=0,1 % → ÉCART À VÉRIFIER (id non listé)', () => {
  const r = deciderStatut({ valScrape: null, valWeb: 0.001, ref: 0.123, scrapeAbsent: false, scrapeErreur: false, item: VENTE_COTIS, tolerances: TOL });
  assert.strictEqual(r.statut, 'ÉCART À VÉRIFIER');
  assert.strictEqual(r.tolere, false);
});

// 4. Deux sources qui divergent ensemble sur la valeur de bruit = écart CONFIRMÉ, jamais toléré.
t('CFP services, scrape=web=0,1 % (2 signaux concordants) → ÉCART CONFIRMÉ, jamais toléré', () => {
  const r = deciderStatut({ valScrape: 0.001, valWeb: 0.001, ref: 0.002, scrapeAbsent: false, scrapeErreur: false, item: CFP_SERVICES, tolerances: TOL });
  assert.strictEqual(r.statut, 'ÉCART CONFIRMÉ');
  assert.strictEqual(r.tolere, false);
});

// 5. Valeur disparue de la page calibrée (absent) : jamais tolérée, même id listé.
t('CFP services, scrapeAbsent=true → ÉCART À VÉRIFIER (absent ≠ bruit toléré)', () => {
  const r = deciderStatut({ valScrape: null, valWeb: null, ref: 0.002, scrapeAbsent: true, scrapeErreur: false, item: CFP_SERVICES, tolerances: TOL });
  assert.strictEqual(r.statut, 'ÉCART À VÉRIFIER');
  assert.strictEqual(r.tolere, false);
});

// 6. Cas nominal : tout concorde.
t('Confirmé : scrape=web=ref → CONFIRMÉ', () => {
  const r = deciderStatut({ valScrape: 0.002, valWeb: 0.002, ref: 0.002, scrapeAbsent: false, scrapeErreur: false, item: CFP_SERVICES, tolerances: TOL });
  assert.strictEqual(r.statut, 'CONFIRMÉ');
  assert.strictEqual(r.tolere, false);
});

// 7. Sans tolérances configurées, le même cas redevient une alerte (la tolérance est opt-in).
t('CFP services, web=0,1 %, tolerances=[] → ÉCART À VÉRIFIER', () => {
  const r = deciderStatut({ valScrape: null, valWeb: 0.001, ref: 0.002, scrapeAbsent: false, scrapeErreur: false, item: CFP_SERVICES, tolerances: [] });
  assert.strictEqual(r.statut, 'ÉCART À VÉRIFIER');
  assert.strictEqual(r.tolere, false);
});

// 8. Garde-fou anti-régression : la config réelle déclare bien la tolérance CFP services à 0,1 %.
t('veille-sources.json déclare la tolérance CFP services à 0,1 %', () => {
  const tol = chargerTolerances().find(x => x.id === 'formation_professionnelle.services_commerciaux');
  assert.ok(tol, 'tolérance CFP services absente de la config');
  assert.strictEqual(arrondir(tol.valeur_bruit), 0.001);
});

console.log(`\n${ok} test(s) OK, ${ko} échec(s).`);
process.exit(ko === 0 ? 0 : 1);
