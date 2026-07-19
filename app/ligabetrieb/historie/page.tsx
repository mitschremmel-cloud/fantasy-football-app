"use client";

import { useState, useEffect } from 'react';
import { Shield, Layers, RefreshCw, AlertCircle, Search } from 'lucide-react';

// Typ-Definitionen für die API-Daten
interface DraftDaten {
  "Draft Runde 2022"?: string;
  "Draft Runde 2023"?: string;
  "Draft Runde 2024"?: string;
  "Draft Runde 2025"?: string;
}

// Damit der Abgleich mit den Draft-IDs der Historie funktioniert,
// sollten diese IDs hier als Referenz für die Logik hinterlegt sein:
export const DRAFT_IDS = {
  "2022": "862027516456595457",
  "2023": "988096670053306369",
  "2024": "1124825210735206401",
  "2025": "1251196293699616768"
};

interface Spieler {
  name: string;
  manager: string;
  jahreGekeept: number;
  dbEintrag?: DraftDaten;
}

export default function HistoriePage() {
  const [alleSpieler, setAlleSpieler] = useState<Spieler[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [apiFehler, setApiFehler] = useState<string | null>(null);
  const [suchBegriff, setSuchBegriff] = useState<string>('');

  useEffect(() => {
    async function ladeHistorischeApiDaten() {
      try {
        const res = await fetch('/api/sleeper');
        const daten = await res.json();
        
        if (daten && daten.error) {
          setApiFehler(daten.error);
          return;
        }

        if (Array.isArray(daten)) {
          const sortierteDaten = [...daten].sort((a, b) => a.name.localeCompare(b.name));
          setAlleSpieler(sortierteDaten);
        }
      } catch (err) {
        setApiFehler("Die historischen Daten konnten nicht geladen werden.");
      } finally {
        setLoading(false);
      }
    }
    ladeHistorischeApiDaten();
  }, []);

  const gefilterteSpieler = alleSpieler.filter(s => 
    s.name.toLowerCase().includes(suchBegriff.toLowerCase()) ||
    s.manager.toLowerCase().includes(suchBegriff.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center gap-3">
        <RefreshCw className="w-8 h-8 animate-spin text-indigo-400" />
        <span className="text-sm font-medium text-slate-400">Generiere allumfassende Draft-Historie...</span>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 p-6 md:p-12">
      <div className="mb-6 max-w-4xl mx-auto">
        <a href="/ligabetrieb" className="text-xs uppercase tracking-widest text-slate-400 hover:text-white transition underline underline-offset-4">
          ← Zurück zum Ligabetrieb
        </a>
      </div>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400 uppercase">
            📋 LIGA-DATENBANK HISTORIE
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Jeder Spieler, der in den letzten 4 Jahren (2022-2025) gedraftet wurde
          </p>
        </div>

        {apiFehler && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm p-4 rounded-xl mb-6 flex items-start gap-2">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div><span className="font-bold">Fehler:</span> {apiFehler}</div>
          </div>
        )}

        <div className="relative max-w-md mx-auto mb-8">
          <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Nach Spieler oder aktuellem Manager suchen..."
            value={suchBegriff}
            onChange={(e) => setSuchBegriff(e.target.value)}
            className="w-full bg-slate-800/80 border border-slate-700 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        <div className="bg-slate-950/40 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm text-slate-300">
              <thead className="bg-slate-800/60 border-b border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="py-4 px-4">Spieler</th>
                  <th className="py-4 px-4">Aktueller Aufenthalt</th>
                  <th className="py-4 px-4 text-center font-mono">2022</th>
                  <th className="py-4 px-4 text-center font-mono">2023</th>
                  <th className="py-4 px-4 text-center font-mono">2024</th>
                  <th className="py-4 px-4 text-center font-mono">2025</th>
                  <th className="py-4 px-4 text-center">Keeper-Jahre</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {gefilterteSpieler.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500 italic">
                      Keine Spieler gefunden.
                    </td>
                  </tr>
                ) : (
                  gefilterteSpieler.map((spieler, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/20 transition-colors group">
                      <td className="py-3.5 px-4 font-semibold text-slate-200 flex items-center gap-2">
                        <Shield className="w-4 h-4 text-slate-600 group-hover:text-indigo-400 transition-colors" />
                        {spieler.name}
                      </td>
                      <td className="py-3.5 px-4 text-xs font-medium text-slate-400">
                        <span className={spieler.manager.includes("Free Agent") ? "text-slate-600 italic" : "text-slate-300"}>
                          {spieler.manager}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono text-xs text-slate-500">
                        {spieler.dbEintrag?.["Draft Runde 2022"] === "16" ? "Waiver" : `R ${spieler.dbEintrag?.["Draft Runde 2022"]}`}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono text-xs text-slate-500">
                        {spieler.dbEintrag?.["Draft Runde 2023"] === "16" ? "Waiver" : `R ${spieler.dbEintrag?.["Draft Runde 2023"]}`}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono text-xs text-slate-500">
                        {spieler.dbEintrag?.["Draft Runde 2024"] === "16" ? "Waiver" : `R ${spieler.dbEintrag?.["Draft Runde 2024"]}`}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono text-xs font-semibold text-indigo-300">
                        {spieler.dbEintrag?.["Draft Runde 2025"] === "16" ? "Waiver" : `R ${spieler.dbEintrag?.["Draft Runde 2025"]}`}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center gap-1 bg-slate-800/80 text-slate-400 px-2 py-0.5 rounded border border-slate-700/50 text-xs font-mono">
                          <Layers className="w-3 h-3 text-slate-500" /> {spieler.jahreGekeept}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}