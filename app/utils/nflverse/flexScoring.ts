import { getStatsByPosition } from './baseStats';

export interface FlexScoringWeights {
  rushing_yards: number; rushing_tds: number; rushing_fumbles: number;
  rushing_fumbles_lost: number; rushing_2pt_conversions: number;
  receiving_yards: number; receiving_tds: number; receptions: number;
}

export async function calculateFlexSimulation(year: number | number[], weights: FlexScoringWeights) {
  const years = Array.isArray(year) ? year : [year];
  const allResults: any[] = [];

  for (const y of years) {
    const rbData = await getStatsByPosition(y, 'RB');
    const wrData = await getStatsByPosition(y, 'WR');
    const teData = await getStatsByPosition(y, 'TE');

    const processData = (data: any[], position: string) => {
      const filteredData = data.filter(row => {
        const pos = (row.position as string || '').trim().toUpperCase();
        return pos === position.toUpperCase();
      });
      const weeklyData = filteredData.filter(row => Number(row.week) >= 1 && Number(row.week) <= 17);
      const playerMap = new Map<string, any>();
      weeklyData.forEach(row => {
        const id = `${row.player_id}`;
        if (!playerMap.has(id)) {
          playerMap.set(id, {
            name: row.player_name,
            position,
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

        const calc = (w: FlexScoringWeights) => Object.keys(s).reduce((sum, k) => sum + s[k as keyof typeof s] * w[k as keyof typeof w], 0);
        p.weeklySimPts.push(calc(weights));
        p.weeklyStdPts.push(calc({ rushing_yards: 0.1, rushing_tds: 6, rushing_fumbles: -1, rushing_fumbles_lost: -1, rushing_2pt_conversions: 2, receiving_yards: 0.1, receiving_tds: 6, receptions: 0.5 }));
      });

      return Array.from(playerMap.values()).filter(p => p.weeklySimPts.length >= 8).map(p => ({
        ...p,
        totalPoints: p.weeklySimPts.reduce((a: number, b: number) => a + b, 0),
        pointsPerGame: p.weeklySimPts.reduce((a: number, b: number) => a + b, 0) / p.weeklySimPts.length,
        standardTotalPoints: p.weeklyStdPts.reduce((a: number, b: number) => a + b, 0),
        standardPointsPerGame: p.weeklyStdPts.reduce((a: number, b: number) => a + b, 0) / p.weeklyStdPts.length,
      })).sort((a, b) => b.standardTotalPoints - a.standardTotalPoints);
    };

    const rbs = processData(rbData, 'RB');
    const wrs = processData(wrData, 'WR');
    const tes = processData(teData, 'TE');

    console.log(`Fetched ${rbs.length} RBs, ${wrs.length} WRs, ${tes.length} TEs for year ${y}`);

    // Filtere die Top X weg
    const eligibleRbs = rbs.slice(20);
    const eligibleWrs = wrs.slice(20);
    const eligibleTes = tes.slice(10);

    // Kombiniere alle und sortiere nach der simulierten Leistung
    const allEligible = [...eligibleRbs, ...eligibleWrs, ...eligibleTes]
      .sort((a, b) => b.totalPoints - a.totalPoints);

    // Nimm die Top 60 aus dem kombinierten Pool
    const top60Flex = allEligible.slice(0, 60);

    console.log(`Flex pool size: ${allEligible.length}, returning ${top60Flex.length} players`);

    // Bereinige die Daten, um Zirkelverweise in JSON zu vermeiden (JSON.stringify-Problem)
    const sanitizedResults = top60Flex.map(p => ({
      name: p.name,
      position: p.position,
      season: p.season,
      totalPoints: p.totalPoints,
      pointsPerGame: p.pointsPerGame,
      standardTotalPoints: p.standardTotalPoints,
      standardPointsPerGame: p.standardPointsPerGame
    }));

    allResults.push(...sanitizedResults);
  }

  return allResults;
}

