import { NextResponse } from 'next/server';
import { holeLigaHistorie } from '@/app/utils/sleeperAPI/historyService';

export async function GET() {
  const data = await holeLigaHistorie();
  return NextResponse.json(data);
}