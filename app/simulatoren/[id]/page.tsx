'use client';

import { useParams } from 'next/navigation';
import { KickerAnalysisCharts } from '../../components/KickerAnalysisCharts';
import KickerScoringSimulator from '../../components/KickerScoringSimulator';
import QBScoringSimulator from '../../components/QBScoringSimulator';
import RBScoringSimulator from '../../components/RBScoringSimulator';
import WRScoringSimulator from '../../components/WRScoringSimulator';
import TEScoringSimulator from '../../components/TEScoringSimulator';
import FlexScoringSimulator from '../../components/FlexScoringSimulator';


export default function SimulatorDetail() {
  const params = useParams();
  const id = params.id as string;

  return (
    <main className="p-6">
      <div className="mb-6">
        <a href="/simulatoren" className="text-xs uppercase tracking-widest text-slate-400 hover:text-white transition underline underline-offset-4">
          ← Zurück zu den Simulatoren
        </a>
      </div>
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
      {id === 'rb-scoring' && (
        <>
          <h1 className="text-2xl font-bold text-white mb-6">RB Scoring Simulator</h1>
          <RBScoringSimulator />
        </>
      )}

      {id === 'wr-scoring' && (
        <>
          <h1 className="text-2xl font-bold text-white mb-6">WR Scoring Simulator</h1>
          <WRScoringSimulator />
        </>
      )}
      {id === 'te-scoring' && (
        <>
          <h1 className="text-2xl font-bold text-white mb-6">TE Scoring Simulator</h1>
          <TEScoringSimulator />
        </>
      )}
      {id === 'flex-scoring' && (
        <>
          <h1 className="text-2xl font-bold text-white mb-6">Flex Scoring Simulator</h1>
          <FlexScoringSimulator />
        </>
      )}
      {!['kicker-scoring', 'scoring', 'rb-scoring', 'wr-scoring', 'te-scoring', 'flex-scoring'].includes(id) && (
        <div className="text-white">Simulator nicht gefunden.</div>
      )}
    </main>
  );
}

