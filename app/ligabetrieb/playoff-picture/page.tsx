import React from 'react';
import { getLeagueStandings } from '../../utils/sleeperAPI/standingsService';

export default async function PlayoffPicturePage() {
  const standings = await getLeagueStandings();

  const data = (standings && standings.length > 0) ? standings : [];

  if (data.length === 0) {
    return React.createElement('main', { className: 'p-8 text-white' },
      React.createElement('h1', { className: 'text-3xl' }, 'Playoff Picture'),
      React.createElement('p', null, 'Keine Daten verfügbar.')
    );
  }

  // 1. Sortier-Logik wie besprochen (Leader 1/2, dann Rest)
  const div1 = data.filter((t: any) => t.settings.division === 1);
  const div2 = data.filter((t: any) => t.settings.division === 2);
  const leader1 = div1.sort((a: any, b: any) => b.settings.wins - a.settings.wins || b.settings.fpts - a.settings.fpts)[0];
  const leader2 = div2.sort((a: any, b: any) => b.settings.wins - a.settings.wins || b.settings.fpts - a.settings.fpts)[0];
  const seeds1_2 = [leader1, leader2].sort((a, b) => b.settings.wins - a.settings.wins || b.settings.fpts - a.settings.fpts);
  const remaining = data.filter((t: any) => t.roster_id !== leader1.roster_id && t.roster_id !== leader2.roster_id);
  const runnerUp1 = div1.filter((t: any) => t.roster_id !== leader1.roster_id).sort((a: any, b: any) => b.settings.wins - a.settings.wins || b.settings.fpts - a.settings.fpts)[0];
  const runnerUp2 = div2.filter((t: any) => t.roster_id !== leader2.roster_id).sort((a: any, b: any) => b.settings.wins - a.settings.wins || b.settings.fpts - a.settings.fpts)[0];
  const seeds3_4 = [runnerUp1, runnerUp2].sort((a, b) => b.settings.wins - a.settings.wins || b.settings.fpts - a.settings.fpts);
  const wildcards = remaining
        .filter((t: any) => t.roster_id !== runnerUp1.roster_id && t.roster_id !== runnerUp2.roster_id)
        .sort((a: any, b: any) => b.settings.fpts - a.settings.fpts)
        .slice(0, 2);
  const playoffs = [...seeds1_2, ...seeds3_4, ...wildcards];

  // 2. Bracket Logik
  // Viertelfinale: 3 vs 6 und 4 vs 5
  // Halbfinale: 1 vs (niedrigster verbliebener Seed), 2 vs (anderer Seed)
  const qf1 = [playoffs[2], playoffs[5]]; // 3 vs 6
  const qf2 = [playoffs[3], playoffs[4]]; // 4 vs 5

  return (
    <main className="p-6 md:p-12 text-white">
      <div className="mb-6">
        <a href="/ligabetrieb" className="text-xs uppercase tracking-widest text-slate-400 hover:text-white transition underline underline-offset-4">
          ← Zurück zum Ligabetrieb
        </a>
      </div>
      <h1 className="text-3xl font-bold mb-8">Playoff Picture</h1>
      <div className="flex justify-center items-center gap-8 py-12">
        <div className="flex flex-col gap-4">
          <div className="bg-slate-700 p-4 rounded border-l-4 border-yellow-500 w-48">Seed 1: {playoffs[0]?.team_name}</div>
          <div className="bg-slate-700 p-4 rounded border-l-4 border-gray-400 w-48">Seed 4: {playoffs[3]?.team_name}</div>
          <div className="bg-slate-700 p-4 rounded border-l-4 border-blue-500 w-48">Seed 5: {playoffs[4]?.team_name}</div>
        </div>
        <div className="border-t-2 border-slate-600 w-24"></div>
        <div className="flex flex-col gap-4">
          <div className="bg-slate-700 p-4 rounded border-l-4 border-yellow-500 w-48">Seed 2: {playoffs[1]?.team_name}</div>
          <div className="bg-slate-700 p-4 rounded border-l-4 border-gray-400 w-48">Seed 3: {playoffs[2]?.team_name}</div>
          <div className="bg-slate-700 p-4 rounded border-l-4 border-blue-500 w-48">Seed 6: {playoffs[5]?.team_name}</div>
        </div>
      </div>
    </main>
  );
}

