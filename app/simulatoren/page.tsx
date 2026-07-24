import Link from 'next/link';
import { Activity, Target, BarChart2 } from 'lucide-react';

export default function SimulatorenHubPage() {
  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 p-8">
      <h1 className="text-3xl font-bold mb-8">Simulatoren Hub</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/simulatoren/kicker-scoring" className="bg-slate-700 p-6 rounded-xl hover:bg-slate-600 flex flex-col items-center gap-4 border-2 border-slate-600">
          <Target className="w-10 h-10 text-amber-400" />
          <span className="text-xl font-semibold text-white">Kicker Scoring</span>
        </Link>
        <Link href="/simulatoren/scoring" className="bg-slate-700 p-6 rounded-xl hover:bg-slate-600 flex flex-col items-center gap-4 border-2 border-slate-600">
          <Activity className="w-10 h-10 text-emerald-400" />
          <span className="text-xl font-semibold text-white">QB Scoring</span>
        </Link>
      </div>
    </main>
  );
}

