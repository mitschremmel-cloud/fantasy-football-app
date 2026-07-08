import { NextResponse } from 'next/server';
import { XMLParser } from 'fast-xml-parser';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { kv } from '@vercel/kv';

const TWITTER_FEEDS = [
  "https://rss.app/feeds/g14efPR8F3rghwOQ.xml",
  "https://rss.app/feeds/nA644KaM6eCsWTsb.xml",
  "https://rss.app/feeds/1onpWNmPxIyEP0uh.xml",
  "https://rss.app/feeds/hVF3E7u8iEKWpjPI.xml"
];

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function GET(): Promise<NextResponse> {
  // --- DEAKTIVIERT ---
  return NextResponse.json({ message: "Highlights-Workflow ist vorübergehend deaktiviert.", highlights: [] });
  // -------------------

  const TEST_MODE = false; 
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  
  // Sicherer Zugriff auf Umgebungsvariablen
  const RECIPIENT = process.env.WHATSAPP_RECIPIENT;
  const API_KEY = process.env.TEXTMEBOT_API_KEY;

  if (TEST_MODE) {
    const testData = [{ 
      tweetId: "1756843418527920262", 
      manager: "System-Test", 
      whatsappText: "TEST-LIVE: Pipeline läuft! Hier ist das Highlight:"
    }];
    const whatsappMsg = `${testData[0].whatsappText} ${BASE_URL}/highlights`;
    
    // Test-Aufruf via TextMeBot
    const testUrl = `https://api.textmebot.com/send.php?recipient=${RECIPIENT}&apikey=${API_KEY}&text=${encodeURIComponent(whatsappMsg)}`;
    await fetch(testUrl).catch(console.error);
    
    return NextResponse.json(testData);
  }

  try {
    const resSleeper = await fetch(`${BASE_URL}/api/sleeper`, { cache: 'no-store' });
    const alleSpieler = await resSleeper.json();
    const aktiveKader = alleSpieler.filter((s: any) => s.manager && !s.manager.includes("Free Agent"));

    const parser = new XMLParser();
    const results = await Promise.all(TWITTER_FEEDS.map(async (url) => {
      try {
        const res = await fetch(url, { next: { revalidate: 60 } });
        if (!res.ok) return [];
        const xml = await res.text();
        const jsonObj = parser.parse(xml);
        const items = jsonObj?.rss?.channel?.item;
        return Array.isArray(items) ? items : (items ? [items] : []);
      } catch { return []; }
    }));
    
    const alleItems = results.flat().map(i => ({ 
      tweetId: i.link?.toString().split('/').pop()?.split('?')[0] || "", 
      content: `${i.title || ""} ${i.description || ""}` 
    })).filter(i => i.tweetId && i.tweetId.length > 5);

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash", generationConfig: { responseMimeType: "application/json" } });
    
    const prompt = `
 Analysiere diese Tweets auf Fantasy-Highlights für den Kader: ${JSON.stringify(aktiveKader.map((s: { name: string; manager: string }) => ({ name: s.name, manager: s.manager })))}. 
Tweets zur Analyse: ${JSON.stringify(alleItems.slice(0, 20))}zur Analyse: ${JSON.stringify(alleItems.slice(0, 20))}

      Aufgabe:
      1. Identifiziere echte Big Plays (TDs, 60+ Yard Plays, etc.) für Spieler im Kader.
      2. Berechne kurz die Auswirkungen auf die Matchup-Dynamik (Führung/Siegchance).
      3. Schreibe einen kurzen, unterhaltsamen und leicht trash-talkigen Kommentar für eine WhatsApp-Nachricht (maximal 2 Sätze).

      Gib NUR ein JSON-Array zurück: [{"tweetId": "...", "manager": "...", "whatsappText": "..."}]. 
      Wenn kein Highlight gefunden wurde, antworte mit [].
    `;

    const result = await model.generateContent(prompt);
    const highlights = JSON.parse(result.response.text().replace(/```json/g, "").replace(/```/g, "").trim() || "[]");
    
    const newHighlights = [];
    for (const h of highlights) {
      if (!h.tweetId) continue;
      const exists = await kv.exists(`sent:${h.tweetId}`);
      if (!exists) {
        newHighlights.push(h);
        await kv.set(`sent:${h.tweetId}`, "true", { ex: 604800 });
        
        const whatsappMsg = `${h.whatsappText} Mehr Infos: ${BASE_URL}/highlights`;
        const url = `https://api.textmebot.com/send.php?recipient=${RECIPIENT}&apikey=${API_KEY}&text=${encodeURIComponent(whatsappMsg)}`;
        
        await fetch(url).catch(console.error);
      }
    }

    return NextResponse.json(newHighlights);
  } catch (error: any) {
    console.error("[KI-FEHLER]:", error.message);
    return NextResponse.json([], { status: 200 }); 
  }
}