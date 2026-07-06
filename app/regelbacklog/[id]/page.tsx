// app/regelbacklog/[id]/page.tsx
import ScoringSimulator from '../../components/ScoringSimulator';

export default async function RegelAnalysePage({ params }: { params: { id: string } }) {
  const { id } = await params;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Analyse: {id.toUpperCase()}</h1>
      
      {/* Wir rendern nur die Komponente, wenn die ID 'quarterback' ist */}
      {id === 'quarterback' ? (
        <ScoringSimulator />
      ) : (
        <div className="p-4 border border-dashed rounded">
          <p>Für diese Regeländerung existiert noch keine Analyse-Visualisierung.</p>
        </div>
      )}
    </div>
  );
}