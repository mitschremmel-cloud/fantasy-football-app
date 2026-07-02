// app/api/highlights/route.ts
import { NextResponse } from 'next/server';
import { XMLParser } from 'fast-xml-parser';
import { holeSleeperLigaKader, SpielerDaten } from '../../utils/sleeperRoute';

interface RssItem {
  title?: string;
  description?: string;
  link?: string;
}

// Deine 6 Feeds
const TWITTER_FEEDS = [
  "https://rss.app/feeds/g14efPR8F3rghwOQ.xml",
  "https://rss.app/feeds/nA644KaM6eCsWTsb.xml",
  "https://rss.app/feeds/1onpWNmPxIyEP0uh.xml",
  "https://rss.app/feeds/hVF3E7u8iEKWpjPI.xml"
];

export async function GET(): Promise<NextResponse> {
  try {
    const ergebnis = await holeSleeperLigaKader();
    if (ergebnis && 'error' in ergebnis) {
      return NextResponse.json({ error: ergebnis.error }, { status: 500 });
    }
    const ligaSpieler: SpielerDaten[] = ergebnis as SpielerDaten[];
    const parser = new XMLParser();

    const feedPromises = TWITTER_FEEDS.map(async (url) => {
      try {
        const res = await fetch(url, { next: { revalidate: 300 } });
        const contentType = res.headers.get("content-type");
        
        if (!res.ok || (!contentType?.includes("xml") && !contentType?.includes("rss"))) {
          return { rss: { channel: { item: [] } } };
        }

        const xml = await res.text();
        return parser.parse(xml);
      } catch (e) {
        return { rss: { channel: { item: [] } } };
      }
    });
    
    const feeds = await Promise.all(feedPromises);
    const alleItems: RssItem[] = feeds.flatMap(f => f?.rss?.channel?.item || []);

    const momentumKeywords: string[] = ["touchdown", "td", "score"];
    const gesehen = new Set<string>(); // Tracker für Dubletten
    
    const relevanteHighlights = alleItems
      .filter((item: any) => {
        if (!item) return false;
        
        // ID Extraktion für den Dubletten-Check
        const tweetId = item.link?.toString().split('/').pop()?.split('?')[0];
        if (!tweetId || tweetId.length < 10 || gesehen.has(tweetId)) return false;

        // Inhalts-Filter
        const text = `${item.title || ""} ${item.description || ""}`.toLowerCase();
        const isMatch = ligaSpieler.some(s => text.includes(s.name.toLowerCase())) &&
                        momentumKeywords.some(word => text.includes(word));
        
        if (isMatch) {
            gesehen.add(tweetId); // ID merken
            return true;
        }
        return false;
      })
      .map((item: any) => ({
        tweetId: item.link?.toString().split('/').pop()?.split('?')[0]
      }));

    return NextResponse.json(relevanteHighlights.slice(0, 10)); // Max 10 Highlights
  } catch (error) {
    console.error("Highlight API Fehler:", error);
    return NextResponse.json([], { status: 200 });
  }
}