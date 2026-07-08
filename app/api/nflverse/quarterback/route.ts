import { NextResponse } from 'next/server';
// Jetzt im gleichen Verzeichnis wie kickerLogic: utils/nflverse/qbScoring.ts
import { calculateSimulation } from '../../../utils/nflverse/qbScoring';

export async function POST(req: Request) {
  try {
    const { year, weights } = await req.json(); 
    const data = await calculateSimulation(year, weights);
    return NextResponse.json(data);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: 'Fehler bei der Berechnung' }, { status: 500 });
  }
}