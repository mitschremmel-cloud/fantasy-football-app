import { getStatsByPosition } from './baseStats';
import { calculateRBSimulation, RBScoringWeights } from './rbScoring';

export interface RBPerformanceMetrics {
  name: string;
  season?: number;
  avgStandard: number;
  avgSimulated: number;
}

export async function getRBPerformanceMetrics(year: number | number[], weights: RBScoringWeights): Promise<RBPerformanceMetrics[]> {
  const data = await calculateRBSimulation(year, weights);
  
  return data.map(p => ({
    name: p.name,
    season: p.season,
    avgStandard: p.standardPointsPerGame,
    avgSimulated: p.pointsPerGame,
  }));
}