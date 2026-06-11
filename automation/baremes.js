'use strict';
/**
 * Module partagé d'accès à la source de vérité data/baremes-officiels.json.
 * Consommé par : generator.js (bloc prompt), build-baremes.js (JS site),
 * check-baremes.js (cohérence), veille-baremes.js (référence), tests.
 *
 * Ce module LIT le JSON et ne l'écrit jamais.
 */

const fs = require('fs');
const path = require('path');

const FICHIER_BAREMES = path.join(__dirname, '..', 'data', 'baremes-officiels.json');

// Fraîcheur de la dernière vérification humaine (garde-fou YMYL du générateur)
const FRAICHEUR_WARN_JOURS = 120;   // au-delà : avertissement
const FRAICHEUR_REFUS_JOURS = 270;  // au-delà : refus de générer

const TYPES_ACTIVITE = [
  'vente_marchandises', 'services_commerciaux', 'liberal_bnc',
  'liberal_cipav', 'meuble_tourisme', 'artisanal',
];

const FAMILLES_VALEURS = [
  'cotisations_sociales', 'formation_professionnelle', 'plafonds_ca',
  'tva_franchise', 'vfl', 'abattements_fiscaux',
];

// ------------------------------------------------------------
// Chargement + validation
// ------------------------------------------------------------

function dateValide(s) {
  return typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(Date.parse(s));
}

/**
 * Charge et valide le JSON. Retourne { ok, baremes, erreurs }.
 * @param {string} [fichier] - chemin alternatif (tests / veille --fichier=)
 */
function loadBaremes(fichier = FICHIER_BAREMES) {
  const erreurs = [];
  let json;
  try {
    json = JSON.parse(fs.readFileSync(fichier, 'utf8'));
  } catch (err) {
    return { ok: false, baremes: null, erreurs: [`Lecture/parse impossible (${fichier}) : ${err.message}`] };
  }

  if (!json.meta || json.meta.schema_version !== 1) {
    erreurs.push('meta.schema_version absent ou différent de 1');
  }
  if (!json.meta || typeof json.meta.annee_fiscale !== 'number') {
    erreurs.push('meta.annee_fiscale absent ou non numérique');
  }
  if (!json.meta || !dateValide(json.meta.derniere_verification_humaine)) {
    erreurs.push('meta.derniere_verification_humaine absente ou invalide (AAAA-MM-JJ attendu)');
  }
  if (!json.meta || !Array.isArray(json.meta.sources_prompt) || json.meta.sources_prompt.length === 0) {
    erreurs.push('meta.sources_prompt absent ou vide');
  }

  const verifierEnveloppe = (famille, cle, env, estTaux) => {
    if (!env || typeof env.valeur !== 'number') {
      erreurs.push(`${famille}.${cle} : valeur absente ou non numérique`);
      return;
    }
    if (estTaux && (env.valeur <= 0 || env.valeur >= 1)) {
      erreurs.push(`${famille}.${cle} : taux ${env.valeur} hors de l'intervalle ]0,1[`);
    }
    if (!estTaux && env.valeur <= 0) {
      erreurs.push(`${famille}.${cle} : montant ${env.valeur} non strictement positif`);
    }
    if (env.en_vigueur_depuis !== null && !dateValide(env.en_vigueur_depuis)) {
      erreurs.push(`${famille}.${cle} : en_vigueur_depuis invalide`);
    }
    if (!dateValide(env.verifie_le)) {
      erreurs.push(`${famille}.${cle} : verifie_le absent ou invalide`);
    }
    if (!Array.isArray(env.sources) || env.sources.length === 0 || env.sources.some(s => !s.url)) {
      erreurs.push(`${famille}.${cle} : sources absentes ou sans url`);
    }
  };

  for (const famille of FAMILLES_VALEURS) {
    if (!json[famille] || !json[famille].valeurs) {
      erreurs.push(`famille ${famille} absente ou sans bloc valeurs`);
      continue;
    }
    const valeurs = json[famille].valeurs;
    if (famille === 'tva_franchise') {
      for (const cle of ['ventes_normal', 'ventes_majore', 'services_normal', 'services_majore']) {
        verifierEnveloppe(famille, cle, valeurs[cle], false);
      }
    } else {
      const estTaux = famille !== 'plafonds_ca';
      for (const type of TYPES_ACTIVITE) {
        verifierEnveloppe(famille, type, valeurs[type], estTaux);
      }
      if (famille === 'vfl') verifierEnveloppe(famille, 'seuil_rfr_par_part', valeurs.seuil_rfr_par_part, false);
      if (famille === 'abattements_fiscaux') verifierEnveloppe(famille, 'minimum', valeurs.minimum, false);
    }
  }

  if (!json.acre || !Array.isArray(json.acre.paliers_reduction) || json.acre.paliers_reduction.length === 0) {
    erreurs.push('acre.paliers_reduction absent ou vide');
  } else {
    json.acre.paliers_reduction.forEach((p, i) => {
      if (typeof p.valeur !== 'number' || p.valeur <= 0 || p.valeur >= 1) {
        erreurs.push(`acre.paliers_reduction[${i}] : valeur hors ]0,1[`);
      }
      if (p.du !== null && !dateValide(p.du)) erreurs.push(`acre.paliers_reduction[${i}] : du invalide`);
      if (p.au !== null && !dateValide(p.au)) erreurs.push(`acre.paliers_reduction[${i}] : au invalide`);
    });
  }

  return { ok: erreurs.length === 0, baremes: erreurs.length === 0 ? json : null, erreurs };
}

