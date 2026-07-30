import { getStatsByPosition } from './baseStats';
import { calculateTESimulation, TEScoringWeights } from './teScoring';

export interface TEPerformanceMetrics {
  name: string;
  season?: number;
  avgStandard: number;
  avgSimulated: number;
}

export async function getTEPerformanceMetrics(year: number | number[], weights: TEScoringWeights): Promise<TEPerformanceMetrics[]> {
  const data = await calculateTESimulation(year, weights);
  
  return data.map(p => ({
    name: p.name,
    season: p.season,
    avgStandard: p.standardPointsPerGame,
    avgSimulated: p.pointsPerGame,
  }));
}