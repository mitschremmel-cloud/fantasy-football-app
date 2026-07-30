import { NextResponse } from 'next/server';
import { calculateWRSimulation } from '../../../utils/nflverse/wrScoring';

export async function POST(req: Request) {
  try {
    const { year, weights } = await req.json(); 
    const data = await calculateWRSimulation(year, weights);
    return NextResponse.json(data);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: 'Fehler bei der Berechnung' }, { status: 500 });
  }
}
