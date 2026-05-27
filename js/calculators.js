/**
 * CalcAutoEntrepreneur.fr — Calculators Core
 * Taux et données officiels 2025
 */

// ============================================================
// CONSTANTES OFFICIELLES 2025
// ============================================================

const ANNEE_EN_COURS = 2025;

const TAUX_COTISATIONS_2025 = {
  vente_marchandises:    0.123,   // 12,3%
  services_commerciaux: 0.212,   // 21,2%
  liberal_bnc:          0.246,   // 24,6%
  liberal_cipav:        0.232,   // 23,2%
  meuble_tourisme:      0.060,   // 6,0%
  artisanal:            0.212,   // 21,2%
};

const TAUX_FORMATION_PROFESSIONNELLE_2025 = {
  vente_marchandises:    0.001,   // 0,1%
  services_commerciaux: 0.002,   // 0,2%
  liberal_bnc:          0.002,   // 0,2%
  liberal_cipav:        0.002,   // 0,2%
  meuble_tourisme:      0.001,   // 0,1%
  artisanal:            0.003,   // 0,3%
};

const PLAFONDS_CA_2025 = {
  vente_marchandises:   188700,  // €
  services_commerciaux:  77700,  // €
  liberal_bnc:           77700,  // €
  liberal_cipav:         77700,  // €
  meuble_tourisme:      188700,  // €
  artisanal:             77700,  // €
};

const PLAFONDS_TVA_2025 = {
  vente_marchandises: { normal: 91900, majoré: 91900 },
  services:           { normal: 36800, majoré: 39100 },
};

// ACRE : réduction 50% première année sur cotisations
const ACRE_TAUX_REDUCTION_ANNEE_1 = 0.50;
const ACRE_TAUX_REDUCTION_ANNEE_2 = 0.25;
const ACRE_TAUX_REDUCTION_ANNEE_3 = 0.00;

// Taux d'imposition VFL (Versement Libératoire Forfaitaire)
const VFL_TAUX_2025 = {
  vente_marchandises:    0.010,   // 1%
  services_commerciaux: 0.017,   // 1,7%
  liberal_bnc:          0.022,   // 2,2%
  liberal_cipav:        0.022,   // 2,2%
  meuble_tourisme:      0.010,   // 1%
  artisanal:            0.017,   // 1,7%
};

// Barème kilométrique 2025 (voitures)
// [puissanceFiscale]: [palier1_jusqu5000, palier2_5001a20000, palier3_auDela]
// palier: { coef, fix (optionnel) }
const BAREME_KM_VOITURE_2025 = {
  3: [{ c: 0.529 }, { c: 0.316, f: 1065 }, { c: 0.370 }],
  4: [{ c: 0.606 }, { c: 0.340, f: 1330 }, { c: 0.407 }],
  5: [{ c: 0.636 }, { c: 0.357, f: 1395 }, { c: 0.427 }],
  6: [{ c: 0.665 }, { c: 0.374, f: 1457 }, { c: 0.447 }],
  7: [{ c: 0.697 }, { c: 0.394, f: 1515 }, { c: 0.470 }],
};

const BAREME_KM_MOTO_2025 = {
  1: [{ c: 0.395 }, { c: 0.099, f: 1480 }, { c: 0.248 }],
  2: [{ c: 0.447 }, { c: 0.156, f: 1290 }, { c: 0.291 }],
  3: [{ c: 0.462 }, { c: 0.189, f: 1360 }, { c: 0.327 }],
  5: [{ c: 0.544 }, { c: 0.222, f: 1610 }, { c: 0.383 }],
};

// Majoration véhicule électrique : +20%
const MAJORATION_ELECTRIQUE = 1.20;

// ============================================================
// CALCULATEUR 1 — CHARGES SOCIALES
// ============================================================

/**
 * Calcule les cotisations sociales d'un auto-entrepreneur
 * @param {number} ca - Chiffre d'affaires
 * @param {string} type - Type d'activité
 * @param {boolean} acre - Bénéfice de l'ACRE (1ère année)
 * @param {boolean} vfl - Versement libératoire forfaitaire activé
 * @returns {Object} Résultat détaillé
 */
