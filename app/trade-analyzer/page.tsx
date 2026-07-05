'use client';

import { useState, useEffect } from 'react';
import { calculateDraftPickValue, calculatePlayerValue } from '../utils/tradeLogic';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

type TradeItem = { id: string; name: string; value: number };

export default function TradeAnalyzerPage() {

    const getCurrentMatchupWeek = (): number => {
    const seasonStart = new Date('2026-09-10T00:00:00');
    const now = new Date();
    if (now < seasonStart) return 1;
    const diffDays = Math.floor((now.getTime() - seasonStart.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(1, Math.min(16, Math.floor(diffDays / 7) + 1));
  };
  const [currentWeek] = useState(getCurrentMatchupWeek());  
  const [activeTab, setActiveTab] = useState<'pick' | 'player'>('pick');
  const [sideA, setSideA] = useState<TradeItem[]>([]);
  const [sideB, setSideB] = useState<TradeItem[]>([]);

  const [round, setRound] = useState(1);
  const [pickYear, setPickYear] = useState(2027);

  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [allPlayers, setAllPlayers] = useState<any[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<any | null>(null);

  useEffect(() => {
    fetch('/api/rankings?type=ros')
      .then(res => res.json())
      .then(data => setAllPlayers(data))
      .catch(err => console.error("Fehler beim Laden:", err));
  }, []);

  const addToTrade = (side: 'A' | 'B', name: string, value: number) => {
    const newItem = { id: Date.now().toString(), name, value };
    if (side === 'A') setSideA([...sideA, newItem]);
    else setSideB([...sideB, newItem]);
  };

  const resetTrade = () => {
    setSideA([]);
    setSideB([]);
  };

  // Einmalige Definition der Hilfsfunktion
  const getRoundFromRank = (rank: number) => Math.ceil(rank / 12); 

  const plotData = Array.from({ length: 150 }, (_, i) => {
    const rank = i + 1;
    const round = getRoundFromRank(rank);
    return {
      rank: rank,
      pickValue: calculateDraftPickValue(round, 2027),
      playerValue: calculatePlayerValue(rank, currentWeek)
    };
  });

  const calcSum = (items: TradeItem[]) => items.reduce((acc, i) => acc + i.value, 0);

  return (
    <div className="max-w-4xl w-full p-6 text-slate-100">
      <h1 className="text-3xl font-bold mb-8 text-center">Trade Analyzer</h1>

      {/* Trade Container */}
     <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
  {[ { title: "Spieler 1 bekommt", items: sideA, side: 'A' }, { title: "Spieler 2 bekommt", items: sideB, side: 'B' } ].map(s => (
    <div key={s.side} className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700 flex flex-col min-h-[300px]">
      <h2 className="text-lg font-bold mb-4 text-indigo-400">{s.title}</h2>
      
      {/* Dieser Container wächst nun und nimmt den verfügbaren Platz ein */}
      <div className="flex-grow">
        {s.items.length === 0 ? (
          <div className="text-slate-600 italic text-sm text-center mt-10">Keine Spieler/Picks</div>
        ) : (
          s.items.map(i => (
            <div key={i.id} className="flex justify-between py-1 border-b border-slate-700/50">
              <span>{i.name}</span>
              <span className="font-bold">{i.value}</span>
            </div>
          ))
        )}
      </div>

      {/* Die Summe bleibt jetzt immer am unteren Rand der Karte */}
      <div className="text-xl font-black mt-6 text-center border-t border-slate-700 pt-4">
        Summe: {calcSum(s.items)}
      </div>
    </div>
        ))}
      </div>
      
      <div className="text-center mb-8">
        <button onClick={resetTrade} className="text-slate-400 hover:text-red-400 text-sm underline">Trade zurücksetzen</button>
      </div>

      {/* Eingabebereich */}
      <div className="bg-slate-800/20 p-6 rounded-2xl border border-slate-700">
        <div className="flex gap-2 mb-6">
          <button onClick={() => setActiveTab('pick')} className={`px-4 py-2 rounded-xl flex-1 ${activeTab === 'pick' ? 'bg-indigo-600' : 'bg-slate-800'}`}>Pick hinzufügen</button>
          <button onClick={() => setActiveTab('player')} className={`px-4 py-2 rounded-xl flex-1 ${activeTab === 'player' ? 'bg-indigo-600' : 'bg-slate-800'}`}>Spieler hinzufügen</button>
        </div>

        {activeTab === 'pick' ? (
          <div className="flex gap-4">
            <div className="flex flex-1 gap-4">
              <input type="number" placeholder="Runde" value={round} onChange={e => setRound(Number(e.target.value))} className="bg-slate-900 p-3 rounded-xl border border-slate-700 w-full" />
              <input type="number" placeholder="Jahr" value={pickYear} onChange={e => setPickYear(Number(e.target.value))} className="bg-slate-900 p-3 rounded-xl border border-slate-700 w-full" />
            </div>
            <div className="flex gap-2 shrink-0">
              <button onClick={() => addToTrade('A', `Pick ${round}.${pickYear}`, calculateDraftPickValue(round, pickYear))} className="bg-indigo-600 px-6 py-3 rounded-xl font-bold">Zu A</button>
              <button onClick={() => addToTrade('B', `Pick ${round}.${pickYear}`, calculateDraftPickValue(round, pickYear))} className="bg-amber-600 px-6 py-3 rounded-xl font-bold">Zu B</button>
            </div>
          </div>
        ) : (
          <div className="relative">
            <input type="text" placeholder="Spieler suchen..." value={searchTerm} onChange={e => {
              setSearchTerm(e.target.value);
              const filtered = allPlayers.filter(p => p.searchName.includes(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ""))).slice(0, 5);
              setSuggestions(filtered);
            }} className="w-full bg-slate-900 p-4 rounded-xl border border-slate-700" />
            
            {suggestions.length > 0 && (
              <div className="absolute z-50 w-full bg-slate-900 mt-2 rounded-xl border border-slate-700 shadow-2xl">
                {suggestions.map(p => (
                  <div key={p.rank} className="p-3 hover:bg-indigo-600 cursor-pointer" onClick={() => { setSelectedPlayer(p); setSearchTerm(p.name); setSuggestions([]); }}>
                    {p.name}
                  </div>
                ))}
              </div>
            )}
            
            {selectedPlayer && (
              <div className="mt-4 flex gap-2">
                <button onClick={() => addToTrade('A', selectedPlayer.name, calculatePlayerValue(selectedPlayer.rank, currentWeek))} className="bg-indigo-600 flex-1 py-3 rounded-xl">Zu A</button>
                <button onClick={() => addToTrade('B', selectedPlayer.name, calculatePlayerValue(selectedPlayer.rank, currentWeek))} className="bg-amber-600 flex-1 py-3 rounded-xl">Zu B</button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Chart Bereich */}
      <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700 mt-8">
        <h3 className="text-xl font-bold mb-4 text-indigo-400">Werteverlauf (Rang 1-150)</h3>
        <p className="text-slate-400 text-sm mb-6">
    Vergleich von Draft Pick Werten aus dem Jahr 2027 mit Spieler Werten aus der aktuellen Woche ({currentWeek}).
    </p>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={plotData} margin={{ bottom: 20 }}>
  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
  <XAxis 
    dataKey="rank" 
    stroke="#94a3b8" 
    label={{ value: 'Rang / Position', position: 'insideBottom', offset: -10, fill: '#94a3b8' }} 
  />
  <YAxis 
    stroke="#94a3b8" 
    label={{ value: 'Wert', angle: -90, position: 'insideLeft', fill: '#94a3b8' }} 
  />
  <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155' }} />
  
  {/* Hier wurde die Legende angepasst */}
  <Legend 
    verticalAlign="bottom" 
    height={36} 
    wrapperStyle={{ paddingTop: '20px' }} 
                 />
  
                <Line type="monotone" dataKey="pickValue" name="Pick Wert" stroke="#6366f1" strokeWidth={2} dot={false} />
             <Line type="monotone" dataKey="playerValue" name="Spieler Wert" stroke="#f59e0b" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}