import { NextResponse } from 'next/server';
import { calculateRBSimulation } from '../../../utils/nflverse/rbScoring';

export async function POST(req: Request) {
  try {
    const { year, weights } = await req.json(); 
    const data = await calculateRBSimulation(year, weights);
    return NextResponse.json(data);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: 'Fehler bei der Berechnung' }, { status: 500 });
  }
}
