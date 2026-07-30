import { getStatsByPosition } from './baseStats';

export interface WRScoringWeights {
  rushing_yards: number; rushing_tds: number; rushing_fumbles: number;
  rushing_fumbles_lost: number; rushing_2pt_conversions: number;
  receiving_yards: number; receiving_tds: number; receptions: number;
}
export async function calculateWRSimulation(year: number | number[], weights: WRScoringWeights) {
  const years = Array.isArray(year) ? year : [year];
  const allResults: any[] = [];

  for (const y of years) {
    const data = await getStatsByPosition(y, 'WR');
    // Filtere nur Wochen 1-17
    const weeklyData = data.filter(row => Number(row.week) >= 1 && Number(row.week) <= 17);
  const playerMap = new Map<string, any>();
    weeklyData.forEach(row => {
      const id = `${row.player_id}`;
    if (!playerMap.has(id)) {
      playerMap.set(id, {
          name: row.player_name,
          season: y,
        weeklySimPts: [], weeklyStdPts: [],
        stats: { rushing_yards: 0, rushing_tds: 0, rushing_fumbles: 0, rushing_fumbles_lost: 0, rushing_2pt_conversions: 0, receiving_yards: 0, receiving_tds: 0, receptions: 0 }
      });
    }
    const p = playerMap.get(id);
    const s = {
      rushing_yards: Number(row.rushing_yards || 0),
      rushing_tds: Number(row.rushing_tds || 0),
      rushing_fumbles: Number(row.rushing_fumbles || 0),
      rushing_fumbles_lost: Number(row.rushing_fumbles_lost || 0),
      rushing_2pt_conversions: Number(row.rushing_2pt_conv || 0),
      receiving_yards: Number(row.receiving_yards || 0),
      receiving_tds: Number(row.receiving_tds || 0),
      receptions: Number(row.receptions || 0),
    };

      Object.keys(s).forEach(key => p.stats[key as keyof typeof s] += s[key as keyof typeof s]);

    const calc = (w: WRScoringWeights) => Object.keys(s).reduce((sum, k) => sum + s[k as keyof typeof s] * w[k as keyof typeof w], 0);
    p.weeklySimPts.push(calc(weights));
    p.weeklyStdPts.push(calc({ rushing_yards: 0.1, rushing_tds: 6, rushing_fumbles: -1, rushing_fumbles_lost: -1, rushing_2pt_conversions: 2, receiving_yards: 0.1, receiving_tds: 6, receptions: 0.5 }));
  });

  const getCV = (pts: number[]) => {
    const avg = pts.reduce((a, b) => a + b, 0) / pts.length;
    const stdDev = Math.sqrt(pts.reduce((sum, x) => sum + Math.pow(x - avg, 2), 0) / pts.length);
    return avg > 0 ? stdDev / avg : 0;
  };

    const seasonResults = Array.from(playerMap.values())
      .filter(p => p.weeklySimPts.length >= 8)
  .map(p => ({
    name: p.name,
    season: p.season,
      totalPoints: p.weeklySimPts.reduce((a: number, b: number) => a + b, 0),
      pointsPerGame: p.weeklySimPts.reduce((a: number, b: number) => a + b, 0) / p.weeklySimPts.length,
      standardTotalPoints: p.weeklyStdPts.reduce((a: number, b: number) => a + b, 0),
      standardPointsPerGame: p.weeklyStdPts.reduce((a: number, b: number) => a + b, 0) / p.weeklyStdPts.length,
      cvSimulated: getCV(p.weeklySimPts),
      cvStandard: getCV(p.weeklyStdPts),
      ...p.stats
  }))
  .sort((a, b) => b.standardTotalPoints - a.standardTotalPoints)
      .slice(0, 40);

    allResults.push(...seasonResults);
}

  return allResults;
}

