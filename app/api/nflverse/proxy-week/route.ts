import { NextResponse } from 'next/server';
import { csvParse } from 'd3-dsv';

export async function getWeeklyPlayerStatsByYear(year: number) {
  const url = `/api/nflverse/proxy-week?year=${year}`;
  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    const text = await res.text();
    // Wenn der Proxy bei 404 einen leeren String geschickt hat:
    if (!text || text.trim() === '') return [];
    return csvParse(text);
  } catch (error) {
    return [];
  }
}
    
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const year = searchParams.get('year');
  // Korrigierter Pfad basierend auf deiner Angabe:
  const url = `https://github.com/nflverse/nflverse-data/releases/download/stats_player/stats_player_week_${year}.csv`;
  
  console.log(`[DEBUG] Proxy lädt: ${url}`);

  try {
    const response = await fetch(url, { redirect: 'follow' });
    
    // Wenn 404, senden wir ein leeres CSV statt eines API-Errors
    if (response.status === 404) {
      return new NextResponse('', { status: 200 }); 
    }
    
    if (!response.ok) return new NextResponse('Error', { status: 500 });
    
    return new NextResponse(response.body, {
      headers: { 'Content-Type': 'text/csv' }
    });
  } catch (e) {
    return new NextResponse('Fetch Error', { status: 500 });
  }
}

