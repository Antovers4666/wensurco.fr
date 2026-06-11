'use strict';
/**
 * Génère js/baremes-officiels.js (window.CAE_BAREMES) depuis data/baremes-officiels.json.
 * À relancer après chaque modification validée du JSON : npm run build:baremes
 * (puis vérifier avec : node automation/check-baremes.js && npm run test:calc)
 *
 * Seul fichier écrit : js/baremes-officiels.js. Aucune page HTML modifiée —
 * le bump des ?v= reste une décision humaine (voir CLAUDE.md, cache-busting).
 */

const fs = require('fs');
const path = require('path');
const { loadBaremes, genererContenuJs } = require('./baremes');

const FICHIER_SORTIE = path.join(__dirname, '..', 'js', 'baremes-officiels.js');

const { ok, baremes, erreurs } = loadBaremes();
if (!ok) {
  console.error('✗ data/baremes-officiels.json invalide — génération refusée :');
  for (const e of erreurs) console.error(`  - ${e}`);
  process.exit(2);
}

const contenu = genererContenuJs(baremes);
const existant = fs.existsSync(FICHIER_SORTIE) ? fs.readFileSync(FICHIER_SORTIE, 'utf8') : null;

if (existant === contenu) {
  console.log(`✓ js/baremes-officiels.js déjà à jour (version ${baremes.meta.version}).`);
  process.exit(0);
}

fs.writeFileSync(FICHIER_SORTIE, contenu, 'utf8');
console.log(`✓ js/baremes-officiels.js ${existant === null ? 'créé' : 'régénéré'} (version ${baremes.meta.version}, vérifié le ${baremes.meta.derniere_verification_humaine}).`);
console.log('  Rappel : bump du ?v= sur les pages concernées + node automation/check-baremes.js + npm run test:calc');
