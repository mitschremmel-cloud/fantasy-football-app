import { NextResponse } from 'next/server';
import { holeSleeperLigaKader } from '../../utils/sleeperRoute';

export async function GET() {
  const data = await holeSleeperLigaKader();
  // Wenn Fehler, gib leeres Array zurück, damit die UI nicht crashed
  if (data && 'error' in data) {
    return NextResponse.json([]);
  }
  return NextResponse.json(data);
}