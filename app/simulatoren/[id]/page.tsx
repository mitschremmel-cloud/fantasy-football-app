'use client';

import { useParams } from 'next/navigation';
import { KickerAnalysisCharts } from '../../components/KickerAnalysisCharts';
import KickerScoringSimulator from '../../components/KickerScoringSimulator';
import QBScoringSimulator from '../../components/QBScoringSimulator';

export default function SimulatorDetail() {
  const params = useParams();
  const id = params.id as string;

  return (
    <main className="p-6">
      {id === 'kicker-scoring' && (
        <>
          <h1 className="text-2xl font-bold text-white mb-6">Kicker Scoring Simulator</h1>
          <KickerScoringSimulator />
        </>
      )}
      {id === 'scoring' && (
        <>
          <h1 className="text-2xl font-bold text-white mb-6">QB Scoring Simulator</h1>
          <QBScoringSimulator />
        </>
      )}
      {!['kicker-scoring', 'scoring'].includes(id) && (
        <div className="text-white">Simulator nicht gefunden.</div>
      )}
    </main>
  );
}

