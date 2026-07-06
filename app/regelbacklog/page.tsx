// app/regelbacklog/page.tsx
import Link from 'next/link';

const regelVorschlaege = [
  { 
    id: 'quarterback', 
    title: 'QB Scoring Simulation', 
    description: 'Vergleich Standard vs. benutzerdefiniertes Scoring für Quarterbacks.' 
  },
  { 
    id: 'kicker-penalty', 
    title: 'Kicker Skill & Penalty Anpassung', 
    description: 'Visualisierung der Auswirkungen auf 0-19 Yard Misses.' 
  },
];

export default function RegelBacklogPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Regel-Backlog</h1>
      <div className="grid gap-4">
        {regelVorschlaege.map((regel) => (
          <Link href={`/regelbacklog/${regel.id}`} key={regel.id}>
            <div className="p-4 border rounded hover:bg-slate-800 transition-colors">
              <h2 className="text-xl font-semibold">{regel.title}</h2>
              <p className="text-slate-400">{regel.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}