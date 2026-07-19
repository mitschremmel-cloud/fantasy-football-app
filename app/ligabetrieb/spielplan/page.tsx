"use client";

import { useState, useEffect } from 'react';
import { GAME_STRUCTURE, PLAYOFF_OPTIONS, RIVALRIES, getMatchType } from '../../data/spielplan';

// Wir definieren den Typ jetzt einfach hier im Frontend, 
// damit wir das Backend nicht mehr importieren müssen und der Compiler-Fehler verschwindet!
export interface SpielerDaten {
  name: string;
  manager: string;
  division: number; 
  runde2025: string;
  istWaiver: boolean;
  jahreGekeept: number;
  dbEintrag: Record<string, string>;
}

// Typ für die dynamischen Matchups
type WeekMatchups = { team1: string; team2: string }[];

export default function SpielplanPage() {
  const [divisions, setDivisions] = useState<{ 1: string[], 2: string[] }>({ 1: [], 2: [] });
  const [loading, setLoading] = useState(true);
  const [aktiveWoche, setAktiveWoche] = useState<number>(1);
  const [apiSchedule, setApiSchedule] = useState<Record<number, WeekMatchups>>({});

  const getRivalryBorder = (team: string) => {
    const normalize = (n: string) => n.toLowerCase().replace(/\s+/g, '').trim();
    const teamNorm = normalize(team);

    const rivalry = RIVALRIES.find(r => 
      normalize(r.team1) === teamNorm || normalize(r.team2) === teamNorm
    );
    
    return rivalry ? `border-l-4 ${rivalry.color} pl-2` : "pl-3";
  };

  useEffect(() => {
    async function ladeDaten() {
      try {
        // 1. Divisionen vom bestehenden Endpunkt laden (Deine Kader-Daten)
        const res = await fetch('/api/sleeper');
        const daten: SpielerDaten[] = await res.json();

        if (Array.isArray(daten)) {
          const div1 = new Set<string>();
          const div2 = new Set<string>();
  
          daten.forEach((s) => {
            if (s.manager && !s.manager.includes("Free Agent")) {
              if (s.division === 1) div1.add(s.manager);
              else if (s.division === 2) div2.add(s.manager);
            }
          });
          setDivisions({ 1: Array.from(div1).sort(), 2: Array.from(div2).sort() });
        }

        // 2. Den fertigen Spielplan von unserer NEUEN Route laden
        const matchRes = await fetch('/api/matchups');
        const matchData = await matchRes.json();
        
        if (!matchData.error) {
          setApiSchedule(matchData);
        }

      } catch (err) { 
        console.error("Fehler beim Laden der Daten:", err); 
      } finally { 
        setLoading(false); 
      }
    }
    
    ladeDaten();
  }, []);
  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <a href="/ligabetrieb" className="text-xs uppercase tracking-widest text-slate-400 hover:text-white transition underline underline-offset-4">
          ← Zurück zum Ligabetrieb
        </a>
      </div>
      <h1 className="text-4xl font-extrabold mb-10 text-white border-b border-slate-700 pb-4">Spielplan</h1>

      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-6">Divisions-Einteilung</h2>
        {loading ? <p className="text-slate-400">Lade Daten...</p> : (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 shadow-lg">
              <h3 className="font-bold text-blue-400 mb-4 text-lg border-b border-slate-700 pb-2">Highdelberg</h3>
              <ul className="space-y-2 text-slate-300">
                {divisions[1].map(n => <li key={n} className={`bg-slate-700/20 py-1 rounded-r ${getRivalryBorder(n)}`}>• {n}</li>)}
              </ul>
      </div>
            <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 shadow-lg">
              <h3 className="font-bold text-yellow-400 mb-2 text-lg border-b border-slate-700 pb-2">Kiffruhe</h3>
              <ul className="space-y-2 text-slate-300">
                {divisions[2].map(n => <li key={n} className={`bg-slate-700/20 py-1 rounded-r ${getRivalryBorder(n)}`}>• {n}</li>)}
              </ul>
                          </div>
                    </div>
                  )}
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
          <h2 className="text-xl font-bold mb-4 text-white">Saisonstruktur</h2>
          <table className="w-full text-slate-300">
            <tbody>
              {GAME_STRUCTURE.map((g, i) => (
                <tr key={i} className="border-b border-slate-700 last:border-0">
                  <td className="py-2">{g.label}</td>
                  <td className="py-2 text-right font-bold text-white">{g.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
          <h2 className="text-xl font-bold mb-4 text-white">Playoff-Modus</h2>
          <ul className="space-y-3 text-slate-300">
            {PLAYOFF_OPTIONS.map((o, i) => (
              <li key={i} className="bg-slate-700/50 p-3 rounded-lg text-sm italic">{o}</li>
            ))}
          </ul>
        </section>
      </div>

      <section className="bg-slate-800 p-6 rounded-2xl border border-slate-700 mt-6">
        <h2 className="text-xl font-bold mb-4 text-white">Wöchentlicher Spielplan</h2>

        {loading ? (
          <p className="text-slate-400">Lade Matchups...</p>
        ) : Object.keys(apiSchedule).length === 0 ? (
          <p className="text-yellow-500">Spielplan konnte nicht geladen werden. Bitte API-Route prüfen.</p>
        ) : (
          <div className="space-y-4">
            {Object.entries(apiSchedule).map(([woche, matchups]) => {
              const wocheNum = parseInt(woche);
              const istAktiv = wocheNum === aktiveWoche;

              return (
                <div key={woche} className="border border-slate-700 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setAktiveWoche(istAktiv ? 0 : wocheNum)}
                    className="w-full p-4 flex justify-between items-center bg-slate-700/30 hover:bg-slate-700/50 transition"
                  >
                    <span className="font-bold text-white">Woche {woche}</span>
                    <span className="text-xs text-slate-400">{istAktiv ? "Einklappen" : "Ausklappen"}</span>
                  </button>

                  {istAktiv && (
                    <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-2 bg-slate-800">
                      {matchups.map((m: any, i: number) => {
                        const matchType = getMatchType(m.team1, m.team2);

                        return (
                          <div key={i} className={`px-3 py-2 rounded text-sm border-l-4 ${
                            matchType === 'rivalry' ? 'bg-red-900/30 border-red-500' :
                            matchType === 'division' ? 'bg-green-900/30 border-green-500' : 'bg-yellow-900/30 border-yellow-500'
                          }`}>
                            {m.team1} vs {m.team2}
                          </div>
  );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}