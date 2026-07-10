'use client';

import { useParams } from 'next/navigation';
import KeeperCalculator from '../../components/KeeperCalculator';
import TradeAnalyzer from '../../components/TradeAnalyzer';
import ManagerKader from '../../components/ManagerKader';
// Wir müssen sicherstellen, dass die Trade-Logik/Komponenten vorhanden sind. 
// Da ich die Datei verloren habe, können wir sie später wiederherstellen.
// Hier ist das Grundgerüst:

export default function RechnerDetail() {
  const params = useParams();
  const id = params.id as string;

  if (id === 'keeper') {
    return (
      <main className="p-6">
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
      <main className="p-6">
        <h1 className="text-2xl font-bold text-white mb-6">Trade Rechner</h1>
        <TradeAnalyzer />
        <div className="mt-8">
            <ManagerKader />
        </div>
      </main>
    );
  }

  return <div className="p-6 text-white">Rechner nicht gefunden.</div>;
}