// ------------------------------------------------------------
// Fraîcheur
// ------------------------------------------------------------

function joursDepuisVerification(baremes, maintenant = new Date()) {
  const verif = new Date(baremes.meta.derniere_verification_humaine);
  return Math.floor((maintenant - verif) / 86400000);
}

/** Retourne { niveau: 'ok'|'warn'|'refus', message } */
function evaluerFraicheur(baremes, maintenant = new Date()) {
  const jours = joursDepuisVerification(baremes, maintenant);
  const anneeCourante = maintenant.getFullYear();
  if (baremes.meta.annee_fiscale !== anneeCourante) {
    return {
      niveau: 'refus',
      message: `annee_fiscale du JSON (${baremes.meta.annee_fiscale}) ≠ année courante (${anneeCourante}) — barèmes à revalider humainement`,
    };
  }
  if (jours > FRAICHEUR_REFUS_JOURS) {
    return { niveau: 'refus', message: `dernière vérification humaine il y a ${jours} jours (> ${FRAICHEUR_REFUS_JOURS})` };
  }
  if (jours > FRAICHEUR_WARN_JOURS) {
    return { niveau: 'warn', message: `dernière vérification humaine il y a ${jours} jours (> ${FRAICHEUR_WARN_JOURS}) — pensez à npm run veille` };
  }
  return { niveau: 'ok', message: `vérifié il y a ${jours} jours` };
}

// ------------------------------------------------------------
// ACRE
// ------------------------------------------------------------

function palierAcreApplicable(baremes, date = new Date()) {
  for (const p of baremes.acre.paliers_reduction) {
    const apresDebut = p.du === null || date >= new Date(p.du);
    const avantFin = p.au === null || date <= new Date(`${p.au}T23:59:59`);
    if (apresDebut && avantFin) return p;
  }
  return null;
}

function prochainPalierAcre(baremes, date = new Date()) {
  return baremes.acre.paliers_reduction.find(p => p.du !== null && new Date(p.du) > date) || null;
}

// ------------------------------------------------------------
// Aplatissement vers window.CAE_BAREMES (forme consommée par le site)
// ------------------------------------------------------------

function aplatirBaremes(baremes) {
  const valeursDe = (famille, exclues = []) => {
    const sortie = {};
    for (const [cle, env] of Object.entries(baremes[famille].valeurs)) {
      if (!exclues.includes(cle)) sortie[cle] = env.valeur;
    }
    return sortie;
  };
  const tva = valeursDe('tva_franchise');
  return {
    meta: {
      version: baremes.meta.version,
      annee_fiscale: baremes.meta.annee_fiscale,
      derniere_verification_humaine: baremes.meta.derniere_verification_humaine,
    },
    taux_cotisations: valeursDe('cotisations_sociales'),
    formation_pro: valeursDe('formation_professionnelle'),
    plafonds_ca: valeursDe('plafonds_ca'),
    tva: {
      vente_marchandises: { normal: tva.ventes_normal, majoré: tva.ventes_majore },
      services: { normal: tva.services_normal, majoré: tva.services_majore },
    },
    vfl: valeursDe('vfl', ['seuil_rfr_par_part']),
    seuil_rfr_vfl: baremes.vfl.valeurs.seuil_rfr_par_part.valeur,
    acre_paliers: baremes.acre.paliers_reduction.map(p => ({ du: p.du, au: p.au, valeur: p.valeur })),
    abattements: valeursDe('abattements_fiscaux', ['minimum']),
    abattement_minimum: baremes.abattements_fiscaux.valeurs.minimum.valeur,
  };
}

