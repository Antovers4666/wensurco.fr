/**
 * Harness de tests des fonctions pures de js/calculators.js
 * Zéro dépendance : node:assert + node:vm. Lancement : npm run test:calc
 *
 * Deux passes :
 *  - Passe A (fallback) : calculators.js chargé sans window.CAE_BAREMES
 *  - Passe B (nominale) : window.CAE_BAREMES injecté depuis data/baremes-officiels.json
 * Les deux passes doivent produire des résultats identiques — c'est le test
 * anti-dérive entre le JSON source de vérité et les fallbacks figés du JS.
 * (La passe B est sautée tant que data/baremes-officiels.json n'existe pas.)
 */

'use strict';

const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const RACINE = path.join(__dirname, '..', '..');
const FICHIER_CALCULATORS = path.join(RACINE, 'js', 'calculators.js');
const FICHIER_BAREMES_JSON = path.join(RACINE, 'data', 'baremes-officiels.json');

// ------------------------------------------------------------
// Chargement de calculators.js dans un bac à sable
// ------------------------------------------------------------

function chargerCAE(baremes) {
  const code = fs.readFileSync(FICHIER_CALCULATORS, 'utf8');
  const fenetre = {};
  if (baremes) fenetre.CAE_BAREMES = baremes;
  const contexte = vm.createContext({ window: fenetre, console });
  vm.runInContext(code, contexte, { filename: 'calculators.js' });
  if (!fenetre.CAE) throw new Error('window.CAE non exposé après chargement de calculators.js');
  return fenetre.CAE;
}

// Aplatissement partagé avec build-baremes/check-baremes (une seule implémentation)
const { aplatirBaremes } = require('../baremes');

// ------------------------------------------------------------
// Mini-runner
// ------------------------------------------------------------

let nbOk = 0;
const echecs = [];

function test(nom, fn) {
  try {
    fn();
    nbOk++;
  } catch (err) {
    echecs.push({ nom, message: err.message });
  }
}

function presque(reel, attendu, tolerance = 0.011, message) {
  assert.ok(Math.abs(reel - attendu) <= tolerance,
    `${message || 'valeur'} : attendu ${attendu}, obtenu ${reel}`);
}

// ------------------------------------------------------------
// Suite de tests (s'applique à un CAE donné)
// ------------------------------------------------------------

