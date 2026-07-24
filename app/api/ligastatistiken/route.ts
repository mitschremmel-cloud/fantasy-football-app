import { NextResponse } from 'next/server';
import { holeLigastatistiken } from '@/app/utils/sleeperAPI/statsService';

export async function GET() {
  const data = await holeLigastatistiken();
  return NextResponse.json(data);
}