/** Contenu exact de js/baremes-officiels.js (utilisé par build-baremes ET check-baremes). */
function genererContenuJs(baremes) {
  const aplati = aplatirBaremes(baremes);
  return `/* FICHIER GÉNÉRÉ — NE PAS ÉDITER À LA MAIN.
 * Source : data/baremes-officiels.json (version ${baremes.meta.version}, vérifié le ${baremes.meta.derniere_verification_humaine})
 * Régénérer : npm run build:baremes */
window.CAE_BAREMES = ${JSON.stringify(aplati, null, 2)};
`;
}

// ------------------------------------------------------------
// Rendu du bloc « DONNÉES OFFICIELLES VÉRIFIÉES » du prompt (generator.js)
// ------------------------------------------------------------

function formatEuroFr(n) {
  return `${String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} €`;
}

function formatPctFr(taux) {
  return `${(taux * 100).toFixed(2).replace(/\.?0+$/, '').replace('.', ',')} %`;
}

function renderPromptBlock(baremes, date = new Date()) {
  const annee = baremes.meta.annee_fiscale;
  const cotis = (type) => baremes.cotisations_sociales.valeurs[type];
  const plafond = (type) => baremes.plafonds_ca.valeurs[type].valeur;
  const tva = (cle) => baremes.tva_franchise.valeurs[cle].valeur;
  const vfl = (type) => baremes.vfl.valeurs[type].valeur;

  const avecPrecision = (env) => {
    const pct = formatPctFr(env.valeur);
    return env.precision_prompt ? `${pct} (${env.precision_prompt})` : pct;
  };

  const lignes = [];
  lignes.push(`COTISATIONS SOCIALES ${annee} (taux micro-social, hors ACRE) :`);
  lignes.push(`- Vente de marchandises (BIC) : ${avecPrecision(cotis('vente_marchandises'))}`);
  if (cotis('services_commerciaux').valeur === cotis('artisanal').valeur) {
    lignes.push(`- Prestations de services BIC / artisanat : ${avecPrecision(cotis('services_commerciaux'))}`);
  } else {
    lignes.push(`- Prestations de services BIC : ${avecPrecision(cotis('services_commerciaux'))}`);
    lignes.push(`- Artisanat : ${avecPrecision(cotis('artisanal'))}`);
  }
  lignes.push(`- Professions libérales BNC (SSI) : ${avecPrecision(cotis('liberal_bnc'))}`);
  lignes.push(`- Professions libérales CIPAV : ${avecPrecision(cotis('liberal_cipav'))}`);

  lignes.push(`PLAFONDS DE CHIFFRE D'AFFAIRES ${annee} :`);
  lignes.push(`- Vente de marchandises / hébergement : ${formatEuroFr(plafond('vente_marchandises'))}`);
  lignes.push(`- Prestations de services / professions libérales : ${formatEuroFr(plafond('services_commerciaux'))}`);

  lignes.push(`FRANCHISE EN BASE DE TVA (seuils ${annee}) :`);
  lignes.push(`- Ventes : ${formatEuroFr(tva('ventes_normal'))} (seuil majoré ${formatEuroFr(tva('ventes_majore'))})`);
  lignes.push(`- Services : ${formatEuroFr(tva('services_normal'))} (seuil majoré ${formatEuroFr(tva('services_majore'))})`);

  const palier = palierAcreApplicable(baremes, date);
  lignes.push(`ACRE : exonération de ${formatPctFr(palier.valeur)} des cotisations sociales la première année (conditions sur autoentrepreneur.urssaf.fr)`);
  const prochain = prochainPalierAcre(baremes, date);
  if (prochain && (new Date(prochain.du) - date) / 86400000 <= 90) {
    const [a, m, j] = prochain.du.split('-');
    lignes.push(`⚠️ ACRE à compter du ${j}/${m}/${a} : exonération de ${formatPctFr(prochain.valeur)} (au lieu de ${formatPctFr(palier.valeur)})`);
  }

  lignes.push(`VERSEMENT LIBÉRATOIRE DE L'IMPÔT SUR LE REVENU : ${formatPctFr(vfl('vente_marchandises'))} ventes / ${formatPctFr(vfl('services_commerciaux'))} services BIC / ${formatPctFr(vfl('liberal_bnc'))} BNC`);

  lignes.push(`SOURCES OFFICIELLES À CITER (liens sortants encouragés) :`);
  for (const url of baremes.meta.sources_prompt) {
    lignes.push(`- ${url}`);
  }

  return lignes.join('\n');
}

module.exports = {
  FICHIER_BAREMES,
  FRAICHEUR_WARN_JOURS,
  FRAICHEUR_REFUS_JOURS,
  TYPES_ACTIVITE,
  loadBaremes,
  joursDepuisVerification,
  evaluerFraicheur,
  palierAcreApplicable,
  prochainPalierAcre,
  aplatirBaremes,
  genererContenuJs,
  renderPromptBlock,
  formatEuroFr,
  formatPctFr,
};