function suite(CAE, etiquette) {
  const t = (nom, fn) => test(`[${etiquette}] ${nom}`, fn);

  // Le multiplicateur ACRE dépend de la date d'exécution (bascule 2026-07-01) :
  // on le lit depuis le moteur lui-même pour des tests stables dans le temps.
  const rAcreProbe = CAE.calculerCharges(10000, 'services_commerciaux', true, false);
  const multAcre = rAcreProbe.tauxCotisations / rAcreProbe.tauxCotisationsInitial;

  // --- calculerCharges ---
  t('calculerCharges BNC 50 000 € : cotisations 12 800 €, CFP 100 €, net 37 100 €', () => {
    const r = CAE.calculerCharges(50000, 'liberal_bnc');
    presque(r.cotisationsBase, 12800);
    presque(r.formationPro, 100);
    presque(r.totalCharges, 12900);
    presque(r.netEstime, 37100);
    assert.strictEqual(r.plafond, 83600);
    assert.strictEqual(r.caDepasse, false);
  });

  t('calculerCharges vente 10 000 € : cotisations 1 230 €, CFP 10 €', () => {
    const r = CAE.calculerCharges(10000, 'vente_marchandises');
    presque(r.cotisationsBase, 1230);
    presque(r.formationPro, 10);
    presque(r.netEstime, 8760);
    assert.strictEqual(r.plafond, 203100);
  });

  t('calculerCharges services 40 000 € avec VFL : impôt 680 €, net 30 760 €', () => {
    const r = CAE.calculerCharges(40000, 'services_commerciaux', false, true);
    presque(r.cotisationsBase, 8480);
    presque(r.impotVfl, 680);
    presque(r.netEstime, 30760);
  });

  t('calculerCharges ACRE : réduction appliquée sur cotisations, pas sur la CFP', () => {
    const sans = CAE.calculerCharges(30000, 'artisanal', false, false);
    const avec = CAE.calculerCharges(30000, 'artisanal', true, false);
    presque(avec.cotisationsBase, sans.cotisationsBase * multAcre, 0.02);
    presque(avec.formationPro, sans.formationPro);
  });

  t('calculerCharges : CA nul ou négatif → null', () => {
    assert.strictEqual(CAE.calculerCharges(0, 'liberal_bnc'), null);
    assert.strictEqual(CAE.calculerCharges(-5, 'liberal_bnc'), null);
  });

  t('calculerCharges : dépassement de plafond signalé à 90 000 € services', () => {
    const r = CAE.calculerCharges(90000, 'services_commerciaux');
    assert.strictEqual(r.caDepasse, true);
    assert.strictEqual(r.pourcentagePlafond, 100);
  });

  // --- verifierPlafond (bornes 80 % / 100 % / seuil TVA) ---
  t('verifierPlafond services 30 000 € : statut ok', () => {
    assert.strictEqual(CAE.verifierPlafond(30000, 'services_commerciaux').statut, 'ok');
  });

  t('verifierPlafond services 37 500 € : statut tva (seuil TVA atteint)', () => {
    const r = CAE.verifierPlafond(37500, 'services_commerciaux');
    assert.strictEqual(r.statut, 'tva');
    assert.strictEqual(r.plafondTva, 37500);
  });

  t('verifierPlafond services 66 880 € (80 %) : statut alerte', () => {
    assert.strictEqual(CAE.verifierPlafond(66880, 'services_commerciaux').statut, 'alerte');
  });

  t('verifierPlafond services 83 600 € (100 %) : statut depasse', () => {
    const r = CAE.verifierPlafond(83600, 'services_commerciaux');
    assert.strictEqual(r.statut, 'depasse');
    assert.strictEqual(r.plafondAnnuel, 83600);
  });

  t('verifierPlafond vente : seuil TVA 85 000 €, plafond 203 100 €', () => {
    const r = CAE.verifierPlafond(100000, 'vente_marchandises');
    assert.strictEqual(r.plafondTva, 85000);
    assert.strictEqual(r.plafondAnnuel, 203100);
  });

  t('verifierPlafond mensuel 5 000 € : annualisé à 60 000 €', () => {
    assert.strictEqual(CAE.verifierPlafond(5000, 'services_commerciaux', 'mensuel').caAnnualise, 60000);
  });

  // --- calculerIndemnitesKm ---
  t('indemnités km voiture 5 CV, 4 000 km : 2 544 €', () => {
    presque(CAE.calculerIndemnitesKm(4000, 5, 'voiture').montant, 2544);
  });

  t('indemnités km voiture 5 CV, 10 000 km : palier 2 (× 0,357 + 1 395)', () => {
    presque(CAE.calculerIndemnitesKm(10000, 5, 'voiture').montant, 10000 * 0.357 + 1395);
  });

  t('indemnités km électrique : majoration × 1,20', () => {
    const thermique = CAE.calculerIndemnitesKm(4000, 5, 'voiture', false).montant;
    const electrique = CAE.calculerIndemnitesKm(4000, 5, 'voiture', true).montant;
    presque(electrique, thermique * 1.20, 0.02);
  });

  // --- simulerRevenuNet ---
  t('simulerRevenuNet 3 000 €/mois BNC : net mensuel cohérent avec calculerCharges', () => {
    const r = CAE.simulerRevenuNet(3000, 'liberal_bnc', 'mensuel');
    assert.strictEqual(r.caAnnuel, 36000);
    const attendu = CAE.calculerCharges(36000, 'liberal_bnc').netEstime / 12;
    presque(r.netMensuel, Math.round(attendu * 100) / 100, 0.02);
  });

  // --- calculerAcre ---
  t('calculerAcre : économie année 1 = sansAcre − avecAcre, années 2-3 à 0', () => {
    const r = CAE.calculerAcre(2500, 'services_commerciaux');
    presque(r.annee1.economie, r.annee1.sansAcre - r.annee1.avecAcre, 0.02);
    assert.strictEqual(r.annee2.economie, 0);
    assert.strictEqual(r.annee3.economie, 0);
  });

  // --- comparerVflVsIr ---
  t('comparerVflVsIr BNC 60 000 €, 1 part : VFL 1 320 €, IR 5 166 €, option vfl', () => {
    const r = CAE.comparerVflVsIr(60000, 'liberal_bnc', 1);
    assert.strictEqual(r.charges, 15360);
    assert.strictEqual(r.vfl.impot, 1320);
    assert.strictEqual(r.ir.baseImposable, 39600);
    assert.strictEqual(r.ir.impot, 5166);
    assert.strictEqual(r.meilleureOption, 'vfl');
    assert.strictEqual(r.seuilRfrAcces, 29315);
  });

  t('calculerImpositionIR : 11 294 € pour 1 part → 0 € (tranche à 0 %)', () => {
    assert.strictEqual(CAE.calculerImpositionIR(11294, 1), 0);
  });

  // --- calculerTjm ---
  t('calculerTjm 50 000 € net, services, 25 j congés, 80 % : CA 63 452 €, TJM 336 €', () => {
    const r = CAE.calculerTjm(50000, 'services_commerciaux', 25, 80, false, false);
    assert.strictEqual(r.caAnnuelNecessaire, 63452);
    assert.strictEqual(r.joursFacturables, 189);
    assert.strictEqual(r.tjm, 336);
    assert.strictEqual(r.depassePlafond, false);
    assert.strictEqual(r.plafond, 83600);
  });

  t('calculerTjm : net trop élevé → dépassement de plafond signalé', () => {
    const r = CAE.calculerTjm(80000, 'liberal_bnc', 25, 80, false, false);
    assert.strictEqual(r.depassePlafond, true);
  });

  // --- projeterSeuilTva ---
  t('projeterSeuilTva BNC 30 000 € en 6 mois : TVA dans 2 mois, alerte attention', () => {
    const r = CAE.projeterSeuilTva(30000, 'liberal_bnc', 6);
    assert.strictEqual(r.seuilTva, 37500);
    assert.strictEqual(r.seuilMicro, 83600);
    assert.strictEqual(r.moisAvantTva, 2);
    assert.strictEqual(r.alerteTva, 'attention');
  });

  t('projeterSeuilTva vente : seuil TVA 85 000 €', () => {
    assert.strictEqual(CAE.projeterSeuilTva(20000, 'vente_marchandises', 4).seuilTva, 85000);
  });

  // --- calculerAbattement ---
  t('calculerAbattement BNC 400 € : minimum 305 € appliqué, base 95 €', () => {
    const r = CAE.calculerAbattement(400, 'liberal_bnc');
    assert.strictEqual(r.abattementApplique, 305);
    assert.strictEqual(r.baseImposable, 95);
    assert.strictEqual(r.abattementMinimumApplique, true);
  });

  t('calculerAbattement vente 50 000 € : abattement 71 % = 35 500 €, base 14 500 €', () => {
    const r = CAE.calculerAbattement(50000, 'vente_marchandises');
    assert.strictEqual(r.abattementApplique, 35500);
    assert.strictEqual(r.baseImposable, 14500);
    assert.strictEqual(r.abattementMinimumApplique, false);
  });

  // --- calculerTrimestresRetraite ---
  t('trimestres retraite BNC 20 000 € : base 13 200 €, 4 trimestres', () => {
    const r = CAE.calculerTrimestresRetraite(20000, 'liberal_bnc');
    assert.strictEqual(r.baseCotisation, 13200);
    assert.strictEqual(r.nbTrimestres, 4);
    assert.strictEqual(r.seuilParTrimestre, 1782);
  });

  t('trimestres retraite CIPAV : régime par points → nbTrimestres null', () => {
    assert.strictEqual(CAE.calculerTrimestresRetraite(20000, 'liberal_cipav').nbTrimestres, null);
  });

  // --- acreReductionPourDate (bascule LFSS 2026) ---
  t('acreReductionPourDate : 50 % au 30/06/2026, 25 % au 01/07/2026', () => {
    assert.strictEqual(CAE.acreReductionPourDate(new Date('2026-06-30T12:00:00')), 0.50);
    assert.strictEqual(CAE.acreReductionPourDate(new Date('2026-07-01T12:00:00')), 0.25);
    assert.strictEqual(CAE.acreReductionPourDate(new Date('2027-03-01T12:00:00')), 0.25);
  });

  // --- calendrier / utilitaires ---
  t('genererCalendrierDeclarations trimestriel : 4 échéances', () => {
    assert.strictEqual(CAE.genererCalendrierDeclarations('trimestriel').length, 4);
  });

  t('parseNumber "1 234,56" → 1234.56', () => {
    assert.strictEqual(CAE.parseNumber('1 234,56'), 1234.56);
  });

  // --- constantes exportées (verrou anti-régression du chantier 2026) ---
  t('constantes 2026 exportées : plafonds 203 100/83 600, BNC 25,6 %, TVA 37 500/85 000', () => {
    assert.strictEqual(CAE.PLAFONDS_CA.vente_marchandises, 203100);
    assert.strictEqual(CAE.PLAFONDS_CA.services_commerciaux, 83600);
    assert.strictEqual(CAE.TAUX_COTISATIONS_2025.liberal_bnc, 0.256);
    assert.strictEqual(CAE.PLAFONDS_TVA_2025.services.normal, 37500);
    assert.strictEqual(CAE.PLAFONDS_TVA_2025.vente_marchandises.normal, 85000);
    assert.strictEqual(CAE.ABATTEMENTS_2025.liberal_bnc, 0.34);
    assert.strictEqual(CAE.VFL_TAUX_2025.liberal_bnc, 0.022);
  });
}