function calculerCharges(ca, type, acre = false, vfl = false) {
  if (!ca || ca <= 0) return null;

  const plafond = PLAFONDS_CA_2025[type] || 77700;
  const tauxBase = TAUX_COTISATIONS_2025[type] || 0.212;
  const tauxFormation = TAUX_FORMATION_PROFESSIONNELLE_2025[type] || 0.002;
  const tauxVfl = VFL_TAUX_2025[type] || 0.017;

  // Réduction ACRE (1ère année)
  const multiplicateur = acre ? (1 - ACRE_TAUX_REDUCTION_ANNEE_1) : 1;

  const cotisationsBase = ca * tauxBase * multiplicateur;
  const formationPro = ca * tauxFormation;
  const totalCharges = cotisationsBase + formationPro;

  let impotVfl = 0;
  if (vfl) {
    impotVfl = ca * tauxVfl;
  }

  const netEstime = ca - totalCharges - impotVfl;

  const caDepasse = ca > plafond;
  const pourcentagePlafond = Math.min((ca / plafond) * 100, 100);

  return {
    ca,
    type,
    plafond,
    pourcentagePlafond,
    caDepasse,
    tauxCotisations: tauxBase * multiplicateur,
    tauxCotisationsInitial: tauxBase,
    cotisationsBase: Math.round(cotisationsBase * 100) / 100,
    formationPro: Math.round(formationPro * 100) / 100,
    totalCharges: Math.round(totalCharges * 100) / 100,
    impotVfl: Math.round(impotVfl * 100) / 100,
    netEstime: Math.round(netEstime * 100) / 100,
    acre,
    vfl,
    tauxNet: ((netEstime / ca) * 100).toFixed(1),
  };
}

// ============================================================
// CALCULATEUR 3 — VÉRIFICATEUR DE PLAFOND CA
// ============================================================

/**
 * Vérifie le positionnement par rapport aux plafonds
 * @param {number} ca - CA réalisé
 * @param {string} type - Type d'activité
 * @param {string} periode - 'mensuel' | 'annuel' | 'annee_en_cours'
 * @param {number} moisEcoules - Mois écoulés depuis début d'année (1-12)
 * @returns {Object}
 */
function verifierPlafond(ca, type, periode = 'annuel', moisEcoules = 12) {
  const plafondAnnuel = PLAFONDS_CA_2025[type] || 77700;
  const plafondTva = type === 'vente_marchandises'
    ? PLAFONDS_TVA_2025.vente_marchandises.normal
    : PLAFONDS_TVA_2025.services.normal;

  let caAnnualise = ca;
  if (periode === 'mensuel') {
    caAnnualise = ca * 12;
  } else if (periode === 'annee_en_cours') {
    caAnnualise = moisEcoules > 0 ? (ca / moisEcoules) * 12 : ca;
  }

  const pourcentage = Math.min((caAnnualise / plafondAnnuel) * 100, 150);
  const restant = Math.max(plafondAnnuel - caAnnualise, 0);
  const pourcentageTva = Math.min((caAnnualise / plafondTva) * 100, 150);
  const restantTva = Math.max(plafondTva - caAnnualise, 0);

  let statut = 'ok';
  let alertNiveau = 'success';
  let alertMessage = '';

  if (pourcentage >= 100) {
    statut = 'depasse';
    alertNiveau = 'danger';
    alertMessage = `⚠️ Vous avez dépassé le plafond de franchise de TVA. Vous êtes sorti du régime micro-entrepreneur.`;
  } else if (pourcentage >= 80) {
    statut = 'alerte';
    alertNiveau = 'warning';
    alertMessage = `🔶 Attention : vous approchez du plafond (${pourcentage.toFixed(0)}%). Il vous reste ${formatEuro(restant)} de CA possible.`;
  } else if (pourcentageTva >= 100) {
    statut = 'tva';
    alertNiveau = 'warning';
    alertMessage = `📋 Vous avez dépassé le seuil de franchise de TVA (${formatEuro(plafondTva)}). Vous devez facturer la TVA dès maintenant.`;
  } else {
    alertMessage = `✅ Vous êtes dans les limites. Il vous reste ${formatEuro(restant)} de CA annuel possible.`;
  }

  return {
    ca, caAnnualise, type, periode, moisEcoules,
    plafondAnnuel, plafondTva,
    pourcentage: Math.round(pourcentage * 10) / 10,
    restant: Math.round(restant),
    pourcentageTva: Math.round(pourcentageTva * 10) / 10,
    restantTva: Math.round(restantTva),
    statut, alertNiveau, alertMessage,
  };
}

