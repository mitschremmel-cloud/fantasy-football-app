import Link from 'next/link';
import { Scale, Sparkles } from 'lucide-react';

export default function RechnerPage() {
  return (
    <main className="p-6 md:p-12">
      <h1 className="text-3xl font-bold text-white mb-8">Rechner Hub</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/rechner/rechner-hub/keeper" className="bg-slate-700 p-6 rounded-xl hover:bg-slate-600 flex items-center gap-4 border-2 border-slate-600">
          <Sparkles className="w-8 h-8 text-purple-400" />
          <span className="text-xl font-semibold text-white">Keeper Rechner</span>
        </Link>
        <Link href="/rechner/rechner-hub/trade" className="bg-slate-700 p-6 rounded-xl hover:bg-slate-600 flex items-center gap-4 border-2 border-slate-600">
          <Scale className="w-8 h-8 text-blue-400" />
          <span className="text-xl font-semibold text-white">Trade Rechner</span>
        </Link>
      </div>
    </main>
  );
}

