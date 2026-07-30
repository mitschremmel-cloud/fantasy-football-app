'use client';
import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TEAnalysisCharts } from './TEAnalysisCharts';

export default function TEScoringSimulator() {
  const [year, setYear] = useState(2025);
  const [weights, setWeights] = useState<Record<string, number | string>>({
    rushing_yards: 0.1,
    rushing_tds: 6,
    rushing_fumbles: -1,
    rushing_fumbles_lost: -1,
    rushing_2pt_conversions: 2,
    receiving_yards: 0.1,
    receiving_tds: 6,
    receptions: 0.5,
  });
  const [results, setResults] = useState<any[]>([]);
  const [historicalStats, setHistoricalStats] = useState<any[]>([]);
  const [loadingHistorical, setLoadingHistorical] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' }>({ key: 'pointsPerGame', direction: 'desc' });

          const labelMapping: Record<string, string> = {
    rushing_yards: "Rush Yds",
    rushing_tds: "Rush TD",
    rushing_fumbles: "Fumble",
    rushing_fumbles_lost: "Fumble Lost",
    rushing_2pt_conversions: "2PT Conv",
    receiving_yards: "Rec Yds",
    receiving_tds: "Rec TD",
    receptions: "Rec"
  };

  const fetchData = async () => {
    const sanitizedWeights: any = {};
    for (const key in weights) {
      const val = weights[key];
      sanitizedWeights[key] = (val === '' || val === null || val === undefined || isNaN(Number(val)))
        ? 0
        : Number(val);
    }
    const res = await fetch('/api/nflverse/te', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ year: year, weights: sanitizedWeights }),
    });
    const data = await res.json();
    setResults(data);
  };

  const loadHistoricalData = async () => {
    setLoadingHistorical(true);
    const sanitizedWeights: any = {};
    for (const key in weights) {
      const val = weights[key];
      sanitizedWeights[key] = (val === '' || val === null || val === undefined || isNaN(Number(val))) ? 0 : Number(val);
    }
    const res = await fetch('/api/nflverse/te', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ year: [2022, 2023, 2024, 2025], weights: sanitizedWeights }),
    });
    const data = await res.json();
    setHistoricalStats(data);
    setLoadingHistorical(false);
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
      <h2 className="text-xl font-bold mb-4">TE Scoring Simulator</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
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
            <th className="p-2" onClick={() => requestSort('rushing_yards')}>Rush Yds</th>
            <th className="p-2" onClick={() => requestSort('rushing_tds')}>Rush TD</th>
            <th className="p-2" onClick={() => requestSort('receptions')}>Rec</th>
            <th className="p-2" onClick={() => requestSort('receiving_yards')}>Rec Yds</th>
            <th className="p-2" onClick={() => requestSort('receiving_tds')}>Rec TD</th>
            <th className="p-2" onClick={() => requestSort('totalPoints')}>Total Pts</th>
            <th className="p-2" onClick={() => requestSort('standardPointsPerGame')}>Pts/G (Std)</th>
            <th className="p-2" onClick={() => requestSort('pointsPerGame')}>Pts/G (Sim)</th>
          </tr>
        </thead>
        <tbody>
          {sortedData.slice(0, 32).map((p, i) => (
            <tr key={i} className="border-b border-slate-700 hover:bg-slate-700/30">
              <td className="p-2">{p.name}</td>
              <td className="p-2">{p.rushing_yards}</td>
              <td className="p-2">{p.rushing_tds}</td>
              <td className="p-2">{p.receptions}</td>
              <td className="p-2">{p.receiving_yards}</td>
              <td className="p-2">{p.receiving_tds}</td>
              <td className="p-2 font-bold text-white">{(p.totalPoints ?? 0).toFixed(1)}</td>
              <td className="p-2 text-slate-400">{(p.standardPointsPerGame ?? 0).toFixed(1)}</td>
              <td className="p-2 font-bold text-indigo-400">{(p.pointsPerGame ?? 0).toFixed(1)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>

      <div className="h-[400px] w-full mt-10 bg-slate-900 p-4 rounded">
        <h3 className="text-white mb-4">Punkte pro Spiel Vergleich (Top 32)</h3>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={sortedData.slice(0, 32).map((p, i) => ({
            rank: i + 1,
            name: p.name,
            standard: p.standardPointsPerGame,
            simulated: p.pointsPerGame
          }))}>
            <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis dataKey="rank" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#94a3b8" domain={['auto', 'auto']} fontSize={12} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1e293b', border: 'none' }}
              formatter={(value: any) => (typeof value === 'number' ? value.toFixed(1) : value)}
              labelFormatter={(label) => label}
            />
            <Legend verticalAlign="top" align="right" wrapperStyle={{ top: 0, right: 0 }} />
            <Line type="monotone" dataKey="standard" stroke="#94a3b8" name="Standard" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="simulated" stroke="#6366f1" name="Simuliert" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-10">
        <TEAnalysisCharts
          data={results}
          historicalData={historicalStats}
          onLoadHistorical={loadHistoricalData}
          loadingHistorical={loadingHistorical}
        />
        </div>
        </div>
  );
}

