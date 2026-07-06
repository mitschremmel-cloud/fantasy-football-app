import { csvParse } from 'd3-dsv';

export async function getQbStatsByYear(year: number) {
const url = `https://github.com/nflverse/nflverse-data/releases/download/stats_player/stats_player_reg_${year}.csv`  
  console.log(`Versuche Daten von URL zu laden: ${url}`);

  try {
    const res = await fetch(url, { cache: 'no-store' });
    
    if (!res.ok) {
      console.warn(`Fehler ${res.status} bei ${url}.`);
      return [];
    }

    const text = await res.text();
    
    // Falls die Antwort HTML ist, abbrechen
    if (text.trim().startsWith('<')) return [];

    return processData(text);
  } catch (error) {
    console.error("Datenabruf fehlgeschlagen:", error);
    return [];
  }
}

// Hilfsfunktion zum Filtern
function processData(text: string) {
  const data = csvParse(text);
  return data.filter(row => row.position === 'QB');
}