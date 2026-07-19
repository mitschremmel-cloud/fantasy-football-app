import Link from 'next/link';
import { REGELBACKLOG } from '@/app/data/regel-backlog';

export default function RegelBacklogPage() {
  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-6">
        <a href="/ligabetrieb" className="text-xs uppercase tracking-widest text-slate-400 hover:text-white transition underline underline-offset-4">
          ← Zurück zum Ligabetrieb
        </a>
      </div>
      <h1 className="text-3xl font-bold mb-8 text-white">Regel-Backlog</h1>
      <div className="grid gap-4">
        {REGELBACKLOG.map((regel) => (
          <Link href={`/ligabetrieb/regelbacklog/${regel.id}`} key={regel.id}>
            <div className="p-6 bg-slate-800 border border-slate-700 rounded-xl hover:bg-slate-700 hover:border-indigo-500 transition-all shadow-md hover:shadow-indigo-500/20">
              <h2 className="text-xl font-bold text-white mb-2">{regel.title}</h2>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

