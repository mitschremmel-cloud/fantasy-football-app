import { NextResponse } from 'next/server';
// Korrektur: Wir sind in app/api/nflverse/kicker/route.ts
// Ein Ordner hoch ist api, zwei app, drei root.
// Wir müssen zu utils/nflverse/kickerLogic.
import { calculateKickerSimulation } from '../../../utils/nflverse/kickerLogic';

export async function POST(req: Request) {
  const { year, weights } = await req.json();
  const data = await calculateKickerSimulation(year, weights);
  return NextResponse.json(data);
}

