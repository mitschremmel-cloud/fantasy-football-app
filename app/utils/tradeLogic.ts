// app/utils/tradeLogic.ts

/**
 * Berechnet den Wert eines Draft-Picks basierend auf Runde und Jahr.
 * Formel: =ROUND(AVERAGE(112 * EXP(-0,022 * Rank)) * 0,95 * POWER(0,95; year - referenceYear); 0)
 */
export const calculateDraftPickValue = (
  round: number,      // A8
  pickYear: number,   // A7
): number => {
  // A6: Aktuelles Jahr + 1 (Referenzjahr 2027 bei aktuellem Datum 2026)
  const currentYear = new Date().getFullYear();
  const referenceYear = currentYear + 1; 

  // Berechnung des Durchschnittswerts für die 10 Picks der Runde
  let sum = 0;
  for (let i = 1; i <= 10; i++) {
    const rank = (round - 1) * 10 + i;
    sum += 112 * Math.exp(-0.022 * rank);
  }
  const averageBaseValue = sum / 10;

  // Zeit-Diskontierung
  const yearsDifference = pickYear - referenceYear;
  const finalValue = averageBaseValue * 0.95 * Math.pow(0.95, yearsDifference);

  return Math.round(finalValue);
};

/**
 * Berechnet den Wert eines Spielers basierend auf dem RoS-Rank und der aktuellen Woche.
 * Formel: =ROUND(112 * EXP(-0,022 * Rank) * ((17 - Woche) / 16); 0)
 */
export const calculatePlayerValue = (
  rosRank: number,    // D7
  currentWeek: number // D8
): number => {
  // Sicherstellung, dass die Woche innerhalb der Grenzen 1-16 liegt (um Division durch 0 oder negative Faktoren zu vermeiden)
  const safeWeek = Math.max(1, Math.min(16, currentWeek));
  
  // Exponentielle Bewertung
  const baseValue = 112 * Math.exp(-0.022 * rosRank);
  
  // Zeit-Degradierung
  const timeFactor = (17 - safeWeek) / 16;
  
  return Math.round(baseValue * timeFactor);
};