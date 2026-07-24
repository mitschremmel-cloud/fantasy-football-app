import Link from 'next/link';
import { holeLigaHistorie } from '@/app/utils/sleeperAPI/historyService';
interface Champion {
  year: string;
  winner: string;
  rosterId?: number;
  fPoints?: number;
  record?: string;
}

export default async function HalleDerBeruehmten() {
  const history = await holeLigaHistorie();

  if (!Array.isArray(history)) {
    return <div className="p-6 text-red-500">Fehler beim Laden der Historie.</div>;
  }
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-8 text-white">Halle der Berühmten</h1>
      
      <div className="grid gap-4">
        {history.map((c: any) => (
          <Link
            key={c.year}
            href={`/ligabetrieb/halle-der-beruehmten/${c.year}`}
            className="p-6 border border-slate-700 bg-slate-800 rounded-xl hover:bg-slate-700 transition"
          >
            <h2 className="text-xl font-bold text-white">{c.year}</h2>
            <p className="text-slate-300 font-semibold mb-2">Sieger: {c.winner}</p>
            {c.fPoints && (
                <div className="flex gap-4 text-xs text-slate-400">
                    <span>Record: <span className="text-white font-mono">{c.record}</span></span>
                    <span>Points For: <span className="text-white font-mono">{c.fPoints}</span></span>
                </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}

