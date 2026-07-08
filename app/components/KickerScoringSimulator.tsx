'use client';
import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { KickerPerformanceMetrics } from '@/app/utils/nflverse/statsAnalysisKicker';
import { KickerAnalysisCharts } from './KickerAnalysisCharts';

const statsCache = new Map<string, any>();

export default function KickerScoringSimulator() {
  const [year, setYear] = useState(2025);
  const [weights, setWeights] = useState<Record<string, number | string>>({
    pat: 1, patMiss: 0,
    fg0_19: 3, fg20_29: 3, fg30_39: 3, fg40_49: 4, fg50_59: 5, fg60plus: 6,
    miss0_19: 0, miss20_29: 0, miss30_39: 0, miss40_49: 0, miss50_59: 0, miss60plus: 0,
    fg_inc: 0
  });
  const [results, setResults] = useState<any[]>([]);
  const [stats, setStats] = useState<KickerPerformanceMetrics[]>([]); 
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' }>({ key: 'totalPoints', direction: 'desc' });

          const labelMapping: Record<string, string> = {
    pat: "PAT",
    fg0_19: "FG 0-19", fg20_29: "FG 20-29", fg30_39: "FG 30-39", fg40_49: "FG 40-49", fg50_59: "FG 50-59", fg60plus: "FG 60+",
    patMiss: "PAT Miss",
    miss0_19: "Miss 0-19", miss20_29: "Miss 20-29", miss30_39: "Miss 30-39", miss40_49: "Miss 40-49", miss50_59: "Miss 50-59", miss60plus: "Miss 60+",
    fg_inc: "Inc. Bonus"
  };

  const fetchData = async () => {
    const sanitizedWeights: any = {};
    for (const key in weights) {
      const val = weights[key];
      sanitizedWeights[key] = (val === '' || val === null || val === undefined || isNaN(Number(val)))
        ? 0
        : Number(val);
    }
    const res = await fetch('/api/nflverse/kicker', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ year: year, weights: sanitizedWeights }),
    });
    const data = await res.json();
    setResults(data);

    // Übergib hier die Ergebnisse der Simulation direkt an den Chart
    setStats(data.map((p: any) => ({
      name: p.name,
      avgStandard: p.standardPointsPerGame,
      avgSimulated: p.pointsPerGame,
      cvStandard: p.cvStandard,
      cvSimulated: p.cvSimulated
    })));
  };

  useEffect(() => { fetchData(); }, [year, weights]);

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  const sortedData = [...results].sort((a, b) => {
    const aVal = a[sortConfig.key] ?? 0;
    const bVal = b[sortConfig.key] ?? 0;
    return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
  });

  const requestSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    const val = e.target.value;
    setWeights(prev => ({ ...prev, [key]: val === '' ? '' : parseFloat(val) }));
  };

  return (
    <div className="bg-slate-800 p-6 rounded-lg text-white">
      <h2 className="text-xl font-bold mb-4">Kicker Scoring Simulator</h2>
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
        <div className="flex flex-col justify-end">
          <label className="block text-xs text-slate-400 mb-1">Saison</label>
          <select value={year} onChange={(e) => setYear(Number(e.target.value))} className="w-full bg-slate-700 p-2 rounded border border-slate-600">
            {[2025, 2024, 2023, 2022].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        {Object.entries(weights).map(([key, val]) => (
          <div key={key}>
            <label className="block text-xs text-slate-400 mb-1">
              {labelMapping[key] || key}
            </label>
            <input
              type="number"
              step="any"
              value={val === 0 ? '' : val}
              placeholder="0"
              onChange={(e) => handleWeightChange(e, key)}
              className="w-full bg-slate-700 p-2 rounded border border-slate-600"
            />
          </div>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
        <thead>
          <tr className="text-slate-400 border-b border-slate-700 cursor-pointer">
            <th className="p-2" onClick={() => requestSort('name')}>Spieler</th>
            <th className="p-2" onClick={() => requestSort('patMade')}>PAT</th>
            <th className="p-2" onClick={() => requestSort('patMissed')}>PAT Miss</th>
            <th className="p-2" onClick={() => requestSort('fgMade')}>FG Made</th>
            <th className="p-2" onClick={() => requestSort('fgMissed')}>FG Missed</th>
            <th className="p-2" onClick={() => requestSort('standardTotalPoints')}>Total Pts (Std)</th>
            <th className="p-2" onClick={() => requestSort('standardPointsPerGame')}>Pts/G (Std)</th>
            <th className="p-2" onClick={() => requestSort('pointsPerGame')}>Pts/G (Sim)</th>
          </tr>
        </thead>
        <tbody>
          {sortedData.slice(0, 32).map((p, i) => (
            <tr key={i} className="border-b border-slate-700 hover:bg-slate-700/30">
              <td className="p-2">{p.name}</td>
              <td className="p-2">{p.patMade}</td>
              <td className="p-2">{p.patMissed}</td>
              <td className="p-2">{p.fgMade}</td>
              <td className="p-2">{p.fgMissed}</td>
              <td className="p-2 text-slate-400">{(p.standardTotalPoints ?? 0).toFixed(1)}</td>
              <td className="p-2 text-slate-400">{(p.standardPointsPerGame ?? 0).toFixed(1)}</td>
              <td className="p-2 font-bold text-indigo-400">{(p.pointsPerGame ?? 0).toFixed(1)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>

      {/* 1. Ursprünglicher LineChart kommt jetzt ZUERST */}
      <div className="h-80 w-full mt-10 bg-slate-900 p-4 rounded">
        <h3 className="text-white mb-4">Punkte pro Spiel Vergleich (Top 32)</h3>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={results.slice(0, 32).map((p, i) => ({
            rank: i + 1,
            standard: p.standardPointsPerGame,
            simulated: p.pointsPerGame
          }))}>
            <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
            <XAxis dataKey="rank" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" domain={[0, 'auto']} />
            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none' }} />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <Line type="monotone" dataKey="standard" stroke="#94a3b8" name="Standard" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="simulated" stroke="#6366f1" name="Simuliert" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 2. Neue statistische Analyse Charts kommen DANACH */}
      {stats.length > 0 && (
        <div className="mt-10">
          <h3 className="text-xl font-bold mb-4">Statistische Analyse (Zufälligkeit & Trends)</h3>
          <KickerAnalysisCharts data={stats} />
        </div>
      )}
    </div>
  );
}

