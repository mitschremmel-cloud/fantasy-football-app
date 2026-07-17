import { kv } from '@vercel/kv';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';

type Article = {
  id: string;
  title: string;
  content: string;
  imageUrls?: string[];
  imageUrl?: string;
  createdAt: number;
};

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

  // Wir ersetzen Platzhalter-URLs durch die echten URLs
  const contentWithImages = article.imageUrls && article.imageUrls.length > 0
    ? article.content.replace(/URL_HIER_EINSETZEN/g, () => article.imageUrls![0])
    : article.content;
  return (
    <main className="p-8 text-white max-w-3xl mx-auto zeitungs-artikel">
      <Link href="/neuigkeiten" className="text-blue-400 hover:underline mb-8 block">← Zurück zur Übersicht</Link>
      
      {/* Manuelle Platzierung von Datum und Ort */}
      <div className="text-right text-sm text-gray-400 mb-2 italic">
        17. Mai 2024, Kiffruhe
      </div>

      {/* Die Überschrift besonders groß */}
      <h1 className="text-5xl font-extrabold mb-8 text-center uppercase tracking-tight">
        {article.title}
      </h1>

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
    </main>
  );
}