// ------------------------------------------------------------
// Comparaison passe A (fallback) vs passe B (barèmes injectés)
// ------------------------------------------------------------

function comparerPasses(caeA, caeB) {
  const sondes = [
    ['calculerCharges', [50000, 'liberal_bnc', false, true]],
    ['calculerCharges', [10000, 'vente_marchandises', true, false]],
    ['verifierPlafond', [70000, 'services_commerciaux']],
    ['comparerVflVsIr', [60000, 'liberal_bnc', 2]],
    ['calculerTjm', [50000, 'services_commerciaux', 25, 80, false, false]],
    ['projeterSeuilTva', [30000, 'liberal_bnc', 6]],
    ['calculerAbattement', [400, 'liberal_bnc']],
    ['calculerTrimestresRetraite', [20000, 'artisanal']],
  ];
  for (const [fonction, args] of sondes) {
    test(`[A≡B] ${fonction}(${args.join(', ')}) identique avec et sans barèmes injectés`, () => {
      // Round-trip JSON : les objets viennent de deux sandboxes vm distinctes
      // (prototypes différents), seul le contenu nous intéresse.
      assert.deepStrictEqual(
        JSON.parse(JSON.stringify(caeB[fonction](...args))),
        JSON.parse(JSON.stringify(caeA[fonction](...args)))
      );
    });
  }
}

// ------------------------------------------------------------
// Exécution
// ------------------------------------------------------------

const caeFallback = chargerCAE(null);
suite(caeFallback, 'fallback');

if (fs.existsSync(FICHIER_BAREMES_JSON)) {
  const { ok, baremes, erreurs } = require('../baremes').loadBaremes();
  if (!ok) {
    console.error('✗ data/baremes-officiels.json invalide :');
    for (const e of erreurs) console.error(`  - ${e}`);
    process.exit(1);
  }
  const caeNominal = chargerCAE(aplatirBaremes(baremes));
  suite(caeNominal, 'nominal');
  comparerPasses(caeFallback, caeNominal);
} else {
  console.log('ℹ data/baremes-officiels.json absent — passe nominale sautée (normal avant le lot 1).');
}

console.log(`\n${nbOk} test(s) OK, ${echecs.length} échec(s).`);
for (const e of echecs) {
  console.error(`✗ ${e.nom}\n  ${e.message}`);
}
process.exit(echecs.length === 0 ? 0 : 1);
