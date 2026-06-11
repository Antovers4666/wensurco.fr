'use strict';
/**
 * Contrôleur de cohérence entre la source de vérité (data/baremes-officiels.json)
 * et ses consommateurs :
 *   1. les valeurs effectives de js/calculators.js (chargé en sandbox node:vm) ;
 *   2. le fichier généré js/baremes-officiels.js (s'il existe — lot 3+).
 *
 * Lecture seule. Codes de sortie : 0 = cohérent, 1 = dérive détectée, 2 = erreur technique.
 * Lancement : node automation/check-baremes.js (aussi branché en étape 1 du director).
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { loadBaremes, aplatirBaremes, genererContenuJs, palierAcreApplicable } = require('./baremes');

const RACINE = path.join(__dirname, '..');
const FICHIER_CALCULATORS = path.join(RACINE, 'js', 'calculators.js');
const FICHIER_JS_GENERE = path.join(RACINE, 'js', 'baremes-officiels.js');

const derives = [];
function derive(message) { derives.push(message); }

// Charge calculators.js avec une date « gelée » (pour tester les paliers ACRE)
function chargerCAE(dateFixe) {
  const code = fs.readFileSync(FICHIER_CALCULATORS, 'utf8');
  class DateFigee extends Date {
    constructor(...args) {
      if (args.length === 0) super(dateFixe);
      else super(...args);
    }
  }
  const fenetre = {};
  const contexte = vm.createContext({ window: fenetre, console, Date: DateFigee });
  vm.runInContext(code, contexte, { filename: 'calculators.js' });
  return fenetre.CAE;
}

function comparerObjets(nom, reference, effectif) {
  for (const [cle, attendu] of Object.entries(reference)) {
    const obtenu = effectif ? effectif[cle] : undefined;
    if (obtenu !== attendu) {
      derive(`${nom}.${cle} : JSON = ${attendu}, calculators.js = ${obtenu}`);
    }
  }
}

function main() {
  const { ok, baremes, erreurs } = loadBaremes();
  if (!ok) {
    console.error('✗ data/baremes-officiels.json invalide :');
    for (const e of erreurs) console.error(`  - ${e}`);
    process.exit(2);
  }

  const aplati = aplatirBaremes(baremes);
  const CAE = chargerCAE(new Date());

  // 1. Constantes exportées par window.CAE
  comparerObjets('plafonds_ca', aplati.plafonds_ca, CAE.PLAFONDS_CA);
  comparerObjets('taux_cotisations', aplati.taux_cotisations, CAE.TAUX_COTISATIONS_2025);
  comparerObjets('vfl', aplati.vfl, CAE.VFL_TAUX_2025);
  comparerObjets('abattements', aplati.abattements, CAE.ABATTEMENTS_2025);
  comparerObjets('tva.vente_marchandises', aplati.tva.vente_marchandises, CAE.PLAFONDS_TVA_2025 && CAE.PLAFONDS_TVA_2025.vente_marchandises);
  comparerObjets('tva.services', aplati.tva.services, CAE.PLAFONDS_TVA_2025 && CAE.PLAFONDS_TVA_2025.services);

  // 2. Constantes internes (non exportées) — sondées via les résultats de calcul
  for (const [type, cfp] of Object.entries(aplati.formation_pro)) {
    const r = CAE.calculerCharges(10000, type);
    const attendu = Math.round(10000 * cfp * 100) / 100;
    if (!r || r.formationPro !== attendu) {
      derive(`formation_pro.${type} : JSON → CFP ${attendu} € sur 10 000 €, calculators.js → ${r && r.formationPro} €`);
    }
  }

  const rAbatt = CAE.calculerAbattement(100, 'liberal_bnc'); // 34 € < minimum → minimum appliqué
  if (rAbatt.abattementApplique !== aplati.abattement_minimum) {
    derive(`abattement_minimum : JSON = ${aplati.abattement_minimum}, calculators.js applique ${rAbatt.abattementApplique}`);
  }

  const rVfl = CAE.comparerVflVsIr(10000, 'liberal_bnc', 1);
  if (rVfl.seuilRfrAcces !== aplati.seuil_rfr_vfl) {
    derive(`seuil_rfr_vfl : JSON = ${aplati.seuil_rfr_vfl}, calculators.js = ${rVfl.seuilRfrAcces}`);
  }

  // 3. Paliers ACRE — calculators.js rechargé avec une date figée dans chaque palier
  for (const palier of baremes.acre.paliers_reduction) {
    const dateSonde = palier.du ? new Date(`${palier.du}T12:00:00`) : new Date(`${palier.au}T12:00:00`);
    const attendu = palierAcreApplicable(baremes, dateSonde).valeur;
    const caePalier = chargerCAE(dateSonde);
    const probe = caePalier.calculerCharges(10000, 'services_commerciaux', true, false);
    const reductionEffective = Math.round((1 - probe.tauxCotisations / probe.tauxCotisationsInitial) * 1000) / 1000;
    if (reductionEffective !== attendu) {
      derive(`acre au ${dateSonde.toISOString().slice(0, 10)} : JSON = ${attendu}, calculators.js applique ${reductionEffective}`);
    }
  }

  // 4. Fichier généré js/baremes-officiels.js (à partir du lot 3)
  if (fs.existsSync(FICHIER_JS_GENERE)) {
    const present = fs.readFileSync(FICHIER_JS_GENERE, 'utf8');
    const attendu = genererContenuJs(baremes);
    if (present !== attendu) {
      derive('js/baremes-officiels.js ne correspond pas au JSON — relancer npm run build:baremes');
    }
  } else {
    console.log('ℹ js/baremes-officiels.js absent — contrôle du fichier généré sauté (normal avant le lot 3).');
  }

  if (derives.length > 0) {
    console.error(`✗ ${derives.length} dérive(s) entre data/baremes-officiels.json et le site :`);
    for (const d of derives) console.error(`  - ${d}`);
    console.error('Rappel : le JSON est la source de vérité ; corriger calculators.js (ou régénérer le JS) après vérification humaine.');
    process.exit(1);
  }

  console.log(`✓ Cohérence barèmes OK (version ${baremes.meta.version}, vérifié le ${baremes.meta.derniere_verification_humaine}).`);
  process.exit(0);
}

try {
  main();
} catch (err) {
  console.error(`✗ Erreur technique check-baremes : ${err.message}`);
  process.exit(2);
}
