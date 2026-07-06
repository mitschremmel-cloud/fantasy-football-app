import { NextResponse } from 'next/server';
// Raus aus quarterback, nflverse, api, app, dann rein in utils
import { calculateSimulation } from '../../../utils/nflverse/qb/scoringsystem';

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