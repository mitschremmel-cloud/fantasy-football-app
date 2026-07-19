'use client';

import { useParams } from 'next/navigation';
import KeeperCalculator from '../../components/KeeperCalculator';
import TradeAnalyzer from '../../components/TradeAnalyzer';
import ManagerKader from '../../components/ManagerKader';
// Wir müssen sicherstellen, dass die Trade-Logik/Komponenten vorhanden sind. 
// Da ich die Datei verloren habe, können wir sie später wiederherstellen.
// Hier ist das Grundgerüst:

export default function RechnerDetail({ params }: { params: { id: string } }) {
  const { id } = useParams<{ id: string }>();
  if (id === 'keeper') {
    return (
      <main className="min-h-screen bg-slate-900 text-slate-100 p-8">
        <div className="mb-6">
          <a href="/rechner" className="text-xs uppercase tracking-widest text-slate-400 hover:text-white transition underline underline-offset-4">
            ← Zurück zum Rechner Hub
          </a>
        </div>
        <h1 className="text-2xl font-bold text-white mb-6">Keeper Calculator</h1>
        <KeeperCalculator />
        <div className="mt-8">
            <ManagerKader />
        </div>
      </main>
    );
  }

  if (id === 'trade') {
    return (
      <main className="min-h-screen bg-slate-900 text-slate-100 p-8">
        <div className="mb-6">
          <a href="/rechner" className="text-xs uppercase tracking-widest text-slate-400 hover:text-white transition underline underline-offset-4">
            ← Zurück zum Rechner Hub
          </a>
        </div>
        <h1 className="text-2xl font-bold text-white mb-6">Trade Rechner</h1>
        <TradeAnalyzer />
        <div className="mt-8">
            <ManagerKader />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 p-8">
      <div className="mb-6">
        <a href="/rechner" className="text-xs uppercase tracking-widest text-slate-400 hover:text-white transition underline underline-offset-4">
          ← Zurück zum Rechner Hub
        </a>
      </div>
      <div className="p-6 text-white">Rechner nicht gefunden.</div>
    </main>
  );
}

