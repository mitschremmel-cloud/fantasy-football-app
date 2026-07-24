import { notFound } from 'next/navigation';
import { holeLigaHistorie, holeKaderFuerJahr } from '@/app/utils/sleeperAPI/historyService';

// params muss als Promise deklariert werden
export default async function JahrDetails({ params }: { params: Promise<{ jahr: string }> }) {
  const { jahr } = await params;
  const [history, kader] = await Promise.all([
    holeLigaHistorie(),
    holeKaderFuerJahr(jahr)
  ]);
  
  if (!Array.isArray(history)) return <div className="p-6 text-red-500">Fehler beim Laden.</div>;
  const champion = history.find((c: any) => c.year === jahr);
  
  if (!champion) notFound();

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4 text-white">Saison {jahr}</h1>
      <p className="text-slate-300 mb-8">Sieger: {champion.winner}</p>
      
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
        <h2 className="text-xl font-bold text-white mb-4">Kader des Siegers</h2>
        {Array.isArray(kader) ? (
          (() => {
            // Finde das Roster, das zum Sieger gehört (wir müssen hier evtl. den Namen matchen)
            // Da wir in historyService.ts kein direktes Mapping von Name zu roster_id haben,
            // suchen wir den Manager, der zum Sieger-Namen passt.
            const siegerName = champion.winner.split(' (')[0];
            const siegerKader = kader.find((k: any) => k.manager === siegerName);

            return siegerKader ? (
              <div className="text-slate-300">
                <p className="font-bold text-indigo-400 mb-4">{siegerKader.manager}</p>
                <div className="grid gap-2">
                  {siegerKader.players.map((p: any, i: number) => (
                    <div key={i} className="flex justify-between text-sm border-b border-slate-700 pb-1">
                      <span>{p.name}</span>
                      <span className="flex gap-4">
                        <span className="text-slate-500 font-mono">{p.status}</span>
                        <span className="text-indigo-300 font-bold">{p.points} Pkt</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-slate-400 italic">Kader des Siegers konnte nicht zugeordnet werden.</p>
            );
          })()
        ) : (
          <p className="text-slate-400 italic">Keine Kaderdaten verfügbar.</p>
        )}
      </div>
    </div>
  );
}

