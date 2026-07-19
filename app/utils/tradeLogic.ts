// app/utils/tradeLogic.ts

/**
 * Berechnet den Wert eines Draft-Picks basierend auf Runde und Jahr.
 * Rigorose Diskontierung: Wert_Zukunft = Wert_Aktuell * (1 - r)^t
 */
export const calculateDraftPickValue = (
  round: number,
  pickYear: number,
): number => {
  const currentYear = new Date().getFullYear();
  // r = 0,30 (30% Wertverlust pro Jahr)
  const r = 0.30;

  // Wenn das Pick-Jahr 2027 ist (t=0), dann kein Abzug.
  // 2028 (t=1) hat 30% Abzug, etc.
  const t = Math.max(0, pickYear - (currentYear));

  // Berechnung des Durchschnittswerts für die 10 Picks der Runde (Basiswert)
  let sum = 0;
  for (let i = 1; i <= 10; i++) {
    const rank = (round - 1) * 10 + i;
    sum += 112 * Math.exp(-0.022 * rank);
  }
  const averageBaseValue = sum / 10;

  // Zeit-Diskontierung: Wert_Zukunft = Wert_Aktuell * (1 - r)^t
  const finalValue = averageBaseValue * Math.pow(1 - r, t);

  return Math.round(finalValue);
};

/**
 * Berechnet den Wert eines Spielers basierend auf dem RoS-Rank.
 * Die ursprüngliche exponentiale Gewichtung ist hier die korrekte Basis,
 * da sie die relativen Unterschiede zwischen den Ranks besser abbildet.
 */
export const calculatePlayerValue = (
  rosRank: number,
  currentWeek: number // bleibt hier als Referenz falls du später Anpassungen willst
): number => {
  // Wir nutzen wieder die exponentielle Formel, die die Power-Kurve der Rankings perfekt abbildet
  // 112 * EXP(-0,022 * Rank) ist der Standard-Algorithmus für Dynasty-Charts
  const baseValue = 112 * Math.exp(-0.022 * rosRank);
  
  return Math.round(baseValue);
};