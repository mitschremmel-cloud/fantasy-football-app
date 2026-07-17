import Link from 'next/link';
import { kv } from '@vercel/kv';

// Wir definieren einen Typ für die Artikel
type Article = {
  id: string;
  title: string;
  content: string;
  imageUrl: string;
  imageUrls?: string[];
  createdAt: number;
};

export default async function NeuigkeitenFeed() {
  // Artikel aus der Vercel KV Datenbank abrufen
  const rawArticles = await kv.lrange<any>('articles', 0, -1);

  // Sicherer Parse: Überspringe kaputte Einträge statt die ganze App zu crashen
  const articles: Article[] = rawArticles.map((a) => {
    // Wenn a bereits ein Objekt ist, gib es direkt zurück
    if (typeof a === 'object' && a !== null) {
      return a as Article;
    }
    // Wenn es ein String ist (altes Format), parsen wir es
    try {
        return JSON.parse(a);
      } catch (e) {
      console.error("Datenformat-Fehler:", a);
      return null;
      }
  }).filter((a): a is Article => a !== null); // Entfernt alle null-Werte

  return (
    <main className="p-8 text-white max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">News aus der Liga</h1>
        <Link
          href="/neuigkeiten/verfassen"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold"
        >
          + Artikel verfassen
        </Link>
      </div>
      
      <div className="grid gap-6">
        {articles.length === 0 ? (
          <p className="text-gray-400">Noch keine Artikel vorhanden.</p>
        ) : (
          articles.map((article) => {
            // Zusammenfassung: Erste 3 Sätze aus dem Content ziehen
            const summary = article.content.split('.').slice(0, 3).join('.') + '.';

            return (
            <Link href={`/neuigkeiten/${article.id}`} key={article.id} className="block bg-gray-800 p-4 rounded-lg border border-gray-700 hover:border-blue-500 transition">
              <div className="flex gap-4">
                  {article.imageUrls && article.imageUrls.length > 0 && (
                    <img src={article.imageUrls[0]} alt={article.title} className="w-32 h-32 object-cover rounded" />
                )}
                <div>
                  <h2 className="text-xl font-bold">{article.title}</h2>
                    <p className="text-gray-400 text-sm mt-2 line-clamp-3">{summary}</p>
                </div>
              </div>
            </Link>
            );
          })
        )}
      </div>
    </main>
  );
}

module.exports = {
  // ...
  plugins: [require('@tailwindcss/typography')],
}

