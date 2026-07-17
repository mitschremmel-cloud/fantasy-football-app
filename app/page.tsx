import Link from 'next/link';
import { kv } from '@vercel/kv';
import { History, Sparkles, ScrollText, Scale, BookOpen, Activity, Trophy, Newspaper } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Regionaliga Südkiff Hub",
  description: "Saison 2026 • Live-Berechnung & Liga-Verwaltung",
  openGraph: {
    title: "Regionaliga Südkiff Hub",
    description: "Saison 2026 • Live-Berechnung & Liga-Verwaltung",
  },
};

export const revalidate = 0;

type Article = {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  imageUrls?: string[];
  createdAt: number;
};
export default async function HomePage() {
  // Artikel abrufen
  const rawArticles = await kv.lrange<any>('articles', 0, -1);
  const articles: Article[] = rawArticles.map((a) => {
    if (typeof a === 'object' && a !== null) return a as Article;
    try { return JSON.parse(a); } catch { return null; }
  }).filter((a): a is Article => a !== null);

  const latestArticle = articles.length > 0 ? articles[articles.length - 1] : null;

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 p-6 md:p-12 flex flex-col items-center">
      <div className="max-w-xl w-full text-center mb-8">
        <h1 className="text-3xl font-black tracking-tight uppercase flex items-center justify-center gap-2">
          <Sparkles className="w-6 h-6 text-indigo-400" /> Regionaliga Südkiff Hub
        </h1>
        <p className="text-slate-400 text-xs mt-1 uppercase tracking-wider">
          Saison 2026 • Live-Berechnung & Liga-Verwaltung
        </p>
      </div>

      {/* LATEST NEWS PREVIEW */}
      {latestArticle && (
        <Link href={`/neuigkeiten/${latestArticle.id}`} className="max-w-xl w-full mb-6 bg-slate-800 p-4 rounded-xl border border-slate-700 hover:border-pink-500 transition">
          <div className="flex gap-4 items-center">
            {(latestArticle.imageUrl || (latestArticle.imageUrls && latestArticle.imageUrls[0])) && (
              <img
                src={latestArticle.imageUrl || latestArticle.imageUrls![0]}
                alt={latestArticle.title}
                className="w-16 h-16 object-cover rounded-lg"
              />
            )}
            <div>
              <p className="text-pink-400 text-[10px] font-bold uppercase tracking-widest mb-1">Top-News</p>
              <h2 className="text-lg font-bold leading-tight">{latestArticle.title}</h2>
            </div>
          </div>
        </Link>
      )}

      {/* NAVIGATION */}
      <div className="max-w-xl w-full mb-6 grid grid-cols-2 gap-3">

        {/* Ligabetrieb Link */}
        <Link
          href="/ligabetrieb"
          className="bg-slate-800/40 hover:bg-slate-800 border border-slate-700/60 hover:border-amber-500/50 rounded-xl py-3 px-4 text-sm text-slate-300 hover:text-amber-400 transition-all flex items-center justify-center gap-2 group font-medium"
        >
          <Trophy className="w-4 h-4" /> Ligabetrieb
        </Link>

        {/* Neuigkeiten Link */}
        <Link
          href="/neuigkeiten"
          className="bg-slate-800/40 hover:bg-slate-800 border border-slate-700/60 hover:border-pink-500/50 rounded-xl py-3 px-4 text-sm text-slate-300 hover:text-pink-400 transition-all flex items-center justify-center gap-2 group font-medium"
        >
          <Newspaper className="w-4 h-4" /> Neuigkeiten
        </Link>

        {/* Rechner Hub Link */}
        <Link
          href="/rechner"
          className="bg-slate-800/40 hover:bg-slate-800 border border-slate-700/60 hover:border-blue-500/50 rounded-xl py-3 px-4 text-sm text-slate-300 hover:text-blue-400 transition-all flex items-center justify-center gap-2 group font-medium"
        >
          <Scale className="w-4 h-4" /> Rechner Hub
        </Link>

        {/* Simulatoren Hub Link */}
        <Link
          href="/simulatoren"
          className="bg-slate-800/40 hover:bg-slate-800 border border-slate-700/60 hover:border-indigo-500/50 rounded-xl py-3 px-4 text-sm text-slate-300 hover:text-indigo-400 transition-all flex items-center justify-center gap-2 group font-medium"
        >
          <Activity className="w-4 h-4" /> Simulatoren Hub
        </Link>

      </div>
    </main>
  );
}

