import { NextResponse } from 'next/server';
import { calculateTESimulation } from '../../../utils/nflverse/teScoring';

export async function POST(req: Request) {
  try {
    const { year, weights } = await req.json(); 
    const data = await calculateTESimulation(year, weights);
    return NextResponse.json(data);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: 'Fehler bei der Berechnung' }, { status: 500 });
  }
}
