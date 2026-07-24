import { holeLigastatistiken } from '@/app/utils/sleeperAPI/statsService';
import LigastatistikenPage from './client-page';

export default async function Page() {
  const stats = await holeLigastatistiken();

  if (!Array.isArray(stats)) {
    return <div className="p-6 text-red-500">Fehler beim Laden der Statistiken.</div>;
  }

  return <LigastatistikenPage initialStats={stats} />;
}