// ============================================================
// CALCULATEUR 4 — INDEMNITÉS KILOMÉTRIQUES
// ============================================================

/**
 * Calcule les indemnités kilométriques selon le barème 2025
 * @param {number} km - Kilomètres parcourus dans l'année
 * @param {number} cv - Puissance fiscale (3-7+)
 * @param {string} vehicule - 'voiture' | 'moto' | 'velo'
 * @param {boolean} electrique - Véhicule électrique
 * @returns {Object}
 */
function calculerIndemnitesKm(km, cv, vehicule = 'voiture', electrique = false) {
  if (!km || km <= 0) return null;

  let montant = 0;
  let detail = '';

  if (vehicule === 'velo') {
    montant = km * 0.25; // Forfait vélo 2025
    detail = `${km} km × 0,25 €/km (forfait vélo)`;
  } else if (vehicule === 'voiture') {
    const cvKey = Math.min(Math.max(parseInt(cv), 3), 7);
    const bareme = BAREME_KM_VOITURE_2025[cvKey];
    if (!bareme) return null;

    if (km <= 5000) {
      montant = km * bareme[0].c;
      detail = `${km} km × ${bareme[0].c} €/km`;
    } else if (km <= 20000) {
      montant = km * bareme[1].c + bareme[1].f;
      detail = `(${km} km × ${bareme[1].c}) + ${bareme[1].f} €`;
    } else {
      montant = km * bareme[2].c;
      detail = `${km} km × ${bareme[2].c} €/km`;
    }
  } else if (vehicule === 'moto') {
    const cvKey = cv <= 1 ? 1 : cv <= 2 ? 2 : cv <= 3 ? 3 : 5;
    const bareme = BAREME_KM_MOTO_2025[cvKey];
    if (!bareme) return null;

    if (km <= 3000) {
      montant = km * bareme[0].c;
      detail = `${km} km × ${bareme[0].c} €/km`;
    } else if (km <= 6000) {
      montant = km * bareme[1].c + bareme[1].f;
      detail = `(${km} km × ${bareme[1].c}) + ${bareme[1].f} €`;
    } else {
      montant = km * bareme[2].c;
      detail = `${km} km × ${bareme[2].c} €/km`;
    }
  }

  if (electrique && vehicule !== 'velo') {
    montant *= MAJORATION_ELECTRIQUE;
    detail += ` × 1,20 (majoration électrique)`;
  }

  return {
    km, cv, vehicule, electrique,
    montant: Math.round(montant * 100) / 100,
    montantMensuel: Math.round((montant / 12) * 100) / 100,
    detail,
    tauxEffectif: (montant / km).toFixed(3),
  };
}

// ============================================================
// CALCULATEUR 2 — SIMULATEUR REVENU NET
// ============================================================

/**
 * Simule le revenu net mensuel et annuel
 * @param {number} ca - Chiffre d'affaires
 * @param {string} type - Type d'activité
 * @param {string} periode - 'mensuel' | 'annuel'
 * @param {boolean} acre - ACRE activé
 * @param {boolean} vfl - Versement libératoire
 * @returns {Object}
 */
