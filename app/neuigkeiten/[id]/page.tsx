import { kv } from '@vercel/kv';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import type { Metadata } from 'next';

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

  return {
    title: article?.title || "Artikel",
    openGraph: {
      title: article?.title || "Artikel",
      images: article?.imageUrls?.[0] ? [{ url: article.imageUrls[0], width: 1200, height: 630, alt: article.title }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: article?.title || "Artikel",
      images: article?.imageUrls?.[0] ? [article.imageUrls[0]] : [],
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
  const contentWithImages = article.content.replace(/IMAGE_(\d+)/g, (match, p1) => {
    const index = parseInt(p1) - 1;
    return article.imageUrls?.[index] || "";
  });

  return (
    <main className="p-8 text-white max-w-3xl mx-auto zeitungs-artikel">
      <Link href="/neuigkeiten" className="text-blue-400 hover:underline mb-8 block">← Zurück zur Übersicht</Link>
      
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

