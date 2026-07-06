// utils/nflverse/qb/scoringsystem.ts
import { getQbStatsByYear } from './baseStats';

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
  const data = await getQbStatsByYear(year);
  
  const playerMap = new Map<string, any>();

  data.forEach(row => {
    const id = row.player_id;
    const stats = playerMap.get(id) || { 
      name: row.player_name, 
      tds: 0, yds: 0, ints: 0, 
      rushYds: 0, rushTds: 0, 
      fumbles: 0, fumblesLost: 0, 
      games: 0,
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
    stats.games += Number(row.games || 0);
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
  (Number(p.ints) * Number(w.int)) +      // Hier: p.ints verwenden
  (Number(p.rushYds) * Number(w.rushYd)) + 
  (Number(p.twoPtConv) * 2) +
  (Number(p.rushTds) * Number(w.rushTd)) - 
  (Number(p.fumbles) * Number(w.fumble)) - 
  (Number(p.fumblesLost) * Number(w.fumbleLost)) + // Hier: p.fumblesLost verwenden
  (Number(p.completions) * Number(w.comp)) + 
  ((Number(p.attempts) - Number(p.completions)) * Number(w.incmp));

  

      return {
        name: p.name,
        passYd: p.yds,
        passTd: p.tds,
        rushYd: p.rushYds,
        rushTd: p.rushTds,
        ints: p.ints,
        total: getPoints(weights),
        compPct: p.attempts > 0 ? (p.completions / p.attempts) * 100 : 0,
        // Standard-Scoring jetzt inklusive comp/incmp Feldern (auf 0 gesetzt)
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
      };
    })
    .sort((a, b) => b.simulated - a.simulated)
    .slice(0, 32);
}