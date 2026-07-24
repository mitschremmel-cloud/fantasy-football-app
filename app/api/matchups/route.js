import { NextResponse } from 'next/server';
import { holeSleeperMatchups } from '@/app/utils/sleeperAPI/sleeperService';

export async function GET() {
  const data = await holeSleeperMatchups();
  
  if (data && 'error' in data) {
    return NextResponse.json({ error: data.error }, { status: 500 });
  }
  
  return NextResponse.json(data);
}