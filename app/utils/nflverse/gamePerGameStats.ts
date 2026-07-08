import { NextResponse } from 'next/server';
import { csvParse } from 'd3-dsv';

/**
 * Holt wöchentliche Spielerdaten für ein gegebenes Jahr.
 * Ziel: Analyse der wöchentlichen Performance (Varianz, Korrelation).
 * URL-Struktur: .../releases/download/player_stats/player_stats_week_{year}.csv
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const year = searchParams.get('year');
  const url = `https://github.com/nflverse/nflverse-data/releases/download/player_stats/player_stats_week_${year}.csv`;

  try {
    const response = await fetch(url, { redirect: 'follow' });
    if (!response.ok) return new NextResponse('Error', { status: 500 });
    return new NextResponse(response.body, {
      headers: { 'Content-Type': 'text/csv' }
    });
  } catch (e) {
    return new NextResponse('Fetch Error', { status: 500 });
  }
}

export async function getWeeklyPlayerStatsByYear(year: number) {
  // Wir laden jetzt über unseren Proxy, den wir gleich erstellen
  const url = `/api/nflverse/proxy-week?year=${year}`;
  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    const text = await res.text();
    return csvParse(text);
  } catch (error) {
    console.error("Fehler beim Laden über Proxy:", error);
    return [];
  }
}

// Die untenstehenden Code-Kommentare und Funktionen gehören hier nicht hin,
// da dies eine Utility-Datei ist und kein React Component.
// Ich entferne sie, um den Type-Error zu beheben.