function simulerRevenuNet(ca, type, periode = 'mensuel', acre = false, vfl = false) {
  const caAnnuel = periode === 'mensuel' ? ca * 12 : ca;
  const resultAnnuel = calculerCharges(caAnnuel, type, acre, vfl);
  if (!resultAnnuel) return null;

  return {
    ...resultAnnuel,
    caAnnuel,
    caMensuel: Math.round((caAnnuel / 12) * 100) / 100,
    netMensuel: Math.round((resultAnnuel.netEstime / 12) * 100) / 100,
    chargesMensuelles: Math.round((resultAnnuel.totalCharges / 12) * 100) / 100,
    periodeInput: periode,
    // Pour le graphique en camembert
    pieData: [
      { label: 'Revenu net', value: resultAnnuel.netEstime, color: '#10B981' },
      { label: 'Cotisations', value: resultAnnuel.cotisationsBase, color: '#2563EB' },
      { label: 'Formation pro', value: resultAnnuel.formationPro, color: '#93C5FD' },
      ...(vfl ? [{ label: 'Impôt (VFL)', value: resultAnnuel.impotVfl, color: '#F59E0B' }] : []),
    ],
  };
}

// ============================================================
// CALCULATEUR ACRE — Économies sur 3 ans
// ============================================================

function calculerAcre(ca, type) {
  const caAnnuel = ca * 12; // Input = mensuel
  const annee1AvecAcre = calculerCharges(caAnnuel, type, true, false);
  const annee1SansAcre = calculerCharges(caAnnuel, type, false, false);
  const annee2 = calculerCharges(caAnnuel, type, false, false);
  const annee3 = calculerCharges(caAnnuel, type, false, false);

  const economieAnnee1 = annee1SansAcre.totalCharges - annee1AvecAcre.totalCharges;

  return {
    caAnnuel,
    annee1: {
      avecAcre: annee1AvecAcre.totalCharges,
      sansAcre: annee1SansAcre.totalCharges,
      economie: economieAnnee1,
    },
    annee2: { avecAcre: annee2.totalCharges, sansAcre: annee2.totalCharges, economie: 0 },
    annee3: { avecAcre: annee3.totalCharges, sansAcre: annee3.totalCharges, economie: 0 },
    economieTotal: economieAnnee1,
    tauxSansAcre: annee1SansAcre.tauxCotisationsInitial,
    tauxAvecAcre: annee1AvecAcre.tauxCotisations,
  };
}

// ============================================================
// CALENDRIER DÉCLARATIONS
// ============================================================

function genererCalendrierDeclarations(periodicite = 'trimestriel', moisDebut = 1, annee = 2025) {
  const dates = [];

  if (periodicite === 'mensuel') {
    for (let mois = 1; mois <= 12; mois++) {
      const deadline = new Date(annee, mois, 0); // Dernier jour du mois suivant... mais règle URSSAF : déclaration avant le dernier jour du mois suivant
      // En réalité : déclaration du mois M → avant le dernier jour ouvrable du mois M+1
      const moisDeclaration = mois === 12 ? 1 : mois + 1;
      const anneeDeclaration = mois === 12 ? annee + 1 : annee;
      dates.push({
        periode: `${MOIS_NOMS[mois - 1]} ${annee}`,
        deadline: `31 ${MOIS_NOMS[moisDeclaration - 1]} ${anneeDeclaration}`,
        type: 'mensuel',
      });
    }
  } else {
    // Trimestriel
    const trimestres = [
      { periode: `T1 (jan-fév-mars) ${annee}`, deadline: `30 avril ${annee}` },
      { periode: `T2 (avr-mai-juin) ${annee}`, deadline: `31 juillet ${annee}` },
      { periode: `T3 (juil-août-sep) ${annee}`, deadline: `31 octobre ${annee}` },
      { periode: `T4 (oct-nov-déc) ${annee}`, deadline: `31 janvier ${annee + 1}` },
    ];
    return trimestres;
  }

  return dates.slice(moisDebut - 1);
}

const MOIS_NOMS = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];

// ============================================================
// UTILITAIRES DE FORMATAGE
// ============================================================

function formatEuro(montant, decimales = 0) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  }).format(montant);
}

function formatPct(valeur, decimales = 1) {
  return `${parseFloat(valeur).toFixed(decimales).replace('.', ',')} %`;
}

function formatNombre(val) {
  return new Intl.NumberFormat('fr-FR').format(val);
}

function parseNumber(str) {
  if (!str) return 0;
  return parseFloat(str.toString().replace(/\s/g, '').replace(',', '.')) || 0;
}

