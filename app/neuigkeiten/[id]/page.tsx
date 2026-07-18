import { kv } from '@vercel/kv';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import type { Metadata } from 'next';
import { CommentSection } from '../../components/CommentSection';

type Article = {
  id: string;
  title: string;
  content: string;
  imageUrls?: string[];
  imageUrl?: string;
  createdAt: number;
};

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const rawArticles = await kv.lrange<any>('articles', 0, -1);
  const article = rawArticles.map(a => typeof a === 'string' ? JSON.parse(a) : a).find((a: Article) => a.id === id);

  // Der WSrv-Proxy: Er lädt dein Bild, skaliert es auf 1200x630 und gibt es als optimiertes JPG/PNG aus
  // Das umgeht das 2,3 MB Problem und das 206 Partial Content Problem komplett
  const originalUrl = article?.imageUrls?.[0];
  const ogImageUrl = originalUrl
    ? `https://wsrv.nl/?url=${encodeURIComponent(originalUrl)}&w=1200&h=630&fit=cover&format=png`
    : 'https://fantasy-football-app-sigma.vercel.app/og-image.png';

  const url = `https://fantasy-football-app-sigma.vercel.app/neuigkeiten/${id}`;
  return {
    title: article?.title || "Artikel",
    description: article?.content.substring(0, 100) + "...", // Beschreibung für og:description
    openGraph: {
      title: article?.title || "Artikel",
      description: article?.content.substring(0, 100) + "...",
      url: url,
      siteName: "Regionaliga Südkiff Hub",
      images: [{
        url: ogImageUrl,
        width: 1200,
        height: 630
      }],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: article?.title || "Artikel",
      description: article?.content.substring(0, 100) + "...",
      images: [ogImageUrl],
    },
  };
}

export default async function ArtikelDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const rawArticles = await kv.lrange<any>('articles', 0, -1);
  const articles: Article[] = rawArticles.map((a) => {
    if (typeof a === 'object' && a !== null) return a as Article;
    try {
      return JSON.parse(a);
    } catch (e) {
      return null;
    }
  }).filter((a): a is Article => a !== null);

  const article = articles.find((a) => a.id === id);

  if (!article) return <main className="p-8 text-white">Artikel nicht gefunden.</main>;

  // Wir ersetzen Platzhalter-URLs (IMAGE_1, IMAGE_2, ...) durch die echten URLs
  const contentWithImages = article.imageUrls && article.imageUrls.length > 0
    ? article.content.replace(/IMAGE_(\d+)/g, (match, p1) => {
    const index = parseInt(p1) - 1;
    return article.imageUrls?.[index] || "";
      })
    : article.content;

  // Kommentare laden
  const rawComments = await kv.lrange<any>(`comments:${id}`, 0, -1);
  const comments = rawComments.map(c => typeof c === 'string' ? JSON.parse(c) : c);
  return (
    <main className="p-8 text-white max-w-3xl mx-auto zeitungs-artikel">
      <Link href={`/neuigkeiten?t=${Date.now()}`} className="text-blue-400 hover:underline mb-8 block">← Zurück zur Übersicht</Link>
      
      {/* Manuelle Platzierung von Datum und Ort */}
      <div className="text-right text-sm text-gray-400 mb-2 italic">
        {new Date(article.createdAt).toLocaleDateString('de-DE', {
          day: '2-digit',
          month: 'long',
          year: 'numeric'
        })}, Kiffruhe
      </div>

      {/* Die Überschrift besonders groß */}
      <h1 className="text-5xl font-extrabold mb-8 text-center uppercase tracking-tight">
        {article.title}
      </h1>

      {/* Teilen-Button */}
      <div className="flex justify-center mb-8">
        <button
          onClick={() => {
            const freshUrl = `${window.location.origin}${window.location.pathname}?t=${Date.now()}`;
            navigator.clipboard.writeText(freshUrl);
            alert('Link wurde in die Zwischenablage kopiert! WhatsApp wird das Vorschaubild jetzt neu laden.');
          }}
          className="bg-slate-700 hover:bg-indigo-600 text-white px-6 py-2 rounded-full text-sm transition-all shadow-lg border border-slate-600"
        >
          🔗 Link zum Teilen kopieren
        </button>
      </div>

      <div className="prose prose-invert max-w-none">
        <ReactMarkdown
          components={{
            img: ({node, ...props}) => <img {...props} className="my-6 border border-gray-600 rounded shadow-lg" />,
            p: ({node, ...props}) => <p className="mb-6 leading-relaxed" {...props} />
          }}
        >
            {contentWithImages}
        </ReactMarkdown>
      </div>

      {/* Kommentar-Sektion */}
      <div className="mt-12 pt-8 border-t border-slate-700">
         <h3 className="text-xl font-bold mb-6">Diskussion</h3>
        {comments.length === 0 ? (
           <p className="text-gray-500 text-sm italic">Noch keine Kommentare.</p>
        ) : (
            comments.map((c, i) => (
             <div key={i} className="bg-slate-800 p-4 rounded-lg mb-3">
                <p className="font-bold text-sm text-indigo-400">{c.username}</p>
                    <p className="text-sm mt-1">{c.comment}</p>
                    <p className="text-[10px] text-gray-500 mt-2">{new Date(c.createdAt).toLocaleString('de-DE')}</p>
                </div>
            ))
        )}
      <CommentSection articleId={id} />
      </div>
    </main>
  );
}

