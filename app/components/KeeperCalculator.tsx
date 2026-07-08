// app/components/KeeperCalculator.tsx
"use client";

import { useState, useEffect } from 'react';
import { ChevronDown, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';
import { berechneKeeperKosten } from '../utils/KeeperCalculator';

interface Spieler {
  name: string;
  dbEintrag: any;
}

interface Ergebnis {
  erlaubt: boolean;
  feedbackText?: string;
  finaleRunde?: number;
  grund?: string;
}

function normalisiereName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+(iii|ii|jr|sr|iv|v)$/, "")
    .replace(/[^a-z0-9]/g, "");
}

export default function KeeperCalculator() {
  const [suchBegriff, setSuchBegriff] = useState<string>('');
  const [alleSpieler, setAlleSpieler] = useState<Spieler[]>([]);
  const [fpRankings, setFpRankings] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  const [ausgewaehlterSpieler, setAusgewaehlterSpieler] = useState<Spieler | null>(null);
  const [berechnungsErgebnis, setBerechnungsErgebnis] = useState<Ergebnis | null>(null);
  const [zeigeVorschlaege, setZeigeVorschlaege] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function ladeZentralDaten() {
      try {
        // Sicherer Fetch für Rankings
        const resFp = await fetch('/api/rankings');
        if (!resFp.ok) throw new Error("Fehler beim Laden der Rankings.");

        const fpData = await resFp.json();
        if (fpData.error) throw new Error(fpData.error);
        setFpRankings(Array.isArray(fpData) ? fpData : []);

        // Sicherer Fetch für Sleeper
        const resSleeper = await fetch('/api/sleeper');
        if (!resSleeper.ok) throw new Error("Fehler beim Laden der Liga-Daten.");

        const ligaKader = await resSleeper.json();
        if (Array.isArray(ligaKader)) {
          const formatierteListe = ligaKader.map((spieler: any) => ({
            name: spieler.name,
            dbEintrag: spieler.dbEintrag
          }));
          setAlleSpieler(formatierteListe);
        }
      } catch (err) {
        console.error("Fehler beim Laden der Rechner-Daten:", err);
        setError(err instanceof Error ? err.message : "Ein unbekannter Fehler ist aufgetreten.");
      } finally {
        setLoading(false);
      }
    }
    ladeZentralDaten();
  }, []);

  const gefilterteSpieler = suchBegriff.trim().length < 2 
    ? [] 
    : alleSpieler.filter(s => 
        normalisiereName(s.name).includes(normalisiereName(suchBegriff))
      ).slice(0, 5);

  const waehleSpielerAus = (spieler: Spieler) => {
    setAusgewaehlterSpieler(spieler);
    setSuchBegriff(spieler.name);
    setZeigeVorschlaege(false);

    const ergebnis = berechneKeeperKosten(spieler.name, spieler.dbEintrag, fpRankings);
    setBerechnungsErgebnis(ergebnis);
  };

  if (loading) {
    return (
      <div className="bg-slate-800 border border-slate-700/80 rounded-2xl p-6 shadow-2xl text-center text-xs text-slate-400 flex items-center justify-center gap-2">
        <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />
        Initialisiere Keeper-Kosten Rechner...
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-rose-900/20 border border-rose-500/50 rounded-2xl p-6 shadow-2xl text-center text-xs text-rose-300">
        <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-rose-400" />
        <p className="font-bold">Daten konnten nicht geladen werden</p>
        <p className="mt-1 opacity-80">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 text-xs bg-rose-500/20 hover:bg-rose-500/30 px-3 py-1 rounded-full transition-colors"
        >
          Neu laden
              </button>
          </div>
  );
}

  return (
    <div className="bg-slate-800 border border-slate-700/80 rounded-2xl p-6 shadow-2xl relative">
      <div className="relative mb-6">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
          Spieler-Name eingeben
        </label>
        <input
          type="text"
          placeholder="z.B. Christian McCaffrey..."
          value={suchBegriff}
          onChange={(e) => {
            setSuchBegriff(e.target.value);
            setZeigeVorschlaege(true);
            if (!e.target.value) {
              setAusgewaehlterSpieler(null);
              setBerechnungsErgebnis(null);
            }
          }}
          onFocus={() => setZeigeVorschlaege(true)}
          className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 px-4 text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
        />

        {zeigeVorschlaege && gefilterteSpieler.length > 0 && (
          <div className="absolute z-50 left-0 right-0 mt-1 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto divide-y divide-slate-800">
            {gefilterteSpieler.map((spieler, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => waehleSpielerAus(spieler)}
                className="w-full text-left py-3 px-4 text-sm text-slate-300 hover:bg-slate-800/60 hover:text-white transition-colors flex items-center justify-between"
              >
                <span>{spieler.name}</span>
                <ChevronDown className="w-3 h-3 text-slate-500 -rotate-90" />
              </button>
            ))}
          </div>
        )}
      </div>

      {berechnungsErgebnis && (
        <div className="mt-6 pt-6 border-t border-slate-700/50">
          {berechnungsErgebnis.erlaubt ? (
            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm mb-2">
                <CheckCircle2 className="w-4 h-4" /> KEEPER ERLAUBT
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {berechnungsErgebnis.feedbackText}
              </p>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-xs text-slate-400">Keeper-Kosten:</span>
                <span className="text-xl font-black text-emerald-400 font-mono">
                  {berechnungsErgebnis.finaleRunde === 16 ? "WAIVER" : `RUNDE ${berechnungsErgebnis.finaleRunde}`}
                </span>
              </div>
            </div>
          ) : (
            <div className="bg-rose-500/5 border border-rose-500/20 rounded-xl p-4">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-sm mb-2">
                <AlertTriangle className="w-4 h-4" /> KEEPER NICHT ERLAUBT
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {berechnungsErgebnis.grund}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
