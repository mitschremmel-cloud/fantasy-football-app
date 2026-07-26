"use client";

import { useState, useEffect } from 'react';
import { GAME_STRUCTURE, PLAYOFF_OPTIONS, RIVALRIES, getMatchType, SPIELPLAN_2025 } from '../../data/spielplan';

// Wir definieren den Typ jetzt einfach hier im Frontend, 
// damit wir das Backend nicht mehr importieren müssen und der Compiler-Fehler verschwindet!
export interface SpielerDaten {
  name: string;
  manager: string;
  loginName: string;
  division: number; 
  runde2025: string;
  istWaiver: boolean;
  jahreGekeept: number;
  dbEintrag: Record<string, string>;
}

// Typ für die dynamischen Matchups
type WeekMatchups = { team1: string; team2: string }[];

export default function SpielplanPage() {
  const [divisions, setDivisions] = useState<{ 1: { team: string, login: string }[], 2: { team: string, login: string }[] }>({ 1: [], 2: [] });
  const [loading, setLoading] = useState(true);
  // State für den sauberen API-Spielplan
  const [apiSchedule, setApiSchedule] = useState<Record<number, WeekMatchups>>({});

  const getRivalry = (team: string) => {
    const normalize = (n: string) => n.trim().replace(/\s+/g, ' ');
    const teamNorm = normalize(team);

    return RIVALRIES.find(r =>
      normalize(r.team1) === teamNorm || normalize(r.team2) === teamNorm
    );
  };

  useEffect(() => {
    async function ladeDaten() {
      try {
        // 1. Divisionen vom bestehenden Endpunkt laden (Deine Kader-Daten)
        const res = await fetch('/api/sleeper');
        const daten: SpielerDaten[] = await res.json();

        if (Array.isArray(daten)) {
          const div1 = new Map<string, string>(); // Map von TeamName zu LoginName
          const div2 = new Map<string, string>();
          daten.forEach((s) => {
            if (s.manager && !s.manager.includes("Free Agent")) {
              if (s.division === 1) div1.set(s.manager, s.loginName);
              else if (s.division === 2) div2.set(s.manager, s.loginName);
            }
          });

          const sortiereTeamsDiv1 = (teams: { team: string, login: string }[]) => {
            const reihenfolge = ["High del Bergers", "Wallachfrieds Allstars", "WinstonsBattlehorses", "Frisch gekocht in Kiffruh", "Team Fancy Pass"];
            return teams.sort((a, b) => reihenfolge.indexOf(a.team) - reihenfolge.indexOf(b.team));
          };

          const sortiereTeamsDiv2 = (teams: { team: string, login: string }[]) => {
            const reihenfolge = ["Ona Saufen mit dem Board", "Team Marvin", "paddy19", "Karlsruher Kushfarmer 🪴", "NLZ (La Zarett)"];
            return teams.sort((a, b) => reihenfolge.indexOf(a.team) - reihenfolge.indexOf(b.team));
          };

          setDivisions({
            1: sortiereTeamsDiv1(Array.from(div1.entries()).map(([team, login]) => ({ team, login }))),
            2: sortiereTeamsDiv2(Array.from(div2.entries()).map(([team, login]) => ({ team, login })))
          });
        }

        // 2. Spielplan direkt aus den Daten nehmen statt API
        setApiSchedule(SPIELPLAN_2025);
      } catch (err) { 
        console.error("Fehler beim Laden der Daten:", err); 
      } finally { 
        setLoading(false); 
      }
    }
    
    ladeDaten();
  }, []);

  useEffect(() => {
    console.log("Aktuelle Divisions-Namen:", divisions);
  }, [divisions]);

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 p-8 max-w-4xl mx-auto">
      <h1 className="text-4xl font-extrabold mb-10 text-white border-b border-slate-700 pb-4">Spielplan</h1>

      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-6">Divisions-Einteilung</h2>
        {loading ? <p className="text-slate-400">Lade Daten...</p> : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 shadow-lg">
              <h3 className="font-bold text-blue-400 mb-4 text-lg border-b border-slate-700 pb-2">Highdelberg</h3>
              <ul className="space-y-2 text-slate-300">
                {divisions[1].map(({ team, login }) => {
                  const rivalry = getRivalry(team);
                  return (
                    <li
                      key={team}
                      className="rounded"
                      style={{ backgroundColor: rivalry ? rivalry.color : 'rgba(30, 41, 59, 0.4)' }}
                    >
                      <a href={`/ligabetrieb/ligastatistiken/${encodeURIComponent(login)}`} className="block py-1 px-3 w-full h-full text-slate-100 hover:text-white">
                        {team}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
            <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 shadow-lg">
              <h3 className="font-bold text-yellow-400 mb-4 text-lg border-b border-slate-700 pb-2">Kiffruhe</h3>
              <ul className="space-y-2 text-slate-300">
                {divisions[2].map(({ team, login }) => {
                  const rivalry = getRivalry(team);
                  return (
                    <li
                      key={team}
                      className="rounded"
                      style={{ backgroundColor: rivalry ? rivalry.color : 'rgba(30, 41, 59, 0.4)' }}
                    >
                      <a href={`/ligabetrieb/ligastatistiken/${encodeURIComponent(login)}`} className="block py-1 px-3 w-full h-full text-slate-100 hover:text-white">
                        {team}
                      </a>
                    </li>
                  );
                })}
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
        <h2 className="text-xl font-bold mb-6 text-white">Wöchentlicher Spielplan</h2>

        {loading ? (
          <p className="text-slate-400">Lade Matchups...</p>
        ) : Object.keys(apiSchedule).length === 0 ? (
          <p className="text-yellow-500">Spielplan konnte nicht geladen werden.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-300">
              <thead className="text-xs uppercase bg-slate-700/50 text-slate-400">
                <tr>
                  <th className="px-4 py-3">Woche</th>
                  <th className="px-4 py-3 flex justify-between items-center">
                    <span>Matchups</span>
                    <div className="flex gap-4 font-normal normal-case">
                      <span className="flex items-center gap-1"><span className="w-3 h-3 bg-red-900/30 border-l-2 border-red-500"></span> Rivale</span>
                      <span className="flex items-center gap-1"><span className="w-3 h-3 bg-green-900/30 border-l-2 border-green-500"></span> Division</span>
                      <span className="flex items-center gap-1"><span className="w-3 h-3 bg-yellow-900/30 border-l-2 border-yellow-500"></span> Interdivision</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {Object.entries(apiSchedule).map(([woche, matchups]) => (
                  <tr key={woche} className="bg-slate-800 hover:bg-slate-700/50">
                    <td className="px-4 py-3 font-bold text-white whitespace-nowrap">Woche {woche}</td>
                    <td className="px-4 py-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2">
                      {matchups.map((m, i) => {
                        const matchType = getMatchType(m.team1, m.team2);

                        // Hier erzwingen wir für die Spielplan-Tabelle:
                        // Rot (Rivalen), Grün (Division), Gelb (Conference)
                        const colorClass =
                          matchType === 'rivalry' ? 'bg-red-900/30 border-red-500' :
                          matchType === 'division' ? 'bg-green-900/30 border-green-500' :
                          'bg-yellow-900/30 border-yellow-500';

                        return (
                          <div
                            key={i}
                            className={`px-2 py-1 rounded text-sm border-l-4 ${colorClass}`}
                            style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
                          >
                            <span className="block break-words">
                              {m.team1} <span className="text-slate-500 text-[10px] whitespace-nowrap">vs</span> {m.team2}
                            </span>
                          </div>
                        );
                      })}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}