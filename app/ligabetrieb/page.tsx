import Link from 'next/link';
import { ScrollText, BookOpen, History, Trophy } from 'lucide-react'; // Trophy hinzugefügt

export default function LigabetriebHub() {
  return (
    <main className="p-6 md:p-12">
      <h1 className="text-3xl font-bold text-white mb-8">Ligabetrieb</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/ligabetrieb/spielplan" className="bg-slate-700 p-6 rounded-xl hover:bg-slate-600 flex items-center gap-4 border-2 border-slate-600">
          <ScrollText className="w-8 h-8 text-amber-400" />
          <span className="text-xl font-semibold text-white">Spielplan</span>
        </Link>       
        
        <Link href="/ligabetrieb/ligaregeln" className="bg-slate-700 p-6 rounded-xl hover:bg-slate-600 flex items-center gap-4 border-2 border-slate-600">
          <BookOpen className="w-8 h-8 text-sky-400" />
          <span className="text-xl font-semibold text-white">Ligaregeln</span>
        </Link>
        <Link href="/ligabetrieb/regelbacklog" className="bg-slate-700 p-6 rounded-xl hover:bg-slate-600 flex items-center gap-4 border-2 border-slate-600">
          <BookOpen className="w-8 h-8 text-emerald-400" />
          <span className="text-xl font-semibold text-white">Regel-Backlog</span>
        </Link>
        <Link href="/ligabetrieb/historie" className="bg-slate-700 p-6 rounded-xl hover:bg-slate-600 flex items-center gap-4 border-2 border-slate-600">
          <History className="w-8 h-8 text-indigo-400" />
          <span className="text-xl font-semibold text-white">Draft-Historie</span>
        </Link>
        <Link href="/ligabetrieb/halle-der-beruehmten" className="bg-slate-700 p-6 rounded-xl hover:bg-slate-600 flex items-center gap-4 border-2 border-slate-600">
          <Trophy className="w-8 h-8 text-yellow-400" />
          <span className="text-xl font-semibold text-white">Halle der Berühmten</span>
        </Link>
      </div>
    </main>
  );
}

