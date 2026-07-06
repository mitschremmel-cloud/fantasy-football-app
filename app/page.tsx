import Link from 'next/link';
import { History, Sparkles, ScrollText, Scale, BookOpen } from 'lucide-react'; // BookOpen hinzugefügt
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

      {/* NAVIGATION */}
      <div className="max-w-xl w-full mb-6 grid grid-cols-2 gap-3">
        <Link 
          href="/historie"
          className="bg-slate-800/40 hover:bg-slate-800 border border-slate-700/60 hover:border-indigo-500/50 rounded-xl py-3 px-4 text-sm text-slate-300 hover:text-indigo-400 transition-all flex items-center justify-center gap-2 group font-medium"
        >
          <History className="w-4 h-4" /> Draft-Historie
        </Link>
        
        <Link 
          href="/spielplan"
          className="bg-slate-800/40 hover:bg-slate-800 border border-slate-700/60 hover:border-amber-500/50 rounded-xl py-3 px-4 text-sm text-slate-300 hover:text-amber-400 transition-all flex items-center justify-center gap-2 group font-medium"
        >
          <ScrollText className="w-4 h-4" /> Spielplan
        </Link>

        {/* NEU: Regel-Backlog Link */}
        <Link 
          href="/regelbacklog/quarterback" 
          className="bg-slate-800/40 hover:bg-slate-800 border border-slate-700/60 hover:border-emerald-500/50 rounded-xl py-3 px-4 text-sm text-slate-300 hover:text-emerald-400 transition-all flex items-center justify-center gap-2 group font-medium"
        >
          <BookOpen className="w-4 h-4" /> Regel-Backlog
        </Link>

        {/* Trade Analyzer Link */}
        <Link 
          href="/trade-analyzer"
          className="col-span-2 bg-slate-800/40 hover:bg-slate-800 border border-slate-700/60 hover:border-blue-500/50 rounded-xl py-3 px-4 text-sm text-slate-300 hover:text-blue-400 transition-all flex items-center justify-center gap-2 group font-medium shadow-lg shadow-slate-950/20"
        >
          <Scale className="w-4 h-4 text-slate-400 group-hover:text-blue-400 transition-colors" />
          Trade Analyzer
        </Link>
      </div>

      <div className="max-w-xl w-full">
        <KeeperCalculator />
      </div>

      <div className="max-w-xl w-full mt-6">
        <ManagerKader />
      </div>
    </main>
  );
}