// utils/nflverse/qb/scoringsystem.ts
import { getStatsByPosition } from './baseStats';

export interface ScoringWeights {
  passTd: number;
  passYd: number;
  int: number;
  rushYd: number;
  rushTd: number;
  fumble: number;
  fumbleLost: number;
  comp: number;    // Punkte pro Completion
  incmp: number;
}

export async function calculateSimulation(year: number, weights: ScoringWeights) {
  const data = await getStatsByPosition(year, 'QB');
  
  const playerMap = new Map<string, any>();

  data.forEach(row => {
    const week = Number(row.week || 0);
    if (week > 18) return; // Nur die ersten 18 Wochen berücksichtigen

    const id = row.player_id;
    // Wir zählen die Anzahl der Einträge für diesen Spieler, das entspricht den Wochen
    const stats = playerMap.get(id) || { 
      name: row.player_name, 
      tds: 0, yds: 0, ints: 0, 
      rushYds: 0, rushTds: 0, 
      fumbles: 0, fumblesLost: 0, 
      games: 0, // Hier wird die Anzahl der Wochen gezählt
      completions: 0,
      twoPtConv: 0,
      attempts: 0
    };
    
    stats.tds += Number(row.passing_tds || 0);
    stats.yds += Number(row.passing_yards || 0);
    stats.ints += Number(row.passing_interceptions || 0);
    stats.rushYds += Number(row.rushing_yards || 0);
    stats.rushTds += Number(row.rushing_tds || row.rush_td || 0);
    stats.fumbles += Number(row.fumbles || 0);
    stats.fumblesLost += Number(row.fumbles_lost || 0);
    stats.games += 1; // Jede Zeile im CSV ist eine Woche
    stats.completions += Number(row.passing_completions || row.completions || 0);
    stats.attempts += Number(row.passing_attempts || row.attempts || 0);
    stats.twoPtConv += Number(row.passing_2pt_conversions || 0); // Spaltenname im nflverse oft passing_2pt_conversions
    
    playerMap.set(id, stats);
  });

  return Array.from(playerMap.values())
    .map(p => {
      const games = p.games > 0 ? p.games : 1;

      const getPoints = (w: ScoringWeights) => 
       (Number(p.tds) * Number(w.passTd)) + 
(Number(p.yds) * Number(w.passYd)) - 
       (Number(p.ints) * Number(w.int)) +
       (Number(p.rushYds) * Number(w.rushYd)) +
       (Number(p.twoPtConv) * 2) +
       (Number(p.rushTds) * Number(w.rushTd)) -
       (Number(p.fumbles) * Number(w.fumble)) -
       (Number(p.fumblesLost) * Number(w.fumbleLost)) +
       (Number(p.completions) * Number(w.comp)) +
       ((Number(p.attempts) - Number(p.completions)) * Number(w.incmp));

      return {
        name: p.name,
        gamesPlayed: p.games, // Anzahl der Spiele zur Transparenz hinzufügen
        passYd: p.yds, // Saison-Summe
        passTd: p.tds, // Saison-Summe
        rushYd: p.rushYds, // Saison-Summe
        rushTd: p.rushTds, // Saison-Summe
        ints: p.ints, // Saison-Summe
        compPct: p.attempts > 0 ? (p.completions / p.attempts) * 100 : 0,
        // Korrektur: Nutze die intern berechneten Summen für das UI
        standard: getPoints({ 
          passTd: 4, 
          passYd: 0.04, 
          int: 2, 
          rushYd: 0.1, 
          rushTd: 6, 
          fumble: 1, 
          fumbleLost: 1, 
          comp: 0, 
          incmp: 0 
        }) / games,
        simulated: getPoints(weights) / games,
        total: getPoints(weights), // Saison-Summe
      };
    })
    .sort((a, b) => b.standard - a.standard)
    .slice(0, 32);
}