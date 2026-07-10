import { getStatsByPosition } from './baseStats';

export interface KickerScoringWeights {
  fg0_19: number; miss0_19: number;
  fg20_29: number; miss20_29: number;
  fg30_39: number; miss30_39: number;
  fg40_49: number; miss40_49: number;
  fg50_59: number; miss50_59: number;
  fg60plus: number; miss60plus: number;
  fg_inc: number;
  pat: number; patMiss: number;
}

export async function calculateKickerSimulation(year: number, weights: KickerScoringWeights) {
  const data = await getStatsByPosition(year, 'K');
  const playerMap = new Map<string, any>();

  data.forEach(row => {
    const week = Number(row.week || 0);
    if (week > 18) return; // Begrenzung auf die ersten 18 Wochen

    const id = row.player_id;
    if (!playerMap.has(id)) {
      playerMap.set(id, { 
        name: row.player_name,
        weeklySimPts: [] as number[],
        weeklyStdPts: [] as number[],
        madeList: [] as number[],
        missedList: [] as number[],
        patMade: 0,
        patMissed: 0,
        games: 0
      });
    }
    const p = playerMap.get(id);

    const weekMade = (row.fg_made_list as string || '').split(';').filter(Boolean).map(Number);
    const weekMissed = (row.fg_missed_list as string || '').split(';').filter(Boolean).map(Number);
    const patMade = Number(row.pat_made || row.xp_made || 0);
    const patMissed = Number(row.pat_missed || row.xp_missed || 0);

    // Nur Wochen zählen, in denen der Kicker tatsächlich aktiv war
    if (weekMade.length > 0 || weekMissed.length > 0 || patMade > 0 || patMissed > 0) {
    const calcPts = (w: KickerScoringWeights, made: number[], missed: number[], pat: number, pMiss: number) => {
      let pts = (pat * w.pat) + (pMiss * w.patMiss);
      made.forEach(d => {
        if (d < 20) pts += w.fg0_19; else if (d < 30) pts += w.fg20_29; else if (d < 40) pts += w.fg30_39; else if (d < 50) pts += w.fg40_49; else if (d < 60) pts += w.fg50_59; else pts += w.fg60plus;
        pts += d * w.fg_inc;
      });
      missed.forEach(d => {
        if (d < 20) pts += w.miss0_19; else if (d < 30) pts += w.miss20_29; else if (d < 40) pts += w.miss30_39; else if (d < 50) pts += w.miss40_49; else if (d < 60) pts += w.miss50_59; else pts += w.miss60plus;
      });
      return pts;
    };

    const stdWeights: KickerScoringWeights = {
      fg0_19: 3, miss0_19: 0,
      fg20_29: 3, miss20_29: 0,
      fg30_39: 3, miss30_39: 0,
      fg40_49: 4, miss40_49: 0,
      fg50_59: 5, miss50_59: 0,
      fg60plus: 6, miss60plus: 0,
      fg_inc: 0,
      pat: 1, patMiss: 0
    };

    p.weeklySimPts.push(calcPts(weights, weekMade, weekMissed, patMade, patMissed));
    p.weeklyStdPts.push(calcPts(stdWeights, weekMade, weekMissed, patMade, patMissed));
    p.games += 1;
    }

    p.madeList.push(...weekMade);
    p.missedList.push(...weekMissed);
    p.patMade += patMade;
    p.patMissed += patMissed;
  });

  return Array.from(playerMap.values()).map(p => {
    const games = p.games || 1;
    const avgSim = p.weeklySimPts.reduce((a:number, b:number) => a + b, 0) / games;
    const avgStd = p.weeklyStdPts.reduce((a:number, b:number) => a + b, 0) / games;

    const varSim = p.weeklySimPts.reduce((sum: number, x: number) => sum + Math.pow((x || 0) - avgSim, 2), 0) / games;
    const varStd = p.weeklyStdPts.reduce((sum: number, x: number) => sum + Math.pow((x || 0) - avgStd, 2), 0) / games;

    const stdSim = Math.sqrt(varSim);
    const stdStd = Math.sqrt(varStd);

    // CV berechnen, bei avg < 0.1 setzen wir es auf 0
    const cvSim = avgSim > 0.1 ? stdSim / avgSim : 0;
    const cvStd = avgStd > 0.1 ? stdStd / avgStd : 0;

    return {
      name: p.name,
      totalPoints: p.weeklySimPts.reduce((a:number, b:number) => a + b, 0),
      standardTotalPoints: p.weeklyStdPts.reduce((a:number, b:number) => a + b, 0),
      pointsPerGame: avgSim,
      standardPointsPerGame: avgStd,
      // Begrenzung des CV auf maximal 2.0, um Ausreißer durch mathematische Artefakte zu vermeiden
      cvSimulated: Math.min(cvSim, 2.0),
      cvStandard: Math.min(cvStd, 2.0),
      fgMade: p.madeList.length,
      fgMissed: p.missedList.length,
      patMade: p.patMade,
      patMissed: p.patMissed
    };
  })
  .sort((a, b) => b.standardPointsPerGame - a.standardPointsPerGame)
  .slice(0, 32);
}

