import { NextResponse } from 'next/server';
import { calculateKickerSimulation } from '../../../utils/nflverse/kickerLogic';

export async function POST(req: Request) {
  const { year, weights } = await req.json();

  if (Array.isArray(year)) {
     // Wenn Array, verarbeite alle Jahre und führe die Ergebnisse zusammen
     const results = await Promise.all(year.map(y => calculateKickerSimulation(y, weights)));
     // Zusammenführen der Ergebnisse (Aggregation)
     // Wir fügen das Jahr zum Ergebnis hinzu, damit wir es später identifizieren können
     const aggregated = results.map((yearResult, index) =>
         yearResult.map((p: any) => ({ ...p, season: year[index] }))
     ).flat();
     return NextResponse.json(aggregated);
  }

  const data = await calculateKickerSimulation(year, weights);
  return NextResponse.json(data);
}

