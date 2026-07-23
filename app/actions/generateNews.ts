'use server';

import OpenAI from 'openai';

export async function generateNewsArticle(
  rawContent: string,
  token: string,
  mode: 'article' | 'interview',
  imageCount: number,
  location: string,
  newspaper: string
) {
  const isDev = process.env.NODE_ENV === 'development';
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error("GROQ_API_KEY ist in den Umgebungsvariablen nicht definiert.");
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
    const openai = new OpenAI({
      apiKey: apiKey,
      baseURL: "https://api.groq.com/openai/v1"
    });

    const systemPrompt = `
      Du bist ein Journalist für die ${newspaper}.
      Regeln:
      1. Ändere NICHT ein einziges Wort am Inhalt. Übernimm den Text exakt so wie er ist.
      2. Der Artikel ist im Blocksatz zu formatieren. Außerdem nimm eine zeitungswürdige Schriftart.
      3. Aufgabe: Formatierung als ${mode === 'article' ? 'Zeitungsartikel' : 'Interview-Transkript'}.
      4. WICHTIG: Füge GENAU ${imageCount} Bild-Platzhalter ein.
         Nutze für das 1. Bild: ![Bild](IMAGE_1), für das 2. Bild: ![Bild](IMAGE_2), usw. bis ![Bild](IMAGE_${imageCount}).
         Platziere diese Marker an den passenden Stellen im Text.
      5. KEINE HAUPTÜBERSCHRIFT: Schreibe BITTE KEINE Hauptüberschrift (kein # Zeichen) ganz oben in den Text, da die App eine eigene Headline verwendet.
      6. Datum (${new Date().toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' })}), Ort (${location}) und Zeitung (${newspaper}) ganz oben.
      7. Zwischenüberschriften: Nutze ## für Zwischenüberschriften an logischen Stellen.
      8. Modus ${mode === 'interview'}:
         - Formatiere als exklusives Interview mit **Sprecher:** (fett).
         - WICHTIG: Füge nach JEDER Sprecher-Antwort einen doppelten Zeilenumbruch ein.
    `;

    const response = await openai.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Hier ist der Quelltext: "${rawContent}"` }
      ],
    });
    
    return response.choices[0].message.content || "";

  } catch (error: any) {
    console.error('--- VOLLER FEHLER ---');
    console.error(JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    throw new Error('KI-Verarbeitungsfehler: ' + (error.message || 'Unbekannt'));
  }
}