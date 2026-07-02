// app/api/live-score/route.ts
import { NextResponse } from 'next/server';

// Die League ID ist die gleiche wie in deiner sleeperRoute.ts
const LEAGUE_ID = "1251196293691211776";
const WEEK = "1"; // Hier kannst du die Woche dynamisch anpassen, falls nötig

export async function GET() {
  try {
    const url = `https://api.sleeper.app/v1/league/${LEAGUE_ID}/matchups/${WEEK}`;
    
    const res = await fetch(url, {
      // Das sorgt dafür, dass Next.js das Ergebnis 60 Sekunden lang 
      // im Data Cache hält. Die Sleeper API wird innerhalb dieser
      // Zeitspanne nicht erneut angefragt.
      next: { revalidate: 60 }
    });

    if (!res.ok) {
      console.error("Sleeper API antwortete nicht mit OK");
      return NextResponse.json({ error: "Sleeper API nicht erreichbar" }, { status: res.status });
    }

    const data = await res.json();

    // Rückgabe der Daten an dein Frontend
    return NextResponse.json(data);
    
  } catch (error) {
    console.error("Fehler beim Abrufen der Live-Daten:", error);
    return NextResponse.json(
      { error: "Interner Serverfehler beim Abrufen der Live-Daten" }, 
      { status: 500 }
    );
  }
}