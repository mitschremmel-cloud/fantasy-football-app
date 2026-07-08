import { csvParse } from 'd3-dsv';

// app/utils/nflverse/baseStats.ts

// Nutze die Next.js-eigene fetch-Option, die den Daten-Cache nutzt
export async function getStatsByPosition(year: number, position: string) {
  // Diese Zeile wird ab jetzt nie wieder angefasst.
  const url = `https://github.com/nflverse/nflverse-data/releases/download/stats_player/stats_player_week_${year}.csv`;


  try {



    // next: { revalidate: 3600 } speichert das Ergebnis für 1 Stunde im Next.js Cache
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return [];

    const text = await res.text();
    if (text.trim().startsWith('<')) return [];

    const data = csvParse(text);


    return data.filter(row => {
      const pos = (row.position as string || '').trim().toUpperCase();
      return pos === position.toUpperCase();
    });

  } catch (error) {
    console.error("Datenabruf fehlgeschlagen:", error);
    return [];
  }
}

export async function getQbStatsByYear(year: number) {
  return getStatsByPosition(year, 'QB');
}

