// utils/KeeperCalculator.ts

export interface PlayerFromDb {
  "Jahre in Folge gekeept": string | number;
  [key: string]: any;
}

export interface FpRanking {
  name: string;
  rank: number;
}

export interface KeeperErgebnis {
  erlaubt: boolean;
  grund?: string;
  finaleRunde?: number;
  feedbackText?: string;
  overallRank?: number;
  aktuelleDraftRunde?: number;
  rundenBonus?: number;
}

// Hilfsfunktion zum Bereinigen von Namen (entfernt Suffixe wie III, Jr, Sr etc. für den Vergleich)
function normalisiereName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+(iii|ii|jr|sr|iv|v)$/, "") // Entfernt bekannte Suffixe am Ende
    .replace(/[^a-z0-9]/g, "");             // Entfernt alle Sonderzeichen und Leerzeichen
}

export function berechneKeeperKosten(
  spielerName: string, 
  playerFromDb: PlayerFromDb | null, 
  fpRankings: FpRanking[]
): KeeperErgebnis {
  let jahreGekeeptHistorisch = 0;
  let ursprungsRunde = 16;
  let istWaiver = true;

  if (playerFromDb) {
    jahreGekeeptHistorisch = parseInt(String(playerFromDb["Jahre in Folge gekeept"]), 10);
    if (isNaN(jahreGekeeptHistorisch)) { jahreGekeeptHistorisch = 0; }

    let zielIndex = 3 - jahreGekeeptHistorisch;
    const jahreSpalten = ["Draft Runde 2022", "Draft Runde 2023", "Draft Runde 2024", "Draft Runde 2025"];
    if (zielIndex < 0) zielIndex = 0;

    const ursprungsRundeRaw = playerFromDb[jahreSpalten[zielIndex]];

    if (ursprungsRundeRaw && ursprungsRundeRaw !== "—" && ursprungsRundeRaw !== "-" && ursprungsRundeRaw !== "" && !isNaN(ursprungsRundeRaw)) {
      ursprungsRunde = parseInt(String(ursprungsRundeRaw), 10);
      istWaiver = (ursprungsRunde === 16);
    }
  }

  if (ursprungsRunde === 1 || ursprungsRunde === 2) {
    return {
      erlaubt: false,
      grund: `Der Spieler "${spielerName}" wurde ursprünglich in Runde ${ursprungsRunde} gedrafted und darf laut den Ligaregeln nicht gekeept werden!`
    };
  }

  const keeperJahrFuerBerechnung = jahreGekeeptHistorisch + 1;

  // Verwendung der Normalisierung für den Vergleich
  const fpSpieler = fpRankings.find(p => 
    normalisiereName(p.name) === normalisiereName(spielerName)
  );
  
  if (!fpSpieler) {
    return {
      erlaubt: false,
      grund: `Der Spieler "${spielerName}" wurde auf FantasyPros nicht gefunden. Berechnung abgebrochen.`
    };
  }

  const overallRank = fpSpieler.rank;
  const aktuelleDraftRunde = Math.trunc((overallRank - 1) / 10) + 1;

  let rundenBonus = 0;
  const bonusMatrix: Record<number, Record<number, number>> = {
    1: { 3: 1, 4: 1, 5: 2, 6: 2, 7: 3, 8: 3, 9: 4, 10: 4, 11: 5, 12: 5, 13: 6, 14: 6, 15: 6, 16: 5 },
    2: { 3: -2, 4: -2, 5: -1, 6: -1, 7: 0, 8: 0, 9: 1, 10: 1, 11: 2, 12: 2, 13: 3, 14: 3, 15: 3, 16: 2 },
    3: { 3: -5, 4: -5, 5: -4, 6: -4, 7: -3, 8: -3, 9: -2, 10: -2, 11: -1, 12: -1, 13: 0, 14: 0, 15: 0, 16: -1 }
  };

// Hilfsfunktion zum Bereinigen von Namen (entfernt Suffixe wie III, Jr, Sr etc. für den Vergleich)
function normalisiereName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+(iii|ii|jr|sr|iv|v|i)$/g, "") // Entfernt bekannte Suffixe am Ende
    .replace(/\.+/g, "")                      // Entfernt Punkte (z.B. Jr.)
    .replace(/\s+/g, "")                      // Entfernt alle Leerzeichen
    .replace(/[^a-z0-9]/g, "");               // Entfernt alle Sonderzeichen
}

  let jahrKey = keeperJahrFuerBerechnung > 3 ? 3 : keeperJahrFuerBerechnung;

  if (bonusMatrix[jahrKey] && bonusMatrix[jahrKey][ursprungsRunde] !== undefined) {
    rundenBonus = bonusMatrix[jahrKey][ursprungsRunde];
  }

  let finaleRunde = aktuelleDraftRunde + rundenBonus;

  if (finaleRunde > 16) {
    finaleRunde = 16;
  }

  const ursprungsText = istWaiver ? "gewaived (Waiver-Regelung). " : `in Runde ${ursprungsRunde} gedrafted. `;
  const jahreText = jahreGekeeptHistorisch === 1 ? "1 Jahr" : `${jahreGekeeptHistorisch} Jahre`;
  const ursprungsAnzeige = istWaiver ? "Waiver" : ursprungsRunde;

  if (finaleRunde <= 0) {
    return {
      erlaubt: false,
      overallRank,
      aktuelleDraftRunde,
      rundenBonus,
      grund: `Der Spieler "${spielerName}" hat einen aktuellen ADP von Runde ${aktuelleDraftRunde}. Er wurde ursprünglich ${ursprungsText}Er wurde bisher ${jahreText} in Folge gekeept (Keeperjahr: ${keeperJahrFuerBerechnung}). Basierend auf der Ursprungsrunde (${ursprungsAnzeige}) und Keeperjahr (${keeperJahrFuerBerechnung}) ergibt sich ein Draft Cap Bonus von: ${rundenBonus >= 0 ? "+" : ""}${rundenBonus}. Da der resultierende Wert die Runde "${finaleRunde}" ist, fällt er aus den Draftrunden. Er kann nicht gekeept werden!`
    };
  }

  const feedbackText = `"${spielerName}" wird auf FantasyPros auf Rang "${overallRank}" geführt. ` +
                       `Das entspricht aktuell Draft-Runde: ${aktuelleDraftRunde}. ` +
                       `Der Spieler wurde ursprünglich ${ursprungsText}` +
                       `Er wurde bisher ${jahreText} in Folge gekeept und befindet sich somit im aktuellen Keeperjahr: ${keeperJahrFuerBerechnung}. ` +
                       `Basierend auf der Ursprungsrunde (${ursprungsAnzeige}) und Keeperjahr (${keeperJahrFuerBerechnung}) ergibt sich ein Draft Cap Bonus von: ${rundenBonus >= 0 ? "+" : ""}${rundenBonus}. ` +
                       `Daraus resultierender Wert ist die Runde "${finaleRunde}".`;

  return {
    erlaubt: true,
    finaleRunde,
    feedbackText,
    overallRank,
    aktuelleDraftRunde,
    rundenBonus
  };
}