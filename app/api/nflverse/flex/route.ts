import { NextResponse } from 'next/server';
import { calculateFlexSimulation } from '../../../utils/nflverse/flexScoring';

export async function POST(request: Request) {
  try {
    const { year, weights } = await request.json();
    const data = await calculateFlexSimulation(year, weights);
    return NextResponse.json(data);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: 'Fehler bei der Berechnung' }, { status: 500 });
  }
}

