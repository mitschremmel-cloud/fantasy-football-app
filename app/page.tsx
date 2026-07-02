import Link from 'next/link';
import { History, Sparkles, Star } from 'lucide-react';
import KeeperCalculator from './components/KeeperCalculator';
import ManagerKader from './components/ManagerKader';

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

      {/* NAVIGATION ZUR HISTORIE UND HIGHLIGHTS */}
      <div className="max-w-xl w-full mb-6 flex gap-3">
        <Link 
          href="/historie"
          className="flex-1 bg-slate-800/40 hover:bg-slate-800 border border-slate-700/60 hover:border-indigo-500/50 rounded-xl py-3 px-4 text-sm text-slate-300 hover:text-indigo-400 transition-all flex items-center justify-center gap-2 group font-medium shadow-lg shadow-slate-950/20"
        >
          <History className="w-4 h-4 text-slate-400 group-hover:text-indigo-400 transition-colors" />
          Historie
        </Link>
        
        <Link 
          href="/highlights"
          className="flex-1 bg-slate-800/40 hover:bg-slate-800 border border-slate-700/60 hover:border-emerald-500/50 rounded-xl py-3 px-4 text-sm text-slate-300 hover:text-emerald-400 transition-all flex items-center justify-center gap-2 group font-medium shadow-lg shadow-slate-950/20"
        >
          <Star className="w-4 h-4 text-slate-400 group-hover:text-emerald-400 transition-colors" />
          Highlights
        </Link>
      </div>

      {/* Dein bestehender Rechner */}
      <div className="max-w-xl w-full">
        <KeeperCalculator />
      </div>

      {/* Deine bestehende Live-Kader Liste */}
      <div className="max-w-xl w-full mt-6">
        <ManagerKader />
      </div>
    </main>
  );
}