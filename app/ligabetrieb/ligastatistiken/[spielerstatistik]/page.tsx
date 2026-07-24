import { holeSpielerStatistik } from '@/app/utils/sleeperAPI/statsService';
import { notFound } from 'next/navigation';

export default async function SpielerDetail({ params }: { params: Promise<{ spielerstatistik: string }> }) {
  const { spielerstatistik: loginName } = await params;
  const stats = await holeSpielerStatistik(loginName);

  if ("error" in stats || !stats.bestSeason) return <div className="p-6 text-red-500">Daten nicht gefunden.</div>;

  return (
    <div className="p-6 text-white">
      <h1 className="text-3xl font-bold mb-8">Statistik für {loginName}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
            <h2 className="text-lg font-bold mb-4 text-emerald-400">Beste Saison</h2>
            <p>{stats.bestSeason.season}: {stats.bestSeason.wins} Siege - {stats.bestSeason.losses} Niederlagen</p>
        </div>
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
            <h2 className="text-lg font-bold mb-4 text-rose-400">Schlechteste Saison</h2>
            <p>{stats.worstSeason.season}: {stats.worstSeason.wins} Siege - {stats.worstSeason.losses} Niederlagen</p>
        </div>
      </div>

      <div className="mt-8 bg-slate-800 p-6 rounded-xl border border-slate-700">
        <h2 className="text-xl font-bold mb-4">Top 3 Lieblingsspieler</h2>
        <div className="space-y-4">
            {stats.topPlayers.map((p: any, i: number) => (
                <div key={i} className="flex justify-between items-center border-b border-slate-700 pb-2">
                    <span className="font-semibold">{i + 1}. {p.name}</span>
                    <span className="text-sm text-slate-400">
                        {p.seasons} Saisons | {p.points} Pkt
                    </span>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
}

