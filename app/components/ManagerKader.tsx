"use client";

import { useState, useEffect, ChangeEvent } from 'react';
import { User, Shield, RefreshCw, AlertCircle } from 'lucide-react';

// Interfaces für die Typsicherheit
interface Spieler {
  name: string;
  manager: string;
  istWaiver: boolean;
  runde2025: string;
  jahreGekeept: number;
}

export default function ManagerKader() {
  const [alleSpieler, setAlleSpieler] = useState<Spieler[]>([]);
  const [managerListe, setManagerListe] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [apiFehler, setApiFehler] = useState<string | null>(null);
  const [ausgewaehlterManager, setAusgewaehlterManager] = useState<string>('');
  const [kaderSpieler, setKaderSpieler] = useState<Spieler[]>([]);

  useEffect(() => {
    async function ladeSleeperDaten() {
      try {
        const res = await fetch('/api/sleeper');
        const daten = await res.json();
        
        if (daten && daten.error) {
          setApiFehler(daten.error);
        } else if (Array.isArray(daten)) {
          setAlleSpieler(daten);
          
          const mSet = new Set<string>();
          daten.forEach((s: Spieler) => {
            if (s.manager && !s.manager.includes("Free Agent")) {
              mSet.add(s.manager);
            }
          });
          setManagerListe(Array.from(mSet).sort());
        }
      } catch (err) {
        setApiFehler("Verbindung zur API fehlgeschlagen.");
      } finally {
        setLoading(false);
      }
    }
    ladeSleeperDaten();
  }, []);

  const handleManagerChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const managerName = e.target.value;
    setAusgewaehlterManager(managerName);

    if (!managerName) {
      setKaderSpieler([]);
      return;
    }

    const filterKader = alleSpieler.filter(s => s.manager === managerName);
    
    // Sortierung der Kader-Ansicht
    filterKader.sort((a, b) => {
      if (a.istWaiver && !b.istWaiver) return 1;
      if (!a.istWaiver && b.istWaiver) return -1;
      return parseInt(a.runde2025, 10) - parseInt(b.runde2025, 10);
    });

    setKaderSpieler(filterKader);
  };

  if (loading) {
    return (
      <div className="max-w-xl w-full mx-auto mt-12 border-t border-slate-800 pt-8 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
        <RefreshCw className="w-3 h-3 animate-spin text-indigo-400" />
        Generiere historische API-Daten aus Saisons 2022-2025...
      </div>
    );
  }

  return (
    <div className="max-w-xl w-full mx-auto mt-12 border-t border-slate-800 pt-8">
      
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold tracking-tight text-slate-200 flex items-center justify-center gap-2">
          <User className="w-5 h-5 text-indigo-400" /> LIVE SLEEPER-KADER
        </h2>
        <p className="text-slate-400 text-xs mt-1">
          Kader und Historie basierend auf den echten Vorjahres-Drafts der Liga
        </p>
      </div>

      {apiFehler && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm p-4 rounded-xl mb-6 flex items-start gap-2">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div><span className="font-bold">API-Fehler:</span> {apiFehler}</div>
        </div>
      )}

      <div className="bg-slate-800 border border-slate-700/80 rounded-2xl p-6 shadow-2xl mb-6">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
          Manager auswählen
        </label>
        <select
          value={ausgewaehlterManager}
          onChange={handleManagerChange}
          className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 px-4 text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
        >
          <option value="">-- Bitte wählen --</option>
          {managerListe.map((mName, i) => (
            <option key={i} value={mName}>{mName}</option>
          ))}
        </select>
      </div>

      {ausgewaehlterManager && (
        <div className="bg-slate-950/40 border border-slate-800 rounded-2xl p-4 shadow-xl">
          <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-wider mb-3 px-2 flex justify-between">
            <span>Kader von {ausgewaehlterManager}</span>
            <span className="text-slate-500 font-mono text-xs">{kaderSpieler.length} Spieler</span>
          </h3>

          <div className="divide-y divide-slate-800/60">
            {kaderSpieler.map((spieler, index) => (
              <div key={index} className="py-3 px-2 flex items-center justify-between hover:bg-slate-800/20 rounded-lg transition-colors">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-slate-500" />
                    <span className="font-medium text-slate-200">{spieler.name}</span>
                  </div>
                  <span className="text-[11px] text-slate-500 ml-6">
                    Historie: {spieler.istWaiver ? 'Waiver-Pickup' : `${spieler.jahreGekeept} ${spieler.jahreGekeept === 1 ? 'Jahr' : 'Jahre'} gekeept`}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-lg text-xs font-black font-mono shadow-md uppercase border ${
                    spieler.istWaiver 
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' 
                      : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  }`}>
                    {spieler.istWaiver ? "Waiver" : `Runde ${spieler.runde2025}`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}