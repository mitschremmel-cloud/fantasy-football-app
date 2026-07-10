import Link from 'next/link';
import { History, Sparkles, ScrollText, Scale, BookOpen, Activity, Trophy, Newspaper } from 'lucide-react';

export default function HomePage() {
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

