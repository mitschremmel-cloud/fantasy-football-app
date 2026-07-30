import { holeH2HStatistik } from '@/app/utils/sleeperAPI/statsService';

export default async function H2HPage({ params }: { params: Promise<{ spielerstatistik: string }> }) {
  const { spielerstatistik: loginName } = await params;
  const h2h = await holeH2HStatistik(loginName);

  if ("error" in h2h) return <div className="p-6 text-red-500">Fehler beim Laden.</div>;

  return (
    <div className="p-6 text-white">
      <h1 className="text-3xl font-bold mb-8">Head-to-Head: {loginName}</h1>
      
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-900 uppercase text-xs font-bold text-slate-400">
            <tr>
              <th className="p-4">Gegner</th>
              <th className="p-4 text-center">Siege</th>
              <th className="p-4 text-center">Niederlagen</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {Object.entries(h2h).map(([opponent, stats]) => (
              <tr key={opponent}>
                <td className="p-4">{opponent}</td>
                <td className="p-4 text-center text-emerald-400">{stats.wins}</td>
                <td className="p-4 text-center text-rose-400">{stats.losses}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

