import { getStatsByPosition } from './baseStats';
import { calculateWRSimulation, WRScoringWeights } from './wrScoring';

export interface WRPerformanceMetrics {
  name: string;
  season?: number;
  avgStandard: number;
  avgSimulated: number;
}

export async function getWRPerformanceMetrics(year: number | number[], weights: WRScoringWeights): Promise<WRPerformanceMetrics[]> {
  const data = await calculateWRSimulation(year, weights);
  
  return data.map(p => ({
    name: p.name,
    season: p.season,
    avgStandard: p.standardPointsPerGame,
    avgSimulated: p.pointsPerGame,
  }));
}