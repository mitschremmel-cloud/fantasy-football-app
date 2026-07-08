import { getWeeklyPlayerStatsByYear } from './gamePerGameStats';
import { KickerScoringWeights } from './kickerLogic';

export interface KickerGameStats {
  week: number;
  standardPoints: number;
  simulatedPoints: number;
}

export interface KickerPerformanceMetrics {
  name: string;
  avgStandard: number;
  avgSimulated: number;
  stdDevStandard: number;
  stdDevSimulated: number;
  cvStandard: number; // Varianzkoeffizient
  cvSimulated: number;
  correlation: number;
}

const standardWeights = {
  fg0_19: 3, miss0_19: 0,
  fg20_29: 3, miss20_29: 0,
  fg30_39: 3, miss30_39: 0,
  fg40_49: 4, miss40_49: 0,
  fg50_59: 5, miss50_59: 0,
  fg60plus: 6, miss60plus: 0,
  fg_inc: 0, pat: 1, patMiss: 0
};

export async function getKickerPerformanceAnalysis(year: number, weights: KickerScoringWeights) {
  const data = await getWeeklyPlayerStatsByYear(year);
  const kickerData = data.filter(row => row.position === 'K');

  const playerStats: Record<string, KickerGameStats[]> = {};

  kickerData.forEach(p => {
    const name = p.player_name as string;
    if (!playerStats[name]) playerStats[name] = [];

    const calculatePoints = (w: KickerScoringWeights) => {
      let pts = Number(p.pat_made || 0) * w.pat + Number(p.pat_missed || 0) * w.patMiss;
      pts += Number(p.fg_made_0_19 || 0) * w.fg0_19 + Number(p.fg_missed_0_19 || 0) * w.miss0_19;
      pts += Number(p.fg_made_20_29 || 0) * w.fg20_29 + Number(p.fg_missed_20_29 || 0) * w.miss20_29;
      pts += Number(p.fg_made_30_39 || 0) * w.fg30_39 + Number(p.fg_missed_30_39 || 0) * w.miss30_39;
      pts += Number(p.fg_made_40_49 || 0) * w.fg40_49 + Number(p.fg_missed_40_49 || 0) * w.miss40_49;
      pts += Number(p.fg_made_50_59 || 0) * w.fg50_59 + Number(p.fg_missed_50_59 || 0) * w.miss50_59;
      pts += Number(p.fg_made_60 || 0) * w.fg60plus + Number(p.fg_missed_60 || 0) * w.miss60plus;
      return pts;
    };

    playerStats[name].push({
      week: Number(p.week),
      standardPoints: calculatePoints(standardWeights),
      simulatedPoints: calculatePoints(weights)
    });
  });

  return Object.keys(playerStats).map(name => {
    const stats = playerStats[name];
    const stdArr = stats.map(s => s.standardPoints);
    const simArr = stats.map(s => s.simulatedPoints);

    const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;
    const stdDev = (arr: number[], mean: number) => Math.sqrt(arr.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / arr.length);

    const avgStandard = avg(stdArr);
    const avgSimulated = avg(simArr);
    const sdStandard = stdDev(stdArr, avgStandard);
    const sdSimulated = stdDev(simArr, avgSimulated);

    // Pearson Korrelation
    const correlation = calculatePearson(stdArr, simArr);

    // Nur Spieler mit mindestens 3 gespielten Wochen berücksichtigen
    // Das verhindert, dass Kicker mit nur einem Spiel (z.B. Verletzung) die Statistik verzerren.
    if (stats.length < 3) return null;

    return {
      name,
      avgStandard: Number(avgStandard.toFixed(1)),
      avgSimulated: Number(avgSimulated.toFixed(1)),
      stdDevStandard: sdStandard,
      stdDevSimulated: sdSimulated,
      cvStandard: avgStandard !== 0 ? Number((sdStandard / avgStandard).toFixed(3)) : 0,
      cvSimulated: avgSimulated !== 0 ? Number((sdSimulated / avgSimulated).toFixed(3)) : 0,
      correlation
    };
  }).filter((item): item is KickerPerformanceMetrics => item !== null);
}

function calculatePearson(x: number[], y: number[]) {
  const n = x.length;
  if (n !== y.length) return 0;
  const avgX = x.reduce((a, b) => a + b, 0) / n;
  const avgY = y.reduce((a, b) => a + b, 0) / n;
  
  let num = 0, denX = 0, denY = 0;
  for (let i = 0; i < n; i++) {
    const dx = x[i] - avgX;
    const dy = y[i] - avgY;
    num += dx * dy;
    denX += dx * dx;
    denY += dy * dy;
  }
  return num / Math.sqrt(denX * denY);
}

