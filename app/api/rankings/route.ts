import { NextResponse } from 'next/server';

const bereinigeName = (name: string) => {
  if (!name) return "";
  return name
    .toLowerCase()
    .replace(/\s(iii|ii|jr|sr|iv|v)$/i, "")
    .replace(/[^a-z0-9]/g, "")
    .trim();
};

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    
    // URL Weiche: Standard oder RoS
    const url = type === 'ros' 
      ? "https://www.fantasypros.com/nfl/rankings/ros-half-point-ppr-cheatsheets.php"
      : "https://www.fantasypros.com/nfl/rankings/half-point-ppr-cheatsheets.php";
    
    const res = await fetch(url, {
      next: { revalidate: 3600 },
      headers: { 
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Referer": "https://www.google.com/"
      }
    });

    if (!res.ok) {
      console.error("FantasyPros HTTP Fehler:", res.status);
      return NextResponse.json({ error: `Status ${res.status}` });
    }

    const html = await res.text();
    
    // Debugging beibehalten
    const containsPlayers = html.includes('players":');
    console.log(`DEBUG: HTML geladen, Länge: ${html.length}. Enthält 'players":' -> ${containsPlayers}`);

    if (!containsPlayers) {
      console.error("KRITISCH: Struktur bei FantasyPros geändert. 'players' nicht gefunden.");
      return NextResponse.json({ error: "Datenstruktur nicht gefunden" });
    }

    let gelisteteSpieler: any[] = [];
    
    // Die originale, exakte Regex Logik
    const ecrDataRegex = /players":\s*(\[[\s\S]*?\])/i;
    const match = ecrDataRegex.exec(html);

    if (match && match[1]) {
      try {
        const players = JSON.parse(match[1].trim());
        if (Array.isArray(players)) {
        gelisteteSpieler = players.map((p: any) => ({
        rank: parseInt(p.rank_ecr || p.rank_overall || p.rank || 0, 10),
        name: p.player_name || "Unknown",           // Originaler Name (schön)
        searchName: bereinigeName(p.player_name || "") // Bereinigter Name (klein/ohne Leerzeichen)
}));
        }
      } catch (e) {
        console.error("JSON Parsing Fehler:", e);
      }
    }

    console.log(`DEBUG: Anzahl erfolgreich gemappter Spieler: ${gelisteteSpieler.length}`);
    return NextResponse.json(gelisteteSpieler);

  } catch (error) {
    console.error("API Error in Rankings:", error);
    return NextResponse.json({ error: String(error) });
  }
}