// Labels affichage
const TYPE_LABELS = {
  vente_marchandises:    'Vente de marchandises / hébergement',
  services_commerciaux: 'Prestations de services (BIC)',
  liberal_bnc:          'Profession libérale (BNC - SSI)',
  liberal_cipav:        'Profession libérale (CIPAV)',
  meuble_tourisme:      'Location meublée de tourisme',
  artisanal:            'Artisanat / services artisanaux',
};

// ============================================================
// COMPARATEUR DE STATUTS
// ============================================================

function comparerStatuts(ca, expenses, type) {
  if (!ca || ca <= 0) return null;
  
  // 1. Auto-entrepreneur
  const rAe = calculerCharges(ca, type, false, true);
  const aeCotis = rAe.totalCharges;
  const aeImpot = rAe.impotVfl;
  const aeNet = Math.max(ca - aeCotis - aeImpot - expenses, 0);

  // 2. EURL (IS)
  const eurlBrut = Math.max(ca - expenses, 0);
  const eurlRemun = eurlBrut / 1.45;
  const eurlCotis = eurlRemun * 0.45;
  const eurlImpot = eurlRemun * 0.10;
  const eurlNet = eurlRemun - eurlImpot;

  // 3. SASU (Dividendes)
  const sasuBrut = Math.max(ca - expenses, 0);
  let sasuIs = 0;
  if (sasuBrut <= 42500) {
    sasuIs = sasuBrut * 0.15;
  } else {
    sasuIs = 42500 * 0.15 + (sasuBrut - 42500) * 0.25;
  }
  const sasuAfterIs = sasuBrut - sasuIs;
  const sasuDivNet = sasuAfterIs * 0.70;

  // 4. SASU (Salaires)
  const sasuSalNet = sasuBrut / 1.75;
  const sasuSalCotis = sasuSalNet * 0.75;
  const sasuSalImpot = sasuSalNet * 0.10;
  const sasuSalNetFinal = sasuSalNet - sasuSalImpot;

  return {
    ca,
    expenses,
    ae: { cotis: aeCotis, impot: aeImpot, net: Math.round(aeNet) },
    eurl: { cotis: eurlCotis, impot: eurlImpot, net: Math.round(eurlNet) },
    sasuDiv: { is: sasuIs, impot: sasuAfterIs * 0.30, net: Math.round(sasuDivNet) },
    sasuSal: { cotis: sasuSalCotis, impot: sasuSalImpot, net: Math.round(sasuSalNetFinal) }
  };
}

// ============================================================
// CALCULATEUR CFE
// ============================================================

function calculerCfe(ca, communeTaux = 'moyen') {
  if (ca <= 5000) {
    return { ca, exonerated: true, min: 0, max: 0, average: 0, estimation: 0, reason: "Chiffre d'affaires inférieur à 5 000 €" };
  }
  
  let brackets = {};
  if (ca <= 10000) {
    brackets = { min: 227, max: 542, average: 380 };
  } else if (ca <= 32600) {
    brackets = { min: 227, max: 1063, average: 645 };
  } else if (ca <= 100000) {
    brackets = { min: 227, max: 2254, average: 1240 };
  } else if (ca <= 250000) {
    brackets = { min: 227, max: 3843, average: 2035 };
  } else {
    brackets = { min: 227, max: 7006, average: 3615 };
  }

  let estimation = brackets.average;
  if (communeTaux === 'faible') estimation = brackets.min;
  if (communeTaux === 'eleve') estimation = brackets.max;

  return {
    ca,
    exonerated: false,
    min: brackets.min,
    max: brackets.max,
    average: brackets.average,
    estimation: Math.round(estimation)
  };
}

// Export pour usage dans les pages HTML
window.CAE = {
  calculerCharges,
  verifierPlafond,
  calculerIndemnitesKm,
  simulerRevenuNet,
  calculerAcre,
  comparerStatuts,
  calculerCfe,
  genererCalendrierDeclarations,
  formatEuro,
  formatPct,
  formatNombre,
  parseNumber,
  TYPE_LABELS,
  PLAFONDS_CA_2025,
  PLAFONDS_TVA_2025,
  TAUX_COTISATIONS_2025,
  ANNEE_EN_COURS,
};
