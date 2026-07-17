'use server';

import { GoogleGenerativeAI } from "@google/generative-ai";

export async function generateNewsArticle(rawContent: string, token: string, mode: 'article' | 'interview', imageCount: number) {
  const isDev = process.env.NODE_ENV === 'development';
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY ist in den Umgebungsvariablen nicht definiert.");
  }

  // --- Turnstile Validierung ---
  if (token !== "dev-bypass" || !isDev) {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: `secret=${encodeURIComponent(process.env.TURNSTILE_SECRET_KEY!)}&response=${encodeURIComponent(token)}`,
      headers: { 'content-type': 'application/x-www-form-urlencoded' }
    });
    const data = await res.json();

    if (!data.success) {
      throw new Error('Bot-Verifizierung fehlgeschlagen.');
    }
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Wir nehmen die ID exakt so, wie sie auf deinem Playground-Screenshot steht.
    // Das bricht den 404-Kreislauf der veralteten 2.5-Bezeichnungen auf.
    const model = genAI.getGenerativeModel({
      model: "gemini-3-flash-preview"
    });

    const prompt = `
      Du bist ein Sportjournalist für die Regionaliga Südkiff.
      Hier ist der Quelltext: "${rawContent}"

      Regeln:
      1. Ändere NICHT ein einziges Wort am Inhalt. Übernimm den Text exakt so wie er ist.
      2. Aufgabe: Formatierung als ${mode === 'article' ? 'Zeitungsartikel' : 'Interview-Transkript'}.
      3. Füge GENAU ${imageCount} Bild-Platzhalter ein: ![Bild](URL_HIER_EINSETZEN).
      4. KEINE HAUPTÜBERSCHRIFT: Schreibe BITTE KEINE Hauptüberschrift (kein # Zeichen) ganz oben in den Text, da die App eine eigene Headline verwendet.
      5. Zwischenüberschriften: Du darfst und sollst gerne ## für Zwischenüberschriften im Text verwenden, solange es nicht die erste Zeile des Textes betrifft.
      6. Modus ${mode === 'interview'}:
         - Formatiere als exklusives Interview mit **Sprecher:** (fett).
         - WICHTIG: Füge nach JEDER Sprecher-Antwort einen doppelten Zeilenumbruch ein.
    `;
    const result = await model.generateContent(prompt);
    
    return result.response.text();

  } catch (error: any) {
    console.error('--- VOLLER FEHLER ---');
    console.error(JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    throw new Error('KI-Verarbeitungsfehler: ' + (error.message || 'Unbekannt'));
  }
}