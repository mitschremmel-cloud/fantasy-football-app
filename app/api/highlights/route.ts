import { NextResponse } from 'next/server';
import { XMLParser } from 'fast-xml-parser';

const TWITTER_FEEDS = [
  "https://rss.app/feeds/g14efPR8F3rghwOQ.xml",
  "https://rss.app/feeds/nA644KaM6eCsWTsb.xml",
  "https://rss.app/feeds/1onpWNmPxIyEP0uh.xml",
  "https://rss.app/feeds/hVF3E7u8iEKWpjPI.xml"
];

const normalize = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, "").trim();

export async function GET(): Promise<NextResponse> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const resSleeper = await fetch(`${baseUrl}/api/sleeper`);
    const alleSpieler = await resSleeper.json();

    const aktiveKaderSpieler = Array.isArray(alleSpieler) 
      ? alleSpieler.filter(s => s.manager && !s.manager.includes("Free Agent") && s.manager !== "Unbekannter Manager")
      : [];

    if (aktiveKaderSpieler.length === 0) return NextResponse.json([], { status: 200 });

    const parser = new XMLParser();
    const results = await Promise.all(TWITTER_FEEDS.map(async (url) => {
      try {
        const res = await fetch(url, { next: { revalidate: 300 } });
        if (!res.ok) return [];
        const xml = await res.text();
        const jsonObj = parser.parse(xml);
        const items = jsonObj?.rss?.channel?.item;
        return Array.isArray(items) ? items : (items ? [items] : []);
      } catch { return []; }
    }));
    
    const alleItems = results.flat();
    const gesehen = new Set<string>();
    const managerMapping = new Map<string, string>();

    const relevanteHighlights = alleItems.filter((item) => {
      if (!item?.link) return false;
      const tweetId = item.link.toString().split('/').pop()?.split('?')[0];
      if (!tweetId || gesehen.has(tweetId)) return false;

      const tweetContent = `${item.title || ""} ${item.description || ""}`;
      const rawTextNorm = normalize(tweetContent);
      
      const spielerMatch = aktiveKaderSpieler.find((s: any) => {
        // 1. Suche nach vollen Namen/Nachnamen (Normalisiert)
        const normName = normalize(s.name);
        const nachname = s.name.split(/[\s-]+/).pop()?.toLowerCase() || "";
        
        if ((normName.length > 3 && rawTextNorm.includes(normName)) || 
            (nachname.length > 3 && rawTextNorm.includes(nachname))) {
          return true;
        }

        // 2. Suche nach Initialen (NUR Großbuchstaben, Wortgrenzen beachten)
        const teile = s.name.split(/[\s-]+/);
        if (teile.length >= 2) {
          const initials = teile.map((t: string) => t[0].toUpperCase()).join('');
          if (initials.length >= 2) {
            // Regex: \b bedeutet Wortanfang/Ende. 
            // Hier erzwingen wir die Großschreibung der Initialen.
            const regex = new RegExp(`\\b${initials}\\b`);
            if (regex.test(tweetContent)) return true;
          }
        }
        return false;
      });

      if (spielerMatch) {
        gesehen.add(tweetId);
        managerMapping.set(tweetId, spielerMatch.manager);
        return true;
      }
      return false;
    }).map((item) => {
      const tweetId = item.link.toString().split('/').pop()?.split('?')[0] || "";
      return { tweetId, manager: managerMapping.get(tweetId) };
    });

    return NextResponse.json(relevanteHighlights.slice(0, 10));
  } catch (error) {
    console.error("Highlight API Fehler:", error);
    return NextResponse.json([], { status: 500 });
  }
}