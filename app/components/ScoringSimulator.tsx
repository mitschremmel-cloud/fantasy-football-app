'use client';
import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function ScoringSimulator() {
  const [year, setYear] = useState(2025);
  // WICHTIG: comp und incmp hier ergänzen!
  const [weights, setWeights] = useState({
    passTd: 4, passYd: 0.04, int: 2, rushYd: 0.1, rushTd: 6, fumble: 1, fumbleLost: 1, comp: 0, incmp: 0
  });
  const [results, setResults] = useState<any[]>([]);
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' }>({ key: 'simulated', direction: 'desc' });

  const fetchData = async () => {
    const res = await fetch('/api/nflverse/quarterback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }, // WICHTIG: Header für JSON hinzufügen
      body: JSON.stringify({ year, weights }),
    });
    const data = await res.json();
    setResults(data);
  };

  useEffect(() => { fetchData(); }, [year, weights]);

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
    setWeights(prev => ({ ...prev, [key]: parseFloat(e.target.value) || 0 }));
  };

  return (
    <div className="bg-slate-800 p-6 rounded-lg text-white">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div>
          <label className="block text-xs text-slate-400 mb-1">Saison</label>
          <select 
            value={year} 
            onChange={(e) => setYear(Number(e.target.value))}
            className="w-full bg-slate-700 p-2 rounded border border-slate-600"
          >
            {[2025, 2024, 2023, 2022].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        {Object.entries(weights).map(([key, val]) => (
          <div key={key}>
            <label className="block text-xs text-slate-400 mb-1 capitalize">{key}</label>
            <input 
              type="number" 
              step="0.01"
              value={val}
              onChange={(e) => handleWeightChange(e, key)}
              className="w-full bg-slate-700 p-2 rounded border border-slate-600"
            />
          </div>
        ))}
      </div>

      <table className="w-full text-left text-sm">
        <thead>
          <tr className="text-slate-400 border-b border-slate-700 cursor-pointer">
            <th className="p-2" onClick={() => requestSort('name')}>Spieler</th>
            <th className="p-2" onClick={() => requestSort('passYd')}>Pass Yd</th>
            <th className="p-2" onClick={() => requestSort('compPct')}>Comp %</th>
            <th className="p-2" onClick={() => requestSort('passTd')}>Pass TD</th>
            <th className="p-2" onClick={() => requestSort('ints')}>INT</th>
            <th className="p-2" onClick={() => requestSort('rushYd')}>Rush Yd</th>
            <th className="p-2" onClick={() => requestSort('rushTd')}>Rush TD</th>
            <th className="p-2" onClick={() => requestSort('total')}>Total</th>
            <th className="p-2" onClick={() => requestSort('standard')}>Pts/G Standard</th>
            <th className="p-2" onClick={() => requestSort('simulated')}>Pts/G Simulated</th>
          </tr>
        </thead>
        <tbody>
          {sortedData.map((p) => (
            <tr key={p.name} className="border-b border-slate-700 hover:bg-slate-700/30">
              <td className="p-2 font-medium">{p.name}</td>
              <td className="p-2">{(p.passYd ?? 0).toFixed(0)}</td>
              <td className="p-2">{(p.compPct ?? 0).toFixed(1)}%</td>
              <td className="p-2">{p.passTd ?? 0}</td>
              <td className="p-2">{p.ints ?? 0}</td>
              <td className="p-2">{(p.rushYd ?? 0).toFixed(0)}</td>
              <td className="p-2">{p.rushTd ?? 0}</td>
              <td className="p-2">{(p.total ?? 0).toFixed(1)}</td>
              <td className="p-2">{(p.standard ?? 0).toFixed(1)}</td>
              <td className="p-2 font-bold text-indigo-400">{(p.simulated ?? 0).toFixed(1)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="h-80 w-full mt-10 bg-slate-900 p-4 rounded">
  <h3 className="text-white mb-4">Punkte pro Spiel Vergleich (Top 32)</h3>
  <ResponsiveContainer width="100%" height="100%">
    <LineChart data={sortedData.map((p, i) => ({ rank: i + 1, standard: p.standard, simulated: p.simulated }))}>
      <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
      <XAxis 
        dataKey="rank" 
        stroke="#94a3b8" 
        label={{ value: 'Rank', position: 'insideBottom', offset: -5, fill: '#94a3b8' }} 
      />
      <YAxis 
        stroke="#94a3b8" 
        domain={[10, 'auto']} // Startet bei 10, geht automatisch bis zum Maximum
        label={{ value: 'Pts/G', angle: -90, position: 'insideLeft', fill: '#94a3b8' }} 
      />
      <Tooltip 
        contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '4px' }} 
        itemStyle={{ color: '#e2e8f0' }}
      />
      <Legend />
      <Line 
        type="monotone" 
        dataKey="standard" 
        stroke="#94a3b8" 
        name="Standard" 
        dot={{ r: 3 }} 
      />
      <Line 
        type="monotone" 
        dataKey="simulated" 
        stroke="#6366f1" 
        name="Simuliert" 
        strokeWidth={2} 
        dot={{ r: 4 }} 
      />
    </LineChart>
  </ResponsiveContainer>
</div>
    </div>
  );
